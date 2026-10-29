import { createElement, lazy, type ComponentType } from 'react'

export type Preloadable<P extends object> = ComponentType<P> & { preload: () => Promise<void> }

/**
 * React.lazy with a `preload()` handle. Once the chunk has loaded (preloaded or rendered once) the
 * component renders synchronously, so prefetched sections never flash a Suspense fallback.
 * A failed load is forgotten, so the next attempt retries the request.
 */
export function lazyWithPreload<P extends object>(load: () => Promise<{ default: ComponentType<P> }>): Preloadable<P> {
  let loaded: ComponentType<P> | null = null
  let pending: Promise<void> | null = null
  const preload = () => {
    pending ??= load().then(
      mod => { loaded = mod.default },
      err => { pending = null; throw err },
    )
    return pending
  }
  const Lazy = lazy(() => preload().then(() => ({ default: loaded as ComponentType<P> })))
  const Section = (props: P) => createElement(loaded ?? Lazy, props)
  return Object.assign(Section, { preload })
}
