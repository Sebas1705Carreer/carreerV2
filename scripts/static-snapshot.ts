import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import {
  ASSET_FILES, BANNER_FILE, BANNER_HEIGHT, BANNER_WIDTH, BANNER_WIDTHS, CARD_BANNER_SIZES, ICON_FILE, ICON_WIDTHS, IMAGES_ELEMENT_ID,
  MANIFEST_ELEMENT_ID, assetRepo, assetUrl, resolveBanner, responsiveSource, type AssetManifest, type ImageKind, type ImageVariants,
} from '../src/lib/projectAssets'


/*
 * Vite plugin: injects a static, crawlable HTML snapshot of the main sections
 * (built from the public/data/*.json fallback) inside <div id="root">.
 * Crawlers and no-JS clients see real content; React's createRoot() replaces
 * it on the first render, so the app itself is untouched.
 */

type ML = string | Record<string, string>
const loc = (v: ML | undefined, lang = 'en') => (typeof v === 'string' ? v : v?.[lang] ?? v?.en ?? '')
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const read = (name: string) => JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'))

const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`

export type SnapshotProject = {
  name: string; context: string; desc: ML; tags: string[]; github: string | null; demo: string | null
  imageUrl?: string | null; imageAlt?: ML | null
}

/** The static HTML only shows repo banners the build confirmed: an unchecked repo counts as missing */
const confirmedOnly = (manifest: AssetManifest, p: SnapshotProject): AssetManifest => {
  const repo = assetRepo(p.github)
  return repo && !manifest[repo] ? { ...manifest, [repo]: [] } : manifest
}

/**
 * Lazy, size-reserved 2:1 banner: API image_url, else the repo's banner.png when the build-time
 * manifest confirmed it exists; empty when the project has neither.
 */
export const projectImage = (p: SnapshotProject, manifest: AssetManifest = {}, variants: ImageVariants = {}) => {
  const banner = resolveBanner(p, { lang: 'en', manifest: confirmedOnly(manifest, p) })
  if (!banner.src) return ''
  const repo = banner.source === 'repo' ? assetRepo(p.github) : null
  const set = repo ? responsiveSource(variants, repo, 'banner') : null
  const src = set ? `${esc(set.src)}" srcset="${esc(set.srcSet)}" sizes="${CARD_BANNER_SIZES}` : esc(banner.src)
  return `<img src="${src}" alt="${esc(banner.alt)}" width="${BANNER_WIDTH}" height="${BANNER_HEIGHT}" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto;aspect-ratio:2/1;object-fit:cover;margin:.25rem 0">`
}

// ── Build-time asset manifest ────────────────────────────────────────────────

type Fetch = typeof fetch

/** HEAD one URL: true (2xx), false (404/410), null (anything else: timeout, network, 5xx, 429) */
async function head(url: string, fetchFn: Fetch, timeoutMs: number): Promise<boolean | null> {
  try {
    const res = await fetchFn(url, { method: 'HEAD', signal: AbortSignal.timeout(timeoutMs) })
    if (res.ok) return true
    if (res.status === 404 || res.status === 410) return false
    return null
  } catch {
    return null
  }
}

/**
 * Checks which portfolio asset files each project's repo has. A repo whose checks were not all
 * conclusive is left out (the runtime then treats it as unknown and tries optimistically).
 */
export async function checkAssets(
  projects: Array<{ github: string | null }>,
  { fetchFn = fetch, timeoutMs = 4000 }: { fetchFn?: Fetch; timeoutMs?: number } = {},
): Promise<AssetManifest> {
  const repos = [...new Set(projects.map(p => assetRepo(p.github)).filter((r): r is string => !!r))]
  const entries = await Promise.all(repos.map(async repo => {
    const results = await Promise.all(ASSET_FILES.map(f => head(assetUrl(repo, f), fetchFn, timeoutMs)))
    if (results.some(r => r === null)) return null
    return [repo, ASSET_FILES.filter((_, i) => results[i])] as const
  }))
  return Object.fromEntries(entries.filter((e): e is NonNullable<typeof e> => !!e))
}

/** Inline JSON for index.html; `<` is escaped so the payload can never close the script element */
export const manifestScript = (manifest: AssetManifest) =>
  `<script type="application/json" id="${MANIFEST_ELEMENT_ID}">${JSON.stringify(manifest).replace(/</g, '\\u003c')}</script>`

export const projectItem = (p: SnapshotProject, manifest: AssetManifest = {}, variants: ImageVariants = {}) => {
  const links = [p.github && link(p.github, 'GitHub'), p.demo && link(p.demo, 'Demo')].filter(Boolean).join(' · ')
  return `<li>${projectImage(p, manifest, variants)}<strong>${esc(p.name)}</strong> — ${esc(loc(p.desc))} <em>(${esc((p.tags ?? []).slice(0, 6).join(', '))})</em>${links ? ` ${links}` : ''}</li>`
}

export function buildSnapshot(base: string, manifest: AssetManifest = {}, variants: ImageVariants = {}): string {
  const personal = read('personal')
  const jobs = read('jobs') as Array<{ role: ML; company: string; companyUrl?: string; period: ML; desc: ML }>
  const projects = read('projects') as { work: SnapshotProject[]; featured: SnapshotProject[] }
  const education = read('education') as { items: Array<{ degree: ML; school: string; period: ML }>; certs: Array<{ name: ML; issuer: string; date: string; url: string | null }> }

  const name = 'Sebastián Ramiro Entrerrios García'
  // Same availability line as the hero (it lives in the i18n resources, not in the API data)
  const availability = (JSON.parse(readFileSync('src/i18n/locales/en/hero.json', 'utf8')) as { hero: { availability: string } }).hero.availability
  return `
<div id="static-shell" style="max-width:56rem;margin:0 auto;padding:2rem 1rem;font-family:'Inter Variable',Inter,system-ui,sans-serif;line-height:1.6;color:#1e293b">
  <header>
    <p>${esc(loc(personal.greeting))}</p>
    <h1>${esc(name)}</h1>
    <p><strong>${esc(loc(personal.role))}</strong></p>
    <p>${esc(loc(personal.tagline))}</p>
    <p>${esc(availability)}</p>
    <p>${esc(loc(personal.bio))}</p>
    <p>
      ${link(`${base}cv/cv-en.pdf`, 'Download CV (PDF, English)')} ·
      ${link(`${base}cv/cv-es.pdf`, 'Descargar CV (PDF, Español)')} ·
      ${link(personal.social.github, 'GitHub')} ·
      ${link(personal.social.linkedin, 'LinkedIn')} ·
      ${link(`mailto:${personal.email}`, personal.email)}
    </p>
    <nav aria-label="Sections">
      ${['about', 'skills', 'experience', 'projects', 'education', 'contact'].map(s => link(`#${s}`, s[0].toUpperCase() + s.slice(1))).join(' · ')}
    </nav>
  </header>
  <section id="experience-static">
    <h2>Experience</h2>
    <ul>
      ${jobs.map(j => `<li><strong>${esc(loc(j.role))}</strong> — ${j.companyUrl ? link(j.companyUrl, j.company) : esc(j.company)} (${esc(loc(j.period))}). ${esc(loc(j.desc))}</li>`).join('\n      ')}
    </ul>
  </section>
  <section id="projects-static">
    <h2>Projects</h2>
    <h3>Work</h3>
    <ul>
      ${projects.work.map(p => projectItem(p, manifest, variants)).join('\n      ')}
    </ul>
    <h3>Personal &amp; academic</h3>
    <ul>
      ${projects.featured.map(p => projectItem(p, manifest, variants)).join('\n      ')}
    </ul>
  </section>
  <section id="education-static">
    <h2>Education</h2>
    <ul>
      ${education.items.map(e => `<li><strong>${esc(loc(e.degree))}</strong> — ${esc(e.school)} (${esc(loc(e.period))})</li>`).join('\n      ')}
    </ul>
    <h3>Certifications</h3>
    <ul>
      ${education.certs.map(c => `<li>${c.url ? link(c.url, loc(c.name)) : esc(loc(c.name))} — ${esc(c.issuer)}, ${esc(c.date)}</li>`).join('\n      ')}
    </ul>
  </section>
</div>`
}

// ── Build-time responsive images ─────────────────────────────────────────────

/** A generated file, emitted into dist/ at `fileName` */
export interface GeneratedImage { fileName: string; source: Uint8Array }
export interface ImageStats { kind: ImageKind; count: number; pngBytes: number; webpBytes: Record<number, number> }
export interface ImageBuild { variants: ImageVariants; files: GeneratedImage[]; stats: ImageStats[] }
export type Resize = (png: Uint8Array, width: number, kind: ImageKind) => Promise<Uint8Array>

const KIND_FILE: Record<ImageKind, string> = { banner: BANNER_FILE, icon: ICON_FILE }
const KIND_WIDTHS: Record<ImageKind, readonly number[]> = { banner: BANNER_WIDTHS, icon: ICON_WIDTHS }
export const GENERATED_DIR = 'generated/portfolio'

/** sharp-backed resizer (imported lazily so tests and dev never load the native module) */
export async function sharpResize(): Promise<Resize> {
  const { default: sharp } = await import('sharp')
  return async (png, width, kind) => new Uint8Array(await sharp(png)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: kind === 'banner' ? 74 : 82, effort: 6 })
    .toBuffer())
}

/**
 * Downloads every banner/icon the manifest confirmed and re-encodes it as WebP at each width
 * (banners 400/800w, icons 96/192w), with content-hashed file names. A repo image that fails to
 * download or convert is simply left out, so the site keeps using its raw PNG.
 */
export async function buildImages(
  manifest: AssetManifest,
  { base, resize, fetchFn = fetch, timeoutMs = 15000, log = console.warn }:
  { base: string; resize: Resize; fetchFn?: Fetch; timeoutMs?: number; log?: (msg: string) => void },
): Promise<ImageBuild> {
  const variants: ImageVariants = {}
  const files: GeneratedImage[] = []
  const stats: Record<ImageKind, ImageStats> = {
    banner: { kind: 'banner', count: 0, pngBytes: 0, webpBytes: {} },
    icon: { kind: 'icon', count: 0, pngBytes: 0, webpBytes: {} },
  }
  const jobs = Object.entries(manifest).flatMap(([repo, present]) =>
    (['banner', 'icon'] as const).filter(kind => present.includes(KIND_FILE[kind])).map(kind => ({ repo, kind })))

  await Promise.all(jobs.map(async ({ repo, kind }) => {
    try {
      const res = await fetchFn(assetUrl(repo, KIND_FILE[kind]), { signal: AbortSignal.timeout(timeoutMs) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const png = new Uint8Array(await res.arrayBuffer())
      const slug = repo.replace(/[^\w.-]/g, '-')
      const out: Record<string, string> = {}
      const made: GeneratedImage[] = []
      for (const width of KIND_WIDTHS[kind]) {
        const source = await resize(png, width, kind)
        const hash = createHash('sha256').update(source).digest('hex').slice(0, 8)
        const fileName = `${GENERATED_DIR}/${slug}-${kind}-${width}.${hash}.webp`
        made.push({ fileName, source })
        out[width] = `${base}${fileName}`
      }
      // Only commit a repo image once every width succeeded
      files.push(...made)
      ;(variants[repo] ??= {})[kind] = out
      const st = stats[kind]
      st.count++
      st.pngBytes += png.byteLength
      KIND_WIDTHS[kind].forEach((w, i) => { st.webpBytes[w] = (st.webpBytes[w] ?? 0) + made[i].source.byteLength })
    } catch (err) {
      log(`[static-snapshot] ${repo} ${kind}: kept the raw PNG (${(err as Error).message})`)
    }
  }))
  return { variants, files, stats: [stats.banner, stats.icon] }
}

const kb = (n: number) => `${(n / 1024).toFixed(0)} KB`
export const describeStats = (s: ImageStats) =>
  `${s.count} ${s.kind}s: PNG ${kb(s.pngBytes)} → WebP ${Object.entries(s.webpBytes).map(([w, n]) => `${w}w ${kb(n)}`).join(', ')}`

/** Inline JSON for index.html, like the manifest */
export const imagesScript = (variants: ImageVariants) =>
  `<script type="application/json" id="${IMAGES_ELEMENT_ID}">${JSON.stringify(variants).replace(/</g, '\\u003c')}</script>`

/**
 * Production builds HEAD-check every project's .github/portfolio/ files (short timeout) and inline
 * the result as a manifest, so the site only requests assets that exist. Each confirmed banner and
 * icon is then turned into small WebP variants served from dist/ (PORTFOLIO_IMAGES=0 skips that).
 * Dev skips the checks (empty manifest: assets are tried optimistically), as does PORTFOLIO_ASSETS_CHECK=0.
 */
export function staticSnapshot(): Plugin {
  let base = '/'
  let isBuild = false
  let manifest: Promise<AssetManifest> | null = null
  let images: Promise<ImageBuild> | null = null
  const getManifest = (): Promise<AssetManifest> => {
    if (!isBuild || process.env.PORTFOLIO_ASSETS_CHECK === '0') return Promise.resolve({})
    if (!manifest) {
      const projects = read('projects') as { work: SnapshotProject[]; featured: SnapshotProject[] }
      manifest = checkAssets([...projects.work, ...projects.featured]).then(m => {
        const found = Object.values(m).reduce((n, files) => n + files.length, 0)
        console.log(`[static-snapshot] portfolio assets: ${Object.keys(m).length} repos checked, ${found} files found`)
        return m
      })
    }
    return manifest
  }
  const getImages = (): Promise<ImageBuild> => {
    if (!images) {
      images = getManifest().then(async m => {
        if (!isBuild || process.env.PORTFOLIO_IMAGES === '0' || !Object.keys(m).length) return { variants: {}, files: [], stats: [] }
        let resize: Resize
        try { resize = await sharpResize() } catch (err) {
          console.warn(`[static-snapshot] sharp unavailable, keeping raw PNGs (${(err as Error).message})`)
          return { variants: {}, files: [], stats: [] }
        }
        const built = await buildImages(m, { base, resize })
        for (const s of built.stats) console.log(`[static-snapshot] portfolio images: ${describeStats(s)}`)
        return built
      })
    }
    return images
  }
  return {
    name: 'static-snapshot',
    configResolved(config) { base = config.base; isBuild = config.command === 'build' },
    async generateBundle() {
      for (const file of (await getImages()).files) this.emitFile({ type: 'asset', fileName: file.fileName, source: file.source })
    },
    async transformIndexHtml(html) {
      const m = await getManifest()
      const { variants } = await getImages()
      return html
        .replace('<div id="root"></div>', `<div id="root">${buildSnapshot(base, m, variants)}</div>`)
        .replace('</head>', `  ${manifestScript(m)}\n  ${imagesScript(variants)}\n  </head>`)
    },
  }
}
