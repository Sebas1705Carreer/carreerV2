import { useState, useEffect, useCallback, useRef } from 'react'

// ── Pure routing helpers (unit-tested in useSection.test.ts) ──────────────────

/** Maps a location hash ('#projects' or 'projects') to a section index; unknown → 0 (hero). */
export function sectionIndexFromHash(hash: string, sectionKeys: readonly string[]): number {
  const key = hash.startsWith('#') ? hash.slice(1) : hash
  const i = sectionKeys.indexOf(key)
  return i >= 0 ? i : 0
}

/** URL to push for a section: the hero keeps a clean URL, the rest use a hash deep link. */
export function sectionUrl(index: number, sectionKeys: readonly string[], pathname: string, search = ''): string {
  return index === 0 ? pathname + search : `#${sectionKeys[index]}`
}

/** Clamps a relative step (+1 / -1) to the deck bounds. */
export function stepIndex(current: number, delta: number, total: number): number {
  return Math.min(Math.max(current + delta, 0), total - 1)
}

/**
 * Slide-deck section state with hash deep links: #projects opens the projects
 * section directly, navigation pushes history entries so browser back/forward
 * walk the deck, and the hero keeps a clean URL (no hash).
 *
 * `enabled = false` (single-page view) keeps the state but detaches the global
 * key / wheel / swipe / popstate handlers, so the document scrolls natively.
 */
export function useSection(sectionKeys: readonly string[], enabled = true) {
  const initial = () => sectionIndexFromHash(window.location.hash, sectionKeys)
  const [current, setCurrent] = useState(initial)
  const [direction, setDirection] = useState(1)
  const locked = useRef(false)
  const currentRef = useRef(current)
  useEffect(() => { currentRef.current = current }, [current])

  const go = useCallback(
    (index: number, push: boolean) => {
      if (index === currentRef.current) return
      setDirection(index > currentRef.current ? 1 : -1)
      setCurrent(index)
      if (push) history.pushState(null, '', sectionUrl(index, sectionKeys, window.location.pathname, window.location.search))
    },
    [sectionKeys],
  )

  const navigate = useCallback(
    (index: number) => {
      if (locked.current || index === currentRef.current) return
      locked.current = true
      setTimeout(() => { locked.current = false }, 700)
      go(index, true)
    },
    [go],
  )

  const next = useCallback(() => navigate(stepIndex(currentRef.current, 1, sectionKeys.length)), [navigate, sectionKeys])
  const prev = useCallback(() => navigate(stepIndex(currentRef.current, -1, sectionKeys.length)), [navigate, sectionKeys])

  // Browser back/forward (and manual hash edits) drive the deck
  useEffect(() => {
    if (!enabled) return
    const onPop = () => go(sectionIndexFromHash(window.location.hash, sectionKeys), false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [go, sectionKeys, enabled])

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[data-modal]')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, enabled])

  useEffect(() => {
    if (!enabled) return
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 30) return
      if (document.querySelector('[data-modal]')) return
      const scrollable = (e.target as HTMLElement).closest('[data-scrollable]') as HTMLElement | null
      if (scrollable) {
        const atBottom = scrollable.scrollTop + scrollable.clientHeight >= scrollable.scrollHeight - 4
        const atTop = scrollable.scrollTop <= 4
        if (e.deltaY > 0 && !atBottom) return
        if (e.deltaY < 0 && !atTop) return
      }
      if (e.deltaY > 0) next(); else prev()
    }
    window.addEventListener('wheel', onWheel, { passive: true })
    return () => window.removeEventListener('wheel', onWheel)
  }, [next, prev, enabled])

  useEffect(() => {
    if (!enabled) return
    let startX = 0
    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (document.querySelector('[data-modal]')) return
      const dx = startX - e.changedTouches[0].clientX
      const dy = startY - e.changedTouches[0].clientY
      // Only treat as horizontal swipe if predominantly horizontal
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) next(); else prev()
      }
    }
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [next, prev, enabled])

  return { current, direction, navigate, next, prev }
}
