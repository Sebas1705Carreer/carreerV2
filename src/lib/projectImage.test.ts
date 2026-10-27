import { describe, expect, it } from 'vitest'
import { projectImageAlt, safeImageUrl } from './projectImage'

describe('safeImageUrl', () => {
  it('keeps absolute https URLs (trimmed)', () => {
    expect(safeImageUrl('https://sebas1705carreer.github.io/carreerV2/projects/a.webp')).toBe('https://sebas1705carreer.github.io/carreerV2/projects/a.webp')
    expect(safeImageUrl('  https://example.com/a.webp?v=2 ')).toBe('https://example.com/a.webp?v=2')
  })

  it('rejects anything else', () => {
    for (const v of [undefined, null, '', '   ', 42, {}, 'http://example.com/a.webp', 'javascript:alert(1)', 'data:image/png;base64,AA', '/projects/a.webp', 'https://', 'https://a b.webp']) {
      expect(safeImageUrl(v), String(v)).toBeNull()
    }
  })
})

describe('projectImageAlt', () => {
  it('uses the alt in the current language, then English', () => {
    const p = { name: 'YouKnow', imageAlt: { en: 'Home screen', es: 'Pantalla de inicio' } }
    expect(projectImageAlt(p, 'es')).toBe('Pantalla de inicio')
    expect(projectImageAlt(p, 'en')).toBe('Home screen')
    expect(projectImageAlt({ name: 'YouKnow', imageAlt: { en: 'Home screen' } }, 'es')).toBe('Home screen')
  })

  it('falls back to the project name when the alt is missing or blank', () => {
    expect(projectImageAlt({ name: 'YouKnow' }, 'en')).toBe('YouKnow')
    expect(projectImageAlt({ name: 'YouKnow', imageAlt: null }, 'en')).toBe('YouKnow')
    expect(projectImageAlt({ name: 'YouKnow', imageAlt: { en: '  ', es: '' } }, 'es')).toBe('YouKnow')
  })
})
