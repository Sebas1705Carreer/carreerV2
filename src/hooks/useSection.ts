import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Slide-deck section state with hash deep links: #projects opens the projects
 * section directly, navigation pushes history entries so browser back/forward
 * walk the deck, and the hero keeps a clean URL (no hash).
 */
export function useSection(sectionKeys: readonly string[]) {
  const initial = () => {
    const i = sectionKeys.indexOf(window.location.hash.slice(1))
    return i >= 0 ? i : 0
  }
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
      if (push) {
        const url = index === 0
          ? window.location.pathname + window.location.search
          : `#${sectionKeys[index]}`
        history.pushState(null, '', url)
      }
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

  const next = useCallback(() => navigate(Math.min(currentRef.current + 1, sectionKeys.length - 1)), [navigate, sectionKeys])
  const prev = useCallback(() => navigate(Math.max(currentRef.current - 1, 0)), [navigate])

  // Browser back/forward (and manual hash edits) drive the deck
  useEffect(() => {
    const onPop = () => {
      const i = sectionKeys.indexOf(window.location.hash.slice(1))
      go(i >= 0 ? i : 0, false)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [go, sectionKeys])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector('[data-modal]')) return
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev])

  useEffect(() => {
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
  }, [next, prev])

  useEffect(() => {
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
  }, [next, prev])

  return { current, direction, navigate, next, prev }
}
