import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CV_FULL_NAME } from '../src/components/cv/profiles'

const html = readFileSync('index.html', 'utf8')
const sitemap = readFileSync('public/sitemap.xml', 'utf8')
const BASE = 'https://sebas1705carreer.github.io/carreerV2/'

describe('SEO tags', () => {
  it('allows indexing and has the canonical URL of the project site', () => {
    expect(html).toMatch(/<meta name="robots" content="index, ?follow"/)
    expect(html).toContain(`<link rel="canonical" href="${BASE}" />`)
  })

  it('lists only real URLs in the sitemap: no fragments, all under the site', () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
    expect(locs.length).toBeGreaterThan(0)
    for (const loc of locs) {
      expect(loc).not.toContain('#')
      expect(loc.startsWith(BASE)).toBe(true)
    }
    expect(locs).toContain(BASE)
  })
})

describe('the name is spelled one way in the code', () => {
  // Same spelling as the live API's personal.name; the data itself is not changed by this repo
  const NAME = 'Sebastián Entrerrios García'

  it('matches in the title, the meta tags and the JSON-LD', () => {
    expect(html).toContain(`<title>${NAME} —`)
    expect(html).toContain(`<meta name="author" content="${NAME}" />`)
    expect(html).toContain(`"name": "${NAME}"`)
    expect(html).not.toContain('Ramiro Entrerrios')
  })

  it('matches in the CV documents', () => {
    expect(CV_FULL_NAME).toBe(NAME)
  })

  it('matches the fallback data the page starts from', () => {
    expect(JSON.parse(readFileSync('public/data/personal.json', 'utf8')).name).toBe(NAME)
  })
})
