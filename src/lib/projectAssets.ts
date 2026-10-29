import { localize, type ML } from './localize'
import { safeImageUrl } from './projectImage'

/*
 * Portfolio assets standard (v1): every project carries its own visuals in its repository under
 * `.github/portfolio/` (icon.png, banner.png, portfolio.json, case-study.<lang>.md). This module is
 * pure: it maps a project's `github` URL to those raw.githubusercontent URLs and decides, per asset,
 * what to show (API override → repo asset → generated fallback). Fetching lives in assetLoader.ts.
 */

export const ASSET_DIR = '.github/portfolio'
export const ICON_FILE = 'icon.png'
export const BANNER_FILE = 'banner.png'
export const META_FILE = 'portfolio.json'
export const caseStudyFile = (lang: string) => `case-study.${lang}.md`
export const CASE_STUDY_LANGS = ['en', 'es'] as const

/** Every file the standard defines, in a stable order (the build-time manifest checks these) */
export const ASSET_FILES = [ICON_FILE, BANNER_FILE, META_FILE, ...CASE_STUDY_LANGS.map(caseStudyFile)]

/** Banner intrinsic size (GitHub social-preview size, 2:1) and icon size (1:1) */
export const BANNER_WIDTH = 1280
export const BANNER_HEIGHT = 640
export const ICON_SIZE = 512

/** Projects shown first, as large banner cards, in this order */
export const FEATURED_IDS = ['owlsplit', 'haltera', 'templetry', 'winforge', 'career-ecosystem']

/** GitHub owners/repos: letters, digits, `-`, `_`, `.` (no `..`) */
const NAME = /^[A-Za-z0-9_.-]+$/
const validName = (s: string) => NAME.test(s) && s !== '.' && s !== '..'

/**
 * The repository that holds a project's assets, as `owner/repo`:
 * a repo link → that repo; an org/user link → its `.github` repo; anything else → null.
 */
export function assetRepo(github: string | null | undefined): string | null {
  if (typeof github !== 'string') return null
  let url: URL
  try { url = new URL(github.trim()) } catch { return null }
  if (url.protocol !== 'https:' || url.hostname.toLowerCase() !== 'github.com') return null
  const parts = url.pathname.split('/').filter(Boolean)
  if (parts.length === 0) return null
  const owner = parts[0]
  const repo = (parts[1] ?? '.github').replace(/\.git$/i, '')
  if (!validName(owner) || !validName(repo)) return null
  return `${owner}/${repo}`
}

/** raw.githubusercontent URL of one asset file in `owner/repo` */
export const assetUrl = (repo: string, file: string) =>
  `https://raw.githubusercontent.com/${repo}/HEAD/${ASSET_DIR}/${file}`

/** Directory URL (with trailing slash): relative links in a case study resolve against it */
export const assetBaseUrl = (repo: string) => `https://raw.githubusercontent.com/${repo}/HEAD/${ASSET_DIR}/`

export interface AssetUrls {
  repo: string
  icon: string
  banner: string
  meta: string
  caseStudy: (lang: string) => string
}

/** All asset URLs for a project's `github` link, or null for projects without a public repo */
export function projectAssetUrls(github: string | null | undefined): AssetUrls | null {
  const repo = assetRepo(github)
  if (!repo) return null
  return {
    repo,
    icon: assetUrl(repo, ICON_FILE),
    banner: assetUrl(repo, BANNER_FILE),
    meta: assetUrl(repo, META_FILE),
    caseStudy: lang => assetUrl(repo, caseStudyFile(lang)),
  }
}

// ── Build-time manifest ──────────────────────────────────────────────────────

/**
 * `{ "owner/repo": ["icon.png", "banner.png", …] }`: the files found at build time. A repo missing
 * from the manifest is "unknown" (not checked, e.g. a project added after the build, or an offline
 * build) and the runtime tries its assets optimistically; a listed repo is authoritative.
 */
export type AssetManifest = Record<string, string[]>
export type AssetState = 'present' | 'missing' | 'unknown'

export function assetState(manifest: AssetManifest | null | undefined, repo: string, file: string): AssetState {
  const files = manifest?.[repo]
  if (!Array.isArray(files)) return 'unknown'
  return files.includes(file) ? 'present' : 'missing'
}

/** Accepts only the `{ string: string[] }` shape; anything else → {} */
export function parseManifest(value: unknown): AssetManifest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: AssetManifest = {}
  for (const [repo, files] of Object.entries(value as Record<string, unknown>)) {
    if (Array.isArray(files)) out[repo] = files.filter((f): f is string => typeof f === 'string')
  }
  return out
}

// ── portfolio.json ───────────────────────────────────────────────────────────

export interface PortfolioMeta {
  accent?: string
  icon_alt?: ML
  banner_alt?: ML
}

/** `#RGB` or `#RRGGBB` → normalised `#RRGGBB` (upper case); anything else → null */
export function safeAccent(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim())
  if (!m) return null
  const hex = m[1].length === 3 ? m[1].split('').map(c => c + c).join('') : m[1]
  return `#${hex.toUpperCase()}`
}

const safeML = (v: unknown): ML | undefined => {
  if (typeof v === 'string') return v.trim() ? v : undefined
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined
  const out: Record<string, string> = {}
  for (const [k, s] of Object.entries(v as Record<string, unknown>)) if (typeof s === 'string') out[k] = s
  return Object.keys(out).length ? out : undefined
}

/** Validates a fetched portfolio.json; unknown or malformed fields are dropped */
export function parsePortfolioMeta(value: unknown): PortfolioMeta {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const v = value as Record<string, unknown>
  const meta: PortfolioMeta = {}
  const accent = safeAccent(v.accent)
  if (accent) meta.accent = accent
  const iconAlt = safeML(v.icon_alt)
  if (iconAlt) meta.icon_alt = iconAlt
  const bannerAlt = safeML(v.banner_alt)
  if (bannerAlt) meta.banner_alt = bannerAlt
  return meta
}

// ── Resolution ───────────────────────────────────────────────────────────────

export interface AssetProject {
  id?: string
  name: string
  context?: string
  github: string | null
  imageUrl?: string | null
  imageAlt?: ML | null
}

export type AssetSource = 'api' | 'repo' | 'fallback'
export interface ResolvedImage { source: AssetSource; src: string | null; alt: string }

const localized = (v: ML | null | undefined, lang: string) => (v ? localize(v, lang).trim() : '')

/**
 * Banner precedence: API `image_url` → repo `banner.png` (unless the manifest says it is missing,
 * or it already failed to load) → generated fallback. Alt: API `image_alt` → portfolio.json → name.
 */
export function resolveBanner(
  project: AssetProject,
  opts: { lang: string; meta?: PortfolioMeta | null; manifest?: AssetManifest | null; failed?: ReadonlySet<string> },
): ResolvedImage {
  const alt = localized(project.imageAlt, opts.lang) || localized(opts.meta?.banner_alt, opts.lang) || project.name
  const failed = opts.failed ?? new Set<string>()
  const api = safeImageUrl(project.imageUrl)
  if (api && !failed.has(api)) return { source: 'api', src: api, alt }
  const urls = projectAssetUrls(project.github)
  if (urls && !failed.has(urls.banner) && assetState(opts.manifest, urls.repo, BANNER_FILE) !== 'missing') {
    return { source: 'repo', src: urls.banner, alt }
  }
  return { source: 'fallback', src: null, alt }
}

/** Icon: repo `icon.png` → generated fallback (no API override). Alt: portfolio.json → name. */
export function resolveIcon(
  project: AssetProject,
  opts: { lang: string; meta?: PortfolioMeta | null; manifest?: AssetManifest | null; failed?: ReadonlySet<string> },
): ResolvedImage {
  const alt = localized(opts.meta?.icon_alt, opts.lang) || project.name
  const urls = projectAssetUrls(project.github)
  if (urls && !opts.failed?.has(urls.icon) && assetState(opts.manifest, urls.repo, ICON_FILE) !== 'missing') {
    return { source: 'repo', src: urls.icon, alt }
  }
  return { source: 'fallback', src: null, alt }
}

/** Up to two initials: "Career Ecosystem (Folio)" → "CE", "WinForge" → "WF", "Omni-Impostor" → "OI" */
export function projectInitials(name: string): string {
  const words = name.replace(/\(.*?\)/g, ' ').split(/[\s\-_/·.]+/).filter(w => /[\p{L}\p{N}]/u.test(w))
  if (words.length >= 2) return (first(words[0]) + first(words[1])).toUpperCase()
  const word = words[0] ?? name
  // Single CamelCase word: take the capitals (WinForge → WF), else the first two letters
  const caps = word.match(/\p{Lu}/gu)
  if (caps && caps.length >= 2 && word.length > 3) return (caps[0] + caps[1]).toUpperCase()
  return [...word].filter(c => /[\p{L}\p{N}]/u.test(c)).slice(0, 2).join('').toUpperCase() || '?'
}
const first = (w: string) => [...w].find(c => /[\p{L}\p{N}]/u.test(c)) ?? ''

/** Relative luminance (WCAG) of a #RRGGBB colour */
export function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16)
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2]
}

/** Text colour for initials drawn on `accent`: whichever of white / near-black contrasts more */
export function inkOn(accent: string): '#FFFFFF' | '#0F172A' {
  const l = luminance(accent)
  const onWhite = 1.05 / (l + 0.05)
  const onInk = (l + 0.05) / (luminance('#0F172A') + 0.05)
  return onWhite >= onInk ? '#FFFFFF' : '#0F172A'
}

/** Work projects without a public repository are under NDA */
export const isNda = (p: { context?: string; github: string | null }) => p.context === 'work' && !assetRepo(p.github)

export type ProjectGroup = 'work' | 'personal' | 'academic'
export const GROUP_ORDER: ProjectGroup[] = ['work', 'personal', 'academic']

/**
 * Featured projects first (in FEATURED_IDS order, only those that exist), then everything else
 * grouped by context in GROUP_ORDER, keeping the API order inside each group.
 */
export function arrangeProjects<T extends { id: string; context: string }>(projects: T[]): {
  featured: T[]; groups: { key: ProjectGroup; items: T[] }[]
} {
  const byId = new Map(projects.map(p => [p.id, p]))
  const featured = FEATURED_IDS.map(id => byId.get(id)).filter((p): p is T => !!p)
  const rest = projects.filter(p => !FEATURED_IDS.includes(p.id))
  const groupOf = (p: T): ProjectGroup => (GROUP_ORDER as string[]).includes(p.context) ? p.context as ProjectGroup : 'personal'
  const groups = GROUP_ORDER
    .map(key => ({ key, items: rest.filter(p => groupOf(p) === key) }))
    .filter(g => g.items.length > 0)
  return { featured, groups }
}

export type DemoKind = 'play' | 'download' | 'web'

/** What a project's demo link points at, so its button can say so */
export function demoKind(url: string | null | undefined): DemoKind {
  if (!url) return 'web'
  try {
    const u = new URL(url)
    if (u.hostname === 'play.google.com') return 'play'
    if (u.hostname === 'github.com' && /\/releases(\/|$)/.test(u.pathname)) return 'download'
  } catch { /* not a URL: generic */ }
  return 'web'
}

/** id of the inline `<script type="application/json">` holding the build-time manifest */
export const MANIFEST_ELEMENT_ID = 'portfolio-assets'

// ── Build-time responsive variants ───────────────────────────────────────────

/**
 * The repos keep full-size PNGs (the standard). At build time each confirmed banner/icon is
 * downloaded once and re-encoded as small WebP files served by the site itself; this map says which
 * ones exist: `{ "owner/repo": { banner: { "400": url, "800": url }, icon: { "96": url, … } } }`.
 * A repo or kind missing from it (generation failed, offline build, dev) uses the raw PNG.
 */
export const IMAGES_ELEMENT_ID = 'portfolio-images'
export const BANNER_WIDTHS = [400, 800] as const
export const ICON_WIDTHS = [96, 192] as const
export type ImageKind = 'banner' | 'icon'
export type ImageVariants = Record<string, Partial<Record<ImageKind, Record<string, string>>>>

/** Only same-site paths to .webp files (`/…/x.webp`), keyed by a positive integer width */
const SAFE_VARIANT = /^\/(?!\/)[\w\-./]+\.webp$/

/** Accepts only the shape above with safe, same-site URLs; anything else is dropped */
export function parseImageVariants(value: unknown): ImageVariants {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  const out: ImageVariants = {}
  for (const [repo, kinds] of Object.entries(value as Record<string, unknown>)) {
    if (!kinds || typeof kinds !== 'object' || Array.isArray(kinds)) continue
    const entry: ImageVariants[string] = {}
    for (const kind of ['banner', 'icon'] as const) {
      const widths = (kinds as Record<string, unknown>)[kind]
      if (!widths || typeof widths !== 'object' || Array.isArray(widths)) continue
      const clean: Record<string, string> = {}
      for (const [w, url] of Object.entries(widths as Record<string, unknown>)) {
        if (/^[1-9]\d{0,4}$/.test(w) && typeof url === 'string' && SAFE_VARIANT.test(url) && !url.includes('..')) clean[w] = url
      }
      if (Object.keys(clean).length) entry[kind] = clean
    }
    if (Object.keys(entry).length) out[repo] = entry
  }
  return out
}

export interface ResponsiveSource { src: string; srcSet: string }

/**
 * The generated WebP set for a repo image, as `src` (largest width) + `srcSet` (`url 400w, …`);
 * null when the build produced none.
 */
export function responsiveSource(variants: ImageVariants | null | undefined, repo: string, kind: ImageKind): ResponsiveSource | null {
  const widths = variants?.[repo]?.[kind]
  if (!widths) return null
  const sorted = Object.entries(widths).map(([w, url]) => [Number(w), url] as const).sort((a, b) => a[0] - b[0])
  if (!sorted.length) return null
  return { src: sorted[sorted.length - 1][1], srcSet: sorted.map(([w, url]) => `${url} ${w}w`).join(', ') }
}

/** `sizes` for banners in the featured grid (1 → 2 → 3 → 5 columns inside max-w-6xl) */
export const CARD_BANNER_SIZES = '(min-width: 1024px) 230px, (min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw'
