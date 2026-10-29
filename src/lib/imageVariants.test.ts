import { describe, expect, it } from 'vitest'
import { parseImageVariants, responsiveSource } from './projectAssets'

const OWL = 'Sebas1705/Owlsplit'
const b400 = '/carreerV2/generated/portfolio/Sebas1705-Owlsplit-banner-400.ab12cd34.webp'
const b800 = '/carreerV2/generated/portfolio/Sebas1705-Owlsplit-banner-800.ef56ab78.webp'

describe('parseImageVariants', () => {
  it('keeps well-formed, same-site WebP entries', () => {
    const v = { [OWL]: { banner: { 400: b400, 800: b800 }, icon: { 96: '/g/i-96.webp' } } }
    expect(parseImageVariants(JSON.parse(JSON.stringify(v)))).toEqual({
      [OWL]: { banner: { 400: b400, 800: b800 }, icon: { 96: '/g/i-96.webp' } },
    })
  })

  it('drops anything that is not a same-site .webp keyed by a width', () => {
    expect(parseImageVariants({
      [OWL]: {
        banner: {
          400: 'https://evil.example/x.webp', // other origin
          800: '//evil.example/x.webp', // protocol-relative
          1200: '/a/../../x.webp', // traversal
          abc: '/a/x.webp', // not a width
          96: '/a/x.png', // not webp
          192: 'javascript:alert(1)//.webp',
        },
        icon: 'nope',
        other: { 1: '/a/x.webp' },
      },
      'x/y': null,
    })).toEqual({})
  })

  it('accepts only objects', () => {
    expect(parseImageVariants(null)).toEqual({})
    expect(parseImageVariants([])).toEqual({})
    expect(parseImageVariants('x')).toEqual({})
  })
})

describe('responsiveSource', () => {
  it('builds a w-descriptor srcset with the largest width as src', () => {
    const v = { [OWL]: { banner: { 800: b800, 400: b400 } } }
    expect(responsiveSource(v, OWL, 'banner')).toEqual({ src: b800, srcSet: `${b400} 400w, ${b800} 800w` })
  })

  it('is null when the build produced nothing for that repo or kind', () => {
    expect(responsiveSource({}, OWL, 'banner')).toBeNull()
    expect(responsiveSource({ [OWL]: { banner: { 400: b400 } } }, OWL, 'icon')).toBeNull()
    expect(responsiveSource(null, OWL, 'banner')).toBeNull()
  })
})
