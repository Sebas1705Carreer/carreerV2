import { describe, expect, it } from 'vitest'
import { pickLang } from './useLang'

describe('pickLang', () => {
  it('maps any Spanish tag to es', () => {
    expect(pickLang('es')).toBe('es')
    expect(pickLang('es-ES')).toBe('es')
    expect(pickLang('ES-MX')).toBe('es')
  })

  it('maps English and every unsupported language to en', () => {
    expect(pickLang('en')).toBe('en')
    expect(pickLang('en-GB')).toBe('en')
    expect(pickLang('fr')).toBe('en')
    expect(pickLang('')).toBe('en')
    expect(pickLang(undefined)).toBe('en')
    expect(pickLang(null)).toBe('en')
  })
})
