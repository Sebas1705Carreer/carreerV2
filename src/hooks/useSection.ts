import { useState, useEffect, useCallback, useRef } from 'react'

const SECTION_COUNT = 7

export function useSection() {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)
  const locked = useRef(false)

  const navigate = useCallback(
    (index: number) => {
      if (locked.current || index === current) return
      locked.current = true
      setTimeout(() => { locked.current = false }, 700)
      setDirection(index > current ? 1 : -1)
      setCurrent(index)
    },
    [current],
  )

  const next = useCallback(() => navigate(Math.min(current + 1, SECTION_COUNT - 1)), [current, navigate])
  const prev = useCallback(() => navigate(Math.max(current - 1, 0)), [current, navigate])

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
