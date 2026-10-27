import { useEffect, useState } from 'react'
import { loadPortfolioMeta } from '../lib/assetLoader'
import type { PortfolioMeta } from '../lib/projectAssets'

/** The project's portfolio.json (null until it loads, or when the repo has none). Cached per repo. */
export function useProjectMeta(github: string | null | undefined): PortfolioMeta | null {
  const [state, setState] = useState<{ github: string | null | undefined; meta: PortfolioMeta | null }>({ github, meta: null })

  useEffect(() => {
    let alive = true
    loadPortfolioMeta(github).then(meta => { if (alive) setState({ github, meta }) })
    return () => { alive = false }
  }, [github])

  return state.github === github ? state.meta : null
}
