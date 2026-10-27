import { describe, expect, it, vi } from 'vitest'
import { buildSnapshot, checkAssets, manifestScript, projectItem, type SnapshotProject } from './static-snapshot'

describe('projectItem', () => {
  const base: SnapshotProject = { name: 'YouKnow', context: 'academic', desc: { en: 'Quiz app' }, tags: ['Kotlin'], github: null, demo: null }

  it('renders a lazy, size-reserved cover image with the localized alt', () => {
    const html = projectItem({
      ...base,
      imageUrl: 'https://sebas1705carreer.github.io/carreerV2/projects/youknow.webp',
      imageAlt: { en: 'Home "screen" & menu', es: 'Inicio' },
    })
    expect(html).toContain('src="https://sebas1705carreer.github.io/carreerV2/projects/youknow.webp"')
    expect(html).toContain('alt="Home &quot;screen&quot; &amp; menu"')
    expect(html).toContain('loading="lazy"')
    expect(html).toContain('width="1280" height="640"')
    expect(html).toContain('aspect-ratio:2/1')
  })

  it('falls back to the project name for the alt', () => {
    expect(projectItem({ ...base, imageUrl: 'https://example.com/a.webp', imageAlt: null })).toContain('alt="YouKnow"')
  })

  it('renders no image when there is none or the URL is not https', () => {
    expect(projectItem(base)).not.toContain('<img')
    expect(projectItem({ ...base, imageUrl: null })).not.toContain('<img')
    expect(projectItem({ ...base, imageUrl: 'javascript:alert(1)' })).not.toContain('<img')
  })
})

describe('buildSnapshot', () => {
  const html = buildSnapshot('/carreerV2/')

  it('renders the name as the h1 and the section nav', () => {
    expect(html).toContain('<h1>Sebastián Ramiro Entrerrios García</h1>')
    expect(html).toContain('<nav aria-label="Sections">')
    expect(html).toContain('href="#projects"')
  })

  it('prefixes CV links with the configured base path', () => {
    expect(html).toContain('href="/carreerV2/cv/cv-en.pdf"')
    expect(html).toContain('href="/carreerV2/cv/cv-es.pdf"')
  })

  it('escapes HTML in the fallback data', () => {
    // Role contains "&" in the fallback JSON → must be escaped in the markup
    expect(html).toMatch(/Full Stack &amp; Mobile Developer/)
    expect(html).not.toMatch(/Full Stack & Mobile Developer/)
  })
})

describe('repo banners in the snapshot', () => {
  const owl: SnapshotProject = { name: 'Owlsplit', context: 'personal', desc: 'Expenses', tags: [], github: 'https://github.com/Sebas1705/Owlsplit', demo: null }
  const banner = 'https://raw.githubusercontent.com/Sebas1705/Owlsplit/HEAD/.github/portfolio/banner.png'

  it('includes the repo banner only when the build confirmed it', () => {
    expect(projectItem(owl, { 'Sebas1705/Owlsplit': ['banner.png'] })).toContain(`src="${banner}"`)
    expect(projectItem(owl, { 'Sebas1705/Owlsplit': ['icon.png'] })).not.toContain('<img')
    expect(projectItem(owl, {})).not.toContain('<img') // unchecked → not in the static HTML
  })

  it('the API image_url still wins over the repo banner', () => {
    const html = projectItem({ ...owl, imageUrl: 'https://example.com/o.webp' }, { 'Sebas1705/Owlsplit': ['banner.png'] })
    expect(html).toContain('src="https://example.com/o.webp"')
    expect(html).not.toContain(banner)
  })
})

describe('checkAssets', () => {
  const projects = [
    { github: 'https://github.com/Sebas1705/Owlsplit' },
    { github: 'https://github.com/Sebas1705/Owlsplit' }, // deduplicated
    { github: 'https://github.com/Templetry' },
    { github: 'https://github.com/Sebas1705/Flaky' },
    { github: null },
  ]

  it('HEAD-checks each repo once and lists the files that exist', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
      expect(init?.method).toBe('HEAD')
      const u = String(url)
      if (u.includes('/Flaky/')) return new Response(null, { status: u.endsWith('icon.png') ? 503 : 404 })
      if (u.includes('/Owlsplit/') && /(icon|banner)\.png$|case-study\.en\.md$/.test(u)) return new Response(null, { status: 200 })
      return new Response(null, { status: 404 })
    }) as unknown as typeof fetch
    const manifest = await checkAssets(projects, { fetchFn })
    expect(manifest).toEqual({
      'Sebas1705/Owlsplit': ['icon.png', 'banner.png', 'case-study.en.md'],
      'Templetry/.github': [],
      // Flaky: an inconclusive answer (503) leaves the repo unchecked rather than "missing"
    })
    expect(fetchFn).toHaveBeenCalledTimes(3 * 5)
  })

  it('leaves repos out when the network fails or times out', async () => {
    const fetchFn = vi.fn(async () => { throw new Error('offline') }) as unknown as typeof fetch
    expect(await checkAssets(projects, { fetchFn, timeoutMs: 10 })).toEqual({})
  })
})

describe('manifestScript', () => {
  it('inlines the manifest as JSON that cannot break out of the script element', () => {
    const html = manifestScript({ 'a/b': ['</script><script>alert(1)</script>'] })
    expect(html.startsWith('<script type="application/json" id="portfolio-assets">')).toBe(true)
    expect(html.match(/<\/script>/g)).toHaveLength(1)
    expect(JSON.parse(html.replace(/^<script[^>]*>/, '').replace(/<\/script>$/, ''))).toEqual({ 'a/b': ['</script><script>alert(1)</script>'] })
  })
})
