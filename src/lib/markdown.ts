/*
 * Case-study Markdown → sanitised HTML. marked parses (GFM), DOMPurify sanitises the result, then
 * links and images are resolved against the file's directory and restricted to safe schemes.
 * Both libraries are loaded on demand (dynamic import), so they stay out of the main bundle.
 */

const SAFE_LINK = new Set(['https:', 'http:', 'mailto:'])

/** Resolve `value` against `baseUrl`; null unless the result uses one of `allowed` schemes */
export function resolveSafeUrl(value: string, baseUrl: string, allowed: Set<string>): string | null {
  const v = value.trim()
  if (!v) return null
  if (v.startsWith('#')) return v // in-page anchor
  try {
    const url = new URL(v, baseUrl)
    return allowed.has(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

/**
 * Renders untrusted Markdown into HTML that is safe to inject: no scripts, event handlers, styles,
 * forms, iframes or non-http(s) URLs. External links open in a new tab with rel="noopener noreferrer".
 * Needs a DOM (browser, or jsdom in tests).
 */
export async function renderMarkdown(markdown: string, baseUrl: string): Promise<string> {
  const [{ marked }, { default: DOMPurify }] = await Promise.all([import('marked'), import('dompurify')])
  const raw = await marked.parse(markdown, { gfm: true, breaks: false, async: true })
  const fragment = DOMPurify.sanitize(raw, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'iframe', 'object', 'embed', 'svg', 'math'],
    FORBID_ATTR: ['style', 'id', 'name'],
    RETURN_DOM_FRAGMENT: true,
  })

  fragment.querySelectorAll('a').forEach(a => {
    const href = resolveSafeUrl(a.getAttribute('href') ?? '', baseUrl, SAFE_LINK)
    if (!href) { a.removeAttribute('href'); return }
    a.setAttribute('href', href)
    if (!href.startsWith('#') && !href.startsWith('mailto:')) {
      a.setAttribute('target', '_blank')
      a.setAttribute('rel', 'noopener noreferrer')
    }
  })
  fragment.querySelectorAll('img').forEach(img => {
    const src = resolveSafeUrl(img.getAttribute('src') ?? '', baseUrl, new Set(['https:']))
    if (!src) { img.remove(); return }
    img.setAttribute('src', src)
    img.setAttribute('loading', 'lazy')
    img.setAttribute('decoding', 'async')
    img.removeAttribute('srcset')
    if (!img.hasAttribute('alt')) img.setAttribute('alt', '')
  })

  const container = fragment.ownerDocument.createElement('div')
  container.appendChild(fragment)
  return container.innerHTML
}
