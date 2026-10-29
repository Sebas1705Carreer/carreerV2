import {
  CASE_STUDY_LANGS, IMAGES_ELEMENT_ID, MANIFEST_ELEMENT_ID, META_FILE, assetState, caseStudyFile, parseImageVariants, parseManifest,
  parsePortfolioMeta, projectAssetUrls,
  type AssetManifest, type ImageVariants, type PortfolioMeta,
} from './projectAssets'

/*
 * Runtime side of the portfolio assets standard: reads the build-time manifest, fetches
 * portfolio.json and case studies lazily and caches every request (one per URL per page load).
 * Files the manifest marks as missing are never requested, so a deploy whose repos have no assets
 * yet makes no requests at all.
 */

export { MANIFEST_ELEMENT_ID }

let manifestCache: AssetManifest | undefined
let variantsCache: ImageVariants | undefined

/** JSON inlined into index.html under `id`; `{}` when absent or malformed */
function readInlineJson(id: string): unknown {
  try {
    const el = typeof document !== 'undefined' ? document.getElementById(id) : null
    if (el?.textContent) return JSON.parse(el.textContent)
  } catch { /* malformed: ignore it */ }
  return {}
}

/** The manifest the build inlined into index.html (`{}` in dev or when the build was offline) */
export function getManifest(): AssetManifest {
  manifestCache ??= parseManifest(readInlineJson(MANIFEST_ELEMENT_ID))
  return manifestCache
}

/** The responsive WebP variants the build generated (`{}` in dev, offline builds or failed generation) */
export function getImageVariants(): ImageVariants {
  variantsCache ??= parseImageVariants(readInlineJson(IMAGES_ELEMENT_ID))
  return variantsCache
}

type Fetch = typeof fetch
const TIMEOUT_MS = 6000

async function fetchOk(url: string, fetchFn: Fetch): Promise<Response | null> {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timer = ctrl ? setTimeout(() => ctrl.abort(), TIMEOUT_MS) : null
  try {
    const res = await fetchFn(url, { signal: ctrl?.signal })
    return res.ok ? res : null
  } catch {
    return null
  } finally {
    if (timer) clearTimeout(timer)
  }
}

const metaCache = new Map<string, Promise<PortfolioMeta | null>>()

/** portfolio.json for a project's repo (null when there is none); cached per repo */
export function loadPortfolioMeta(
  github: string | null | undefined,
  { manifest = getManifest(), fetchFn = fetch }: { manifest?: AssetManifest; fetchFn?: Fetch } = {},
): Promise<PortfolioMeta | null> {
  const urls = projectAssetUrls(github)
  if (!urls || assetState(manifest, urls.repo, META_FILE) === 'missing') return Promise.resolve(null)
  let p = metaCache.get(urls.meta)
  if (!p) {
    p = fetchOk(urls.meta, fetchFn)
      .then(res => (res ? res.json() : null))
      .then(json => (json == null ? null : parsePortfolioMeta(json)))
      .catch(() => null)
    metaCache.set(urls.meta, p)
  }
  return p
}

export interface CaseStudy {
  /** Language of the file that was found (may differ from the requested one) */
  lang: string
  markdown: string
  /** Directory the file lives in, for resolving relative links and images */
  baseUrl: string
}

const caseCache = new Map<string, Promise<string | null>>()
const MAX_CASE_STUDY_BYTES = 200_000

function loadText(url: string, fetchFn: Fetch): Promise<string | null> {
  let p = caseCache.get(url)
  if (!p) {
    p = fetchOk(url, fetchFn)
      .then(res => (res ? res.text() : null))
      .then(text => (text && text.trim() && text.length <= MAX_CASE_STUDY_BYTES ? text : null))
      .catch(() => null)
    caseCache.set(url, p)
  }
  return p
}

/** Case study in `lang`, falling back to the other language; null when the repo has none */
export async function loadCaseStudy(
  github: string | null | undefined,
  lang: string,
  { manifest = getManifest(), fetchFn = fetch }: { manifest?: AssetManifest; fetchFn?: Fetch } = {},
): Promise<CaseStudy | null> {
  const urls = projectAssetUrls(github)
  if (!urls) return null
  const order = [lang, ...CASE_STUDY_LANGS.filter(l => l !== lang)]
  for (const l of order) {
    if (assetState(manifest, urls.repo, caseStudyFile(l)) === 'missing') continue
    const markdown = await loadText(urls.caseStudy(l), fetchFn)
    if (markdown) return { lang: l, markdown, baseUrl: urls.caseStudy(l).replace(/[^/]+$/, '') }
  }
  return null
}

/** Test hook: forget every cached request and the manifest */
export function resetAssetCaches() {
  metaCache.clear()
  caseCache.clear()
  manifestCache = undefined
  variantsCache = undefined
}
