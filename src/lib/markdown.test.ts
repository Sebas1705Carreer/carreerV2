// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { renderMarkdown, resolveSafeUrl } from './markdown'

const BASE = 'https://raw.githubusercontent.com/Sebas1705/Owlsplit/HEAD/.github/portfolio/'

describe('renderMarkdown', () => {
  it('renders GFM (headings, lists, code, tables)', async () => {
    const html = await renderMarkdown('# Title\n\n- a\n- b\n\n`code`\n\n| x | y |\n|---|---|\n| 1 | 2 |', BASE)
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<li>a</li>')
    expect(html).toContain('<code>code</code>')
    expect(html).toContain('<table>')
  })

  it('strips scripts, event handlers, styles, iframes and forms', async () => {
    const html = await renderMarkdown([
      '<script>alert(1)</script>',
      '<img src="x.png" onerror="alert(2)">',
      '<p style="position:fixed" onclick="alert(3)">hi</p>',
      '<iframe src="https://evil.example"></iframe>',
      '<form action="https://evil.example"><input name="pw"></form>',
      '<svg><script>alert(4)</script></svg>',
    ].join('\n\n'), BASE)
    expect(html).not.toMatch(/<script|onerror|onclick|style=|<iframe|<form|<input|<svg|alert/)
    expect(html).toContain('hi')
  })

  it('drops javascript: and data: URLs', async () => {
    const html = await renderMarkdown('[x](javascript:alert(1)) [y](data:text/html,hi) ![z](data:image/png;base64,AA)', BASE)
    expect(html).not.toMatch(/javascript:|data:/)
    expect(html).not.toContain('<img')
  })

  it('resolves relative links and images against the case-study folder', async () => {
    const html = await renderMarkdown('![Screen](shots/home.png) [ADR](../../docs/adr.md)', BASE)
    expect(html).toContain(`src="${BASE}shots/home.png"`)
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('href="https://raw.githubusercontent.com/Sebas1705/Owlsplit/HEAD/docs/adr.md"')
  })

  it('opens external links in a new tab without opener access', async () => {
    const html = await renderMarkdown('[site](https://owlsplit.web.app) [mail](mailto:a@b.c) [top](#intro)', BASE)
    expect(html).toContain('href="https://owlsplit.web.app/" target="_blank" rel="noopener noreferrer"')
    expect(html).toContain('href="mailto:a@b.c">')
    expect(html).toContain('href="#intro">')
  })
})

describe('resolveSafeUrl', () => {
  const http = new Set(['https:', 'http:'])
  it('resolves relative URLs and rejects other schemes', () => {
    expect(resolveSafeUrl('a.png', BASE, http)).toBe(`${BASE}a.png`)
    expect(resolveSafeUrl('#x', BASE, http)).toBe('#x')
    expect(resolveSafeUrl('  ', BASE, http)).toBeNull()
    expect(resolveSafeUrl('JaVaScRiPt:alert(1)', BASE, http)).toBeNull()
    expect(resolveSafeUrl('vbscript:x', BASE, http)).toBeNull()
  })
})
