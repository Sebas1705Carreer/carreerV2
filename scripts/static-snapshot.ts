import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { ASSET_FILES, BANNER_HEIGHT, BANNER_WIDTH, assetRepo, assetUrl, MANIFEST_ELEMENT_ID, resolveBanner, type AssetManifest } from '../src/lib/projectAssets'


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
export const projectImage = (p: SnapshotProject, manifest: AssetManifest = {}) => {
  const banner = resolveBanner(p, { lang: 'en', manifest: confirmedOnly(manifest, p) })
  if (!banner.src) return ''
  return `<img src="${esc(banner.src)}" alt="${esc(banner.alt)}" width="${BANNER_WIDTH}" height="${BANNER_HEIGHT}" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto;aspect-ratio:2/1;object-fit:cover;margin:.25rem 0">`
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

export const projectItem = (p: SnapshotProject, manifest: AssetManifest = {}) => {
  const links = [p.github && link(p.github, 'GitHub'), p.demo && link(p.demo, 'Demo')].filter(Boolean).join(' · ')
  return `<li>${projectImage(p, manifest)}<strong>${esc(p.name)}</strong> — ${esc(loc(p.desc))} <em>(${esc((p.tags ?? []).slice(0, 6).join(', '))})</em>${links ? ` ${links}` : ''}</li>`
}

export function buildSnapshot(base: string, manifest: AssetManifest = {}): string {
  const personal = read('personal')
  const jobs = read('jobs') as Array<{ role: ML; company: string; companyUrl?: string; period: ML; desc: ML }>
  const projects = read('projects') as { work: SnapshotProject[]; featured: SnapshotProject[] }
  const education = read('education') as { items: Array<{ degree: ML; school: string; period: ML }>; certs: Array<{ name: ML; issuer: string; date: string; url: string | null }> }

  const name = 'Sebastián Ramiro Entrerrios García'
  return `
<div id="static-shell" style="max-width:56rem;margin:0 auto;padding:2rem 1rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#1e293b">
  <header>
    <p>${esc(loc(personal.greeting))}</p>
    <h1>${esc(name)}</h1>
    <p><strong>${esc(loc(personal.role))}</strong></p>
    <p>${esc(loc(personal.tagline))}</p>
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
      ${projects.work.map(p => projectItem(p, manifest)).join('\n      ')}
    </ul>
    <h3>Personal &amp; academic</h3>
    <ul>
      ${projects.featured.map(p => projectItem(p, manifest)).join('\n      ')}
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

/**
 * Production builds HEAD-check every project's .github/portfolio/ files (short timeout) and inline
 * the result as a manifest, so the site only requests assets that exist. Dev skips the checks
 * (empty manifest: assets are tried optimistically), as does PORTFOLIO_ASSETS_CHECK=0.
 */
export function staticSnapshot(): Plugin {
  let base = '/'
  let isBuild = false
  let manifest: Promise<AssetManifest> | null = null
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
  return {
    name: 'static-snapshot',
    configResolved(config) { base = config.base; isBuild = config.command === 'build' },
    async transformIndexHtml(html) {
      const m = await getManifest()
      return html
        .replace('<div id="root"></div>', `<div id="root">${buildSnapshot(base, m)}</div>`)
        .replace('</head>', `  ${manifestScript(m)}\n  </head>`)
    },
  }
}
