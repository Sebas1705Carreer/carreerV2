import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadCaseStudy, loadPortfolioMeta, resetAssetCaches } from './assetLoader'

const OWL = 'https://github.com/Sebas1705/Owlsplit'
const DIR = 'https://raw.githubusercontent.com/Sebas1705/Owlsplit/HEAD/.github/portfolio/'

/** fetch mock answering from a table of URL → body (anything else is a 404) */
function mockFetch(files: Record<string, string>) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input)
    return url in files ? new Response(files[url], { status: 200 }) : new Response('Not Found', { status: 404 })
  }) as unknown as typeof fetch & ReturnType<typeof vi.fn>
}

beforeEach(() => resetAssetCaches())

describe('loadPortfolioMeta', () => {
  it('fetches portfolio.json once per repo and validates it', async () => {
    const fetchFn = mockFetch({ [`${DIR}portfolio.json`]: JSON.stringify({ accent: '#0f766e', banner_alt: { en: 'B' } }) })
    const [a, b] = await Promise.all([loadPortfolioMeta(OWL, { manifest: {}, fetchFn }), loadPortfolioMeta(OWL, { manifest: {}, fetchFn })])
    expect(a).toEqual({ accent: '#0F766E', banner_alt: { en: 'B' } })
    expect(b).toBe(a)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })

  it('makes no request when the manifest says the file is missing, or for NDA projects', async () => {
    const fetchFn = mockFetch({})
    expect(await loadPortfolioMeta(OWL, { manifest: { 'Sebas1705/Owlsplit': ['icon.png'] }, fetchFn })).toBeNull()
    expect(await loadPortfolioMeta(null, { manifest: {}, fetchFn })).toBeNull()
    expect(fetchFn).not.toHaveBeenCalled()
  })

  it('degrades to null on 404, malformed JSON or a network error', async () => {
    expect(await loadPortfolioMeta(OWL, { manifest: {}, fetchFn: mockFetch({}) })).toBeNull()
    resetAssetCaches()
    expect(await loadPortfolioMeta(OWL, { manifest: {}, fetchFn: mockFetch({ [`${DIR}portfolio.json`]: '{nope' }) })).toBeNull()
    resetAssetCaches()
    const failing = vi.fn(async () => { throw new TypeError('offline') }) as unknown as typeof fetch
    expect(await loadPortfolioMeta(OWL, { manifest: {}, fetchFn: failing })).toBeNull()
  })
})

describe('loadCaseStudy', () => {
  it('returns the requested language with its base URL', async () => {
    const fetchFn = mockFetch({ [`${DIR}case-study.es.md`]: '# Hola', [`${DIR}case-study.en.md`]: '# Hello' })
    expect(await loadCaseStudy(OWL, 'es', { manifest: {}, fetchFn })).toEqual({ lang: 'es', markdown: '# Hola', baseUrl: DIR })
  })

  it('falls back to the other language', async () => {
    const fetchFn = mockFetch({ [`${DIR}case-study.en.md`]: '# Hello' })
    expect(await loadCaseStudy(OWL, 'es', { manifest: {}, fetchFn })).toMatchObject({ lang: 'en', markdown: '# Hello' })
  })

  it('skips files the manifest marks missing and caches results', async () => {
    const fetchFn = mockFetch({ [`${DIR}case-study.en.md`]: '# Hello' })
    const manifest = { 'Sebas1705/Owlsplit': ['case-study.en.md'] }
    await loadCaseStudy(OWL, 'es', { manifest, fetchFn })
    await loadCaseStudy(OWL, 'en', { manifest, fetchFn })
    expect(fetchFn).toHaveBeenCalledTimes(1)
    expect(String(fetchFn.mock.calls[0][0])).toBe(`${DIR}case-study.en.md`)
  })

  it('is null when there is no case study (today: no repo has one) or no repo', async () => {
    expect(await loadCaseStudy(OWL, 'en', { manifest: {}, fetchFn: mockFetch({}) })).toBeNull()
    expect(await loadCaseStudy(OWL, 'en', { manifest: { 'Sebas1705/Owlsplit': [] }, fetchFn: mockFetch({}) })).toBeNull()
    expect(await loadCaseStudy(null, 'en', { manifest: {}, fetchFn: mockFetch({}) })).toBeNull()
  })

  it('ignores empty files', async () => {
    expect(await loadCaseStudy(OWL, 'en', { manifest: {}, fetchFn: mockFetch({ [`${DIR}case-study.en.md`]: '  \n' }) })).toBeNull()
  })
})
