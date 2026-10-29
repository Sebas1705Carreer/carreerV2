import { describe, expect, it } from 'vitest'
import { STORAGE_KEY, detectLanguages } from './detector'

const storage = (value: string | null) => ({ getItem: (k: string) => (k === STORAGE_KEY ? value : null) })

describe('detectLanguages', () => {
  it('puts the saved choice first, then the browser languages', () => {
    expect(detectLanguages(storage('es'), { languages: ['en-US', 'en'] })).toEqual(['es', 'en-US', 'en'])
  })

  it('falls back to navigator.language without a languages list', () => {
    expect(detectLanguages(storage(null), { language: 'es-ES' })).toEqual(['es-ES'])
  })

  it('survives blocked storage and a missing navigator', () => {
    const blocked = { getItem: () => { throw new Error('SecurityError') } }
    expect(detectLanguages(blocked, { languages: ['es'] })).toEqual(['es'])
    expect(detectLanguages(null, null)).toEqual([])
  })
})
