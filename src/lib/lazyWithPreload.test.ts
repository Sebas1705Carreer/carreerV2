import { describe, expect, it, vi } from 'vitest'
import { lazyWithPreload } from './lazyWithPreload'

const Comp = () => null

describe('lazyWithPreload', () => {
  it('fetches the chunk once, however often it is preloaded', async () => {
    const load = vi.fn(async () => ({ default: Comp }))
    const Section = lazyWithPreload(load)
    expect(load).not.toHaveBeenCalled() // nothing is fetched up front
    await Promise.all([Section.preload(), Section.preload()])
    await Section.preload()
    expect(load).toHaveBeenCalledTimes(1)
  })

  it('renders the loaded component directly once preloaded (no Suspense round trip)', async () => {
    const Section = lazyWithPreload(async () => ({ default: Comp }))
    await Section.preload()
    const el = (Section as unknown as (p: object) => { type: unknown })({})
    expect(el.type).toBe(Comp)
  })

  it('forgets a failed load so the next attempt retries', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(new Error('chunk 404'))
      .mockResolvedValueOnce({ default: Comp })
    const Section = lazyWithPreload(load)
    await expect(Section.preload()).rejects.toThrow('chunk 404')
    await expect(Section.preload()).resolves.toBeUndefined()
    expect(load).toHaveBeenCalledTimes(2)
  })
})
