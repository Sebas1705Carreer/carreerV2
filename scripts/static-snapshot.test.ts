import { describe, expect, it, vi } from 'vitest'
import { buildImages, buildSnapshot, checkAssets, imagesScript, manifestScript, projectItem, type Resize, type SnapshotProject } from './static-snapshot'

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

  it('serves the generated WebP set (srcset + sizes) when the build produced one', () => {
    const v = { 'Sebas1705/Owlsplit': { banner: { 400: '/carreerV2/g/owl-400.webp', 800: '/carreerV2/g/owl-800.webp' } } }
    const html = projectItem(owl, { 'Sebas1705/Owlsplit': ['banner.png'] }, v)
    expect(html).toContain('src="/carreerV2/g/owl-800.webp"')
    expect(html).toContain('srcset="/carreerV2/g/owl-400.webp 400w, /carreerV2/g/owl-800.webp 800w"')
    expect(html).toContain('sizes="(min-width: 1024px) 230px')
    expect(html).not.toContain(banner)
    // Variants never resurrect a banner the manifest does not confirm
    expect(projectItem(owl, {}, v)).not.toContain('<img')
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

describe('buildImages', () => {
  const RAW = 'https://raw.githubusercontent.com'
  const png = new Uint8Array([137, 80, 78, 71, 1, 2, 3, 4])
  const resize: Resize = async (_png, width, kind) => new TextEncoder().encode(`${kind}:${width}`)

  it('turns every confirmed banner/icon into hashed WebP widths and maps them under the base path', async () => {
    const fetchFn = vi.fn(async () => new Response(png, { status: 200 })) as unknown as typeof fetch
    const built = await buildImages(
      { 'Sebas1705/Owlsplit': ['icon.png', 'banner.png', 'portfolio.json'], 'Templetry/.github': ['banner.png'], 'Sebas1705/Bare': [] },
      { base: '/carreerV2/', resize, fetchFn },
    )
    expect(fetchFn).toHaveBeenCalledWith(`${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/banner.png`, expect.anything())
    expect(fetchFn).toHaveBeenCalledTimes(3)
    const owl = built.variants['Sebas1705/Owlsplit']
    expect(Object.keys(owl.banner!)).toEqual(['400', '800'])
    expect(Object.keys(owl.icon!)).toEqual(['96', '192'])
    expect(owl.banner![400]).toMatch(/^\/carreerV2\/generated\/portfolio\/Sebas1705-Owlsplit-banner-400\.[0-9a-f]{8}\.webp$/)
    expect(built.variants['Templetry/.github'].banner![800]).toMatch(/^\/carreerV2\/generated\/portfolio\/Templetry-\.github-banner-800\.[0-9a-f]{8}\.webp$/)
    expect(built.variants['Sebas1705/Bare']).toBeUndefined()
    expect(built.files).toHaveLength(2 + 2 + 2)
    expect(built.files.map(f => `/carreerV2/${f.fileName}`)).toContain(owl.icon![192])
    expect(built.stats.find(s => s.kind === 'banner')).toMatchObject({ count: 2, pngBytes: 2 * png.byteLength })
  })

  it('keeps the raw PNG (no variants) for an image that fails to download or convert', async () => {
    const fetchFn = vi.fn(async (url: RequestInfo | URL) =>
      String(url).includes('/Gone/') ? new Response(null, { status: 404 }) : new Response(png, { status: 200 })) as unknown as typeof fetch
    const failing: Resize = async (p, w, kind) => { if (kind === 'icon' && w === 192) throw new Error('corrupt'); return resize(p, w, kind) }
    const log = vi.fn()
    const built = await buildImages({ 'Sebas1705/Gone': ['banner.png'], 'Sebas1705/Owlsplit': ['icon.png', 'banner.png'] }, { base: '/', resize: failing, fetchFn, log })
    expect(built.variants).toEqual({ 'Sebas1705/Owlsplit': { banner: expect.any(Object) } })
    expect(built.files.every(f => f.fileName.includes('-banner-'))).toBe(true) // no half-made icon set
    expect(log).toHaveBeenCalledTimes(2)
  })
})

describe('imagesScript', () => {
  it('inlines the variants as JSON that cannot break out of the script element', () => {
    const html = imagesScript({ 'a/b': { banner: { 400: '/x</script>.webp' } } })
    expect(html.startsWith('<script type="application/json" id="portfolio-images">')).toBe(true)
    expect(html.match(/<\/script>/g)).toHaveLength(1)
  })
})
