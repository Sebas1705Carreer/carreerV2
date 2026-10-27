import { describe, expect, it } from 'vitest'
import {
  arrangeProjects, assetRepo, assetState, demoKind, inkOn, isNda, parseManifest, parsePortfolioMeta, projectAssetUrls,
  projectInitials, resolveBanner, resolveIcon, safeAccent,
} from './projectAssets'

const RAW = 'https://raw.githubusercontent.com'

describe('assetRepo', () => {
  it('maps a repo link to owner/repo', () => {
    expect(assetRepo('https://github.com/Sebas1705/Owlsplit')).toBe('Sebas1705/Owlsplit')
    expect(assetRepo('https://github.com/Sebas1705/Owlsplit/')).toBe('Sebas1705/Owlsplit')
    expect(assetRepo('https://github.com/Sebas1705/Owlsplit/tree/main/docs')).toBe('Sebas1705/Owlsplit')
    expect(assetRepo('https://github.com/Sebas1705/Owlsplit.git')).toBe('Sebas1705/Owlsplit')
    expect(assetRepo(' https://GitHub.com/Sebas1705/ad-skipper ')).toBe('Sebas1705/ad-skipper')
  })

  it('maps an org/user link to its .github repo', () => {
    expect(assetRepo('https://github.com/Templetry')).toBe('Templetry/.github')
    expect(assetRepo('https://github.com/Sebas1705Carreer/')).toBe('Sebas1705Carreer/.github')
  })

  it('returns null for missing, non-GitHub or unsafe links', () => {
    for (const v of [null, undefined, '', 'not a url', 'http://github.com/a/b', 'https://gitlab.com/a/b', 'https://github.com/',
      'https://github.com/a/..', 'https://github.com/a%2Fb/c', 'javascript:alert(1)', 'https://github.com.evil.com/a/b']) {
      expect(assetRepo(v), String(v)).toBeNull()
    }
  })
})

describe('projectAssetUrls', () => {
  it('builds raw.githubusercontent URLs under .github/portfolio on HEAD', () => {
    const urls = projectAssetUrls('https://github.com/Sebas1705/Owlsplit')!
    expect(urls.icon).toBe(`${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/icon.png`)
    expect(urls.banner).toBe(`${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/banner.png`)
    expect(urls.meta).toBe(`${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/portfolio.json`)
    expect(urls.caseStudy('es')).toBe(`${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/case-study.es.md`)
  })

  it('uses the org .github repo for org links and nothing for NDA work', () => {
    expect(projectAssetUrls('https://github.com/Templetry')!.banner).toBe(`${RAW}/Templetry/.github/HEAD/.github/portfolio/banner.png`)
    expect(projectAssetUrls(null)).toBeNull()
  })
})

describe('manifest', () => {
  const manifest = parseManifest({ 'a/b': ['icon.png', 7, 'banner.png'], 'c/d': 'nope', 'e/f': [] })

  it('keeps only string lists', () => {
    expect(manifest).toEqual({ 'a/b': ['icon.png', 'banner.png'], 'e/f': [] })
    expect(parseManifest(null)).toEqual({})
    expect(parseManifest(['a'])).toEqual({})
  })

  it('reports present / missing for checked repos and unknown otherwise', () => {
    expect(assetState(manifest, 'a/b', 'banner.png')).toBe('present')
    expect(assetState(manifest, 'a/b', 'portfolio.json')).toBe('missing')
    expect(assetState(manifest, 'e/f', 'icon.png')).toBe('missing')
    expect(assetState(manifest, 'x/y', 'icon.png')).toBe('unknown')
    expect(assetState(undefined, 'a/b', 'icon.png')).toBe('unknown')
  })
})

describe('portfolio.json', () => {
  it('normalises the accent and keeps localized alts', () => {
    expect(parsePortfolioMeta({ accent: '#0f766e', icon_alt: { en: 'Icon', es: 'Icono' }, banner_alt: 'Banner', extra: 1 }))
      .toEqual({ accent: '#0F766E', icon_alt: { en: 'Icon', es: 'Icono' }, banner_alt: 'Banner' })
  })

  it('drops malformed fields (CSS injection in the accent, non-string alts)', () => {
    expect(parsePortfolioMeta({ accent: 'red; background:url(x)', icon_alt: 42, banner_alt: { en: 5 } })).toEqual({})
    expect(parsePortfolioMeta('nope')).toEqual({})
    expect(parsePortfolioMeta(null)).toEqual({})
  })

  it('safeAccent accepts #RGB and #RRGGBB only', () => {
    expect(safeAccent('#abc')).toBe('#AABBCC')
    expect(safeAccent(' #4A5AF0 ')).toBe('#4A5AF0')
    for (const v of ['4A5AF0', '#4A5AF', '#4A5AF0FF', 'rgb(0,0,0)', 7, null]) expect(safeAccent(v), String(v)).toBeNull()
  })
})

describe('resolveBanner (API image_url → repo banner → fallback)', () => {
  const owl = { name: 'Owlsplit', context: 'personal', github: 'https://github.com/Sebas1705/Owlsplit' }
  const banner = `${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/banner.png`
  const api = 'https://sebas1705carreer.github.io/carreerV2/projects/owlsplit.webp'

  it('prefers the API override', () => {
    expect(resolveBanner({ ...owl, imageUrl: api }, { lang: 'en' })).toMatchObject({ source: 'api', src: api })
  })

  it('uses the repo banner when present or unknown, not when the manifest says it is missing', () => {
    expect(resolveBanner(owl, { lang: 'en' })).toMatchObject({ source: 'repo', src: banner })
    expect(resolveBanner(owl, { lang: 'en', manifest: { 'Sebas1705/Owlsplit': ['banner.png'] } })).toMatchObject({ source: 'repo' })
    expect(resolveBanner(owl, { lang: 'en', manifest: { 'Sebas1705/Owlsplit': ['icon.png'] } })).toMatchObject({ source: 'fallback', src: null })
  })

  it('moves to the next source when an image failed to load', () => {
    expect(resolveBanner({ ...owl, imageUrl: api }, { lang: 'en', failed: new Set([api]) })).toMatchObject({ source: 'repo', src: banner })
    expect(resolveBanner({ ...owl, imageUrl: api }, { lang: 'en', failed: new Set([api, banner]) })).toMatchObject({ source: 'fallback' })
  })

  it('falls back for NDA work projects and ignores unsafe API URLs', () => {
    const nda = { name: 'AGEDI System', context: 'work', github: null }
    expect(resolveBanner(nda, { lang: 'en' })).toEqual({ source: 'fallback', src: null, alt: 'AGEDI System' })
    expect(resolveBanner({ ...nda, imageUrl: 'javascript:alert(1)' }, { lang: 'en' }).source).toBe('fallback')
  })

  it('alt: API image_alt → portfolio.json banner_alt → name, in the current language', () => {
    const meta = { banner_alt: { en: 'Owlsplit banner', es: 'Banner de Owlsplit' } }
    expect(resolveBanner({ ...owl, imageAlt: { en: 'API alt', es: 'Alt API' } }, { lang: 'es', meta }).alt).toBe('Alt API')
    expect(resolveBanner(owl, { lang: 'es', meta }).alt).toBe('Banner de Owlsplit')
    expect(resolveBanner(owl, { lang: 'en' }).alt).toBe('Owlsplit')
  })
})

describe('resolveIcon', () => {
  const owl = { name: 'Owlsplit', github: 'https://github.com/Sebas1705/Owlsplit' }
  it('uses the repo icon unless missing or failed', () => {
    const icon = `${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio/icon.png`
    expect(resolveIcon(owl, { lang: 'en', meta: { icon_alt: { en: 'Owl icon' } } })).toEqual({ source: 'repo', src: icon, alt: 'Owl icon' })
    expect(resolveIcon(owl, { lang: 'en', manifest: { 'Sebas1705/Owlsplit': [] } }).source).toBe('fallback')
    expect(resolveIcon(owl, { lang: 'en', failed: new Set([icon]) }).source).toBe('fallback')
    expect(resolveIcon({ name: 'X', github: null }, { lang: 'en' }).source).toBe('fallback')
  })
})

describe('fallback plate helpers', () => {
  it('projectInitials', () => {
    expect(projectInitials('Career Ecosystem (Folio)')).toBe('CE')
    expect(projectInitials('WinForge')).toBe('WF')
    expect(projectInitials('Omni-Impostor')).toBe('OI')
    expect(projectInitials('Owlsplit')).toBe('OW')
    expect(projectInitials('mBapp')).toBe('MB')
    expect(projectInitials('Transportes Chinchón iOS')).toBe('TC')
    expect(projectInitials('Ñu')).toBe('ÑU')
    expect(projectInitials('')).toBe('?')
  })

  it('inkOn picks the more readable text colour', () => {
    expect(inkOn('#0F766E')).toBe('#FFFFFF')
    expect(inkOn('#4A5AF0')).toBe('#FFFFFF')
    expect(inkOn('#FDE68A')).toBe('#0F172A')
    expect(inkOn('#FFFFFF')).toBe('#0F172A')
  })

  it('isNda: work without a public repo', () => {
    expect(isNda({ context: 'work', github: null })).toBe(true)
    expect(isNda({ context: 'work', github: 'https://github.com/a/b' })).toBe(false)
    expect(isNda({ context: 'personal', github: null })).toBe(false)
  })
})

describe('arrangeProjects', () => {
  const p = (id: string, context: string) => ({ id, context })
  it('puts the featured ids first in order, then groups the rest work → personal → academic', () => {
    const { featured, groups } = arrangeProjects([
      p('agedi', 'work'), p('youknow', 'academic'), p('winforge', 'personal'), p('codewars', 'personal'),
      p('owlsplit', 'personal'), p('enigma', 'academic'), p('odd', 'other'),
    ])
    expect(featured.map(x => x.id)).toEqual(['owlsplit', 'winforge'])
    expect(groups.map(g => [g.key, g.items.map(x => x.id)])).toEqual([
      ['work', ['agedi']], ['personal', ['codewars', 'odd']], ['academic', ['youknow', 'enigma']],
    ])
  })

  it('omits empty groups', () => {
    expect(arrangeProjects([p('a', 'work')]).groups.map(g => g.key)).toEqual(['work'])
    expect(arrangeProjects([])).toEqual({ featured: [], groups: [] })
  })
})

describe('demoKind', () => {
  it('labels Play Store, GitHub releases and the rest', () => {
    expect(demoKind('https://play.google.com/store/apps/details?id=x')).toBe('play')
    expect(demoKind('https://github.com/Sebas1705/WinForge/releases/latest')).toBe('download')
    expect(demoKind('https://owlsplit.web.app')).toBe('web')
    expect(demoKind('https://github.com/Sebas1705/WinForge')).toBe('web')
    expect(demoKind(null)).toBe('web')
  })
})
