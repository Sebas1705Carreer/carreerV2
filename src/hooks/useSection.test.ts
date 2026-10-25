import { describe, expect, it } from 'vitest'
import { sectionIndexFromHash, sectionUrl, stepIndex } from './useSection'

const KEYS = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact'] as const

describe('sectionIndexFromHash', () => {
  it('resolves a known hash (with or without the leading #)', () => {
    expect(sectionIndexFromHash('#projects', KEYS)).toBe(4)
    expect(sectionIndexFromHash('contact', KEYS)).toBe(6)
  })

  it('falls back to the hero for an empty or unknown hash', () => {
    expect(sectionIndexFromHash('', KEYS)).toBe(0)
    expect(sectionIndexFromHash('#', KEYS)).toBe(0)
    expect(sectionIndexFromHash('#nope', KEYS)).toBe(0)
    expect(sectionIndexFromHash('#main-content', KEYS)).toBe(0)
  })
})

describe('sectionUrl', () => {
  it('keeps a clean URL for the hero (pathname + search preserved)', () => {
    expect(sectionUrl(0, KEYS, '/carreerV2/', '')).toBe('/carreerV2/')
    expect(sectionUrl(0, KEYS, '/', '?utm=x')).toBe('/?utm=x')
  })

  it('uses a hash deep link for every other section', () => {
    expect(sectionUrl(2, KEYS, '/carreerV2/')).toBe('#skills')
    expect(sectionUrl(6, KEYS, '/')).toBe('#contact')
  })
})

describe('stepIndex', () => {
  it('steps forward and backward', () => {
    expect(stepIndex(2, 1, KEYS.length)).toBe(3)
    expect(stepIndex(2, -1, KEYS.length)).toBe(1)
  })

  it('clamps at both ends of the deck', () => {
    expect(stepIndex(6, 1, KEYS.length)).toBe(6)
    expect(stepIndex(0, -1, KEYS.length)).toBe(0)
  })
})
