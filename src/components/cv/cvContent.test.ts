import { createElement, type ReactElement } from 'react'
import { describe, expect, it } from 'vitest'
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer'
import type { PortfolioRawData } from '../../context/PortfolioDataContext'
import { buildCvContent, displayUrl, groupSkills, portfolioUrl, projectLinks } from './cvContent'
import { CVDocument } from './CVDocument'
import { ROLE_IDS } from './profiles'
import { FEATURED_IDS } from '../../lib/projectAssets'

// The offline snapshot build-cv.mjs falls back to (same shape the API is adapted into)
const snapshot = import.meta.glob<unknown>('/public/data/*.json', { eager: true, import: 'default' })
const read = <T>(name: string): T => snapshot[`/public/data/${name}.json`] as T
const data = {
  personal:  read<PortfolioRawData['personal']>('personal'),
  skills:    read<PortfolioRawData['skills']>('skills'),
  jobs:      read<PortfolioRawData['jobs']>('jobs'),
  projects:  read<PortfolioRawData['projects']>('projects'),
  education: read<PortfolioRawData['education']>('education'),
}
const LANGS = ['en', 'es'] as const
const featuredNames = FEATURED_IDS.map(id => data.projects.featured.find(p => p.id === id)?.name)

/** Everything the HR PDF prints from the content mapping, as one string */
function cvText(lang: 'en' | 'es') {
  const cv = buildCvContent({ lang, role: 'fullstack', ...data })
  return [
    cv.roleTitle, cv.tagline, cv.summary, cv.portfolio.label, ...cv.keywords,
    ...cv.contact.links.map(l => l.label),
    ...cv.skillRows.flatMap(r => [r.label, ...r.names]),
    ...cv.projects.flatMap(p => [p.name, p.desc, ...p.links.map(l => l.label)]),
  ].join('\n')
}

describe('buildCvContent (fullstack, static CV)', () => {
  it.each(LANGS)('%s: headline role is the Senior role from the API', lang => {
    const cv = buildCvContent({ lang, role: 'fullstack', ...data })
    expect(cv.roleTitle).toBe((data.personal.role as Record<string, string>)[lang])
    expect(cv.roleTitle).toContain('Senior')
    expect(cv.summary).toContain('Senior')
  })

  it.each(LANGS)('%s: prints the API tagline', lang => {
    const tagline = (data.personal.tagline as Record<string, string>)[lang]
    expect(tagline).toBeTruthy()
    expect(cvText(lang)).toContain(tagline)
  })

  it.each(LANGS)('%s: Key Projects start with the featured projects in portfolio order', lang => {
    const cv = buildCvContent({ lang, role: 'fullstack', ...data })
    expect(featuredNames.every(Boolean)).toBe(true)
    expect(cv.projects.slice(0, FEATURED_IDS.length).map(p => p.name)).toEqual(featuredNames)
    for (const name of ['Owlsplit', 'Haltera', 'Templetry', 'WinForge', 'Career Ecosystem']) {
      expect(cvText(lang)).toContain(name)
    }
    // plus at least one client project, and every project has a one-line description
    expect(cv.projects.some(p => data.projects.work.some(w => w.id === p.id))).toBe(true)
    expect(cv.projects.every(p => p.desc.length > 0)).toBe(true)
  })

  it.each(LANGS)('%s: lists every API skill, including the iOS / KMP stack', lang => {
    const cv = buildCvContent({ lang, role: 'fullstack', ...data })
    const printed = cv.skillRows.flatMap(r => r.names)
    expect(printed).toHaveLength(data.skills.length)
    expect(new Set(printed)).toEqual(new Set(data.skills.map(s => s.name)))
    for (const name of ['Swift', 'SwiftUI', 'Kotlin Multiplatform']) expect(printed).toContain(name)
    expect(cv.skillRows[0].names[0]).toBe('Kotlin')
  })

  it.each(LANGS)('%s: contact links print plain ASCII addresses and the portfolio', lang => {
    const cv = buildCvContent({ lang, role: 'fullstack', ...data })
    for (const l of cv.contact.links) expect(l.label).toMatch(/^[\x20-\x7E]+$/)
    expect(cv.contact.links.map(l => l.label)).toContain('sebas1705carreer.github.io/carreerV2')
    expect(cvText(lang)).not.toMatch(/https?:\/\//)
  })

  it('every role variant resolves its projects against the data', () => {
    for (const role of ROLE_IDS) {
      for (const lang of LANGS) {
        const cv = buildCvContent({ lang, role, ...data })
        expect(cv.projects.length, `${role}/${lang}`).toBeGreaterThanOrEqual(5)
        expect(cv.roleTitle).toBeTruthy()
        expect(cv.tagline).toBeTruthy()
      }
    }
  })
})

describe('helpers', () => {
  it('displayUrl strips the scheme and percent-encodes non-ASCII slugs', () => {
    expect(displayUrl('https://www.linkedin.com/in/sebastián-garcía/')).toBe('linkedin.com/in/sebasti%C3%A1n-garc%C3%ADa')
    expect(displayUrl('https://github.com/Sebas1705')).toBe('github.com/Sebas1705')
    expect(displayUrl('https://play.google.com/store/apps/details?id=x')).toBe('Google Play')
  })

  it('portfolioUrl derives the site root from the CV URL', () => {
    expect(portfolioUrl({ cvUrl: 'https://example.dev/site/cv/cv-en.pdf' })).toBe('https://example.dev/site/')
    expect(portfolioUrl({})).toBe('https://sebas1705carreer.github.io/carreerV2/')
  })

  it('projectLinks prefers the live site and skips a demo that is the repo releases page', () => {
    expect(projectLinks({ github: 'https://github.com/a/b', demo: 'https://github.com/a/b/releases/latest' }))
      .toEqual([{ url: 'https://github.com/a/b', label: 'github.com/a/b' }])
    expect(projectLinks({ github: 'https://github.com/a/b', demo: 'https://b.web.app' }).map(l => l.label))
      .toEqual(['b.web.app', 'github.com/a/b'])
  })

  it('groupSkills puts priority skills first and unknown categories in a last row', () => {
    const rows = groupSkills([
      { id: 'a', name: 'A', level: 2, category: 'languages' },
      { id: 'b', name: 'B', level: 4, category: 'languages' },
      { id: 'c', name: 'C', level: 1, category: 'languages' },
      { id: 'x', name: 'X', level: 3, category: 'weird' },
    ], ['c'], 'en')
    expect(rows[0].names).toEqual(['C', 'B', 'A'])
    expect(rows.at(-1)).toMatchObject({ key: 'other', names: ['X'] })
  })
})

describe('CVDocument PDF', () => {
  const cases = ROLE_IDS.flatMap(role => LANGS.map(lang => [role, lang] as const))
  it.each(cases)('%s/%s: renders in at most 2 A4 pages', async (role, lang) => {
    const doc = createElement(CVDocument, { lang, role, ...data }) as unknown as ReactElement<DocumentProps>
    const pdf = await renderToBuffer(doc)
    const pages = pdf.toString('latin1').match(/\/Type \/Page\b(?!s)/g) ?? []
    expect(pages.length).toBeGreaterThanOrEqual(1)
    expect(pages.length).toBeLessThanOrEqual(2)
  }, 30_000)
})
