import { describe, expect, it } from 'vitest'
import { localize, localizeArr } from './localize'

describe('localize', () => {
  it('returns plain strings as-is', () => {
    expect(localize('Hello', 'es')).toBe('Hello')
  })

  it('picks the requested language from a map', () => {
    expect(localize({ en: 'Hello', es: 'Hola' }, 'es')).toBe('Hola')
    expect(localize({ en: 'Hello', es: 'Hola' }, 'en')).toBe('Hello')
  })

  it('falls back to English, then to the first available value', () => {
    expect(localize({ en: 'Hello' }, 'es')).toBe('Hello')
    expect(localize({ fr: 'Bonjour' }, 'es')).toBe('Bonjour')
  })

  it('returns an empty string for null/undefined/empty maps', () => {
    expect(localize(undefined, 'en')).toBe('')
    expect(localize(null, 'en')).toBe('')
    expect(localize({}, 'en')).toBe('')
  })
})

describe('localizeArr', () => {
  it('maps every item and tolerates undefined', () => {
    expect(localizeArr([{ en: 'A', es: 'A-es' }, 'B'], 'es')).toEqual(['A-es', 'B'])
    expect(localizeArr(undefined, 'es')).toEqual([])
  })
})
