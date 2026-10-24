import { createContext, useContext, useEffect, useState } from 'react'
import type { ML } from '../lib/localize'
import { PILLARS, adaptAll } from '../lib/adapters'

// ── Raw data types (mirrors public/data/*.json) ───────────────────────────────

export interface RawSkill {
  id: string
  name: string
  iconUrl?: string
  level: 1 | 2 | 3 | 4
  category: string
}

export interface RawJob {
  id: string
  role: ML
  company: string
  companyUrl: string
  /** YYYY-MM — used to derive the years-of-experience hero stat and ATS CV dates */
  startDate?: string
  /** YYYY-MM, null while the job is current */
  endDate?: string | null
  period: ML
  type: ML
  desc: ML
  /** Rich detail shown in the expandable panel */
  long_desc?: ML
  projects: ML[]
  achievements: ML[]
}

export interface RawProject {
  id: string
  name: string
  context: string
  desc: ML
  long_desc: ML
  tags: string[]
  github: string | null
  demo: string | null
}

export interface RawEduItem {
  degree: ML
  school: string
  period: ML
  detail: ML
  /** Rich detail shown in the expandable panel */
  long_desc?: ML
  icon: string
}

export interface RawCert {
  /** Optional for backwards-compat with cached/fallback data predating it */
  id?: string
  name: ML
  issuer: string
  date: string
  /** null for in-progress certifications */
  url: string | null
  /** Rich detail shown in the expandable panel */
  long_desc?: ML
}

export interface RawSoftSkill {
  icon: string
  name: ML
}

export interface RawPillar {
  icon: string
  title: ML
  desc: ML
}

export interface RawPersonal {
  name: string
  greeting: ML
  role: ML
  tagline: ML
  bio: ML
  email: string
  location: ML
  cvUrl?: string
  social: {
    github: string
    linkedin: string
    codewars: string
  }
  pillars: RawPillar[]
}

// ── Aggregated portfolio data ─────────────────────────────────────────────────

export interface PortfolioRawData {
  personal:   RawPersonal
  softSkills: RawSoftSkill[]
  skills:     RawSkill[]
  jobs:       RawJob[]
  projects:   { work: RawProject[]; featured: RawProject[] }
  education:  { items: RawEduItem[]; certs: RawCert[] }
}

// ── Context ───────────────────────────────────────────────────────────────────

interface PortfolioContextValue extends PortfolioRawData {
  loading: boolean
  error: string | null
  reload: () => void
}


const EMPTY_PERSONAL: RawPersonal = {
  name: '', greeting: '', role: '', tagline: '', bio: '',
  email: '', location: '',
  social: { github: '', linkedin: '', codewars: '' },
  pillars: PILLARS,
}

const defaultValue: PortfolioRawData = {
  personal:   EMPTY_PERSONAL,
  softSkills: [],
  skills:     [],
  jobs:       [],
  projects:   { work: [], featured: [] },
  education:  { items: [], certs: [] },
}

const PortfolioContext = createContext<PortfolioContextValue>({
  ...defaultValue,
  loading: true,
  error: null,
  reload: () => {},
})

// ── API config ────────────────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_CAREER_API_URL as string | undefined)?.replace(/\/$/, '')
  ?? 'https://api.sebas1705.dev'

const CACHE_KEY = 'portfolio_data_v9'

// ── Provider ──────────────────────────────────────────────────────────────────

function readCache(): PortfolioRawData | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY)
    if (cached) return JSON.parse(cached) as PortfolioRawData
  } catch { sessionStorage.removeItem(CACHE_KEY) }
  return null
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  // Lazy init from the session cache: no setState-in-effect cascade
  const [data, setData]       = useState<PortfolioRawData>(() => readCache() ?? defaultValue)
  const [loading, setLoading] = useState(() => readCache() === null)
  const [error, setError]     = useState<string | null>(null)
  const [tick, setTick]       = useState(0)

  // loading/error se preparan aquí (event handler) y no dentro del effect:
  // la regla react-hooks/set-state-in-effect veta los setState síncronos allí.
  const reload = () => {
    sessionStorage.removeItem(CACHE_KEY)
    setLoading(true)
    setError(null)
    setTick(t => t + 1)
  }

  useEffect(() => {
    // First render already hydrated from cache; only fetch on reload() or cold start
    if (tick === 0 && readCache() !== null) return

    // One request for everything (GET /all). The first load may come from the browser cache;
    // the reload button asks the API to revalidate (an unchanged answer is an empty 304).
    const getAll = () =>
      fetch(`${API_BASE}/all`, tick > 0 ? { cache: 'no-cache' } : undefined).then(r => {
        if (!r.ok) throw new Error(`/all: HTTP ${r.status}`)
        return r.json()
      })

    // Offline fallback: public/data/*.json are kept in the already-adapted
    // shape, so they can be applied directly if the live API is unreachable.
    const local = (name: string) =>
      fetch(`${import.meta.env.BASE_URL}data/${name}.json`).then(r => {
        if (!r.ok) throw new Error(`fallback ${name}.json: HTTP ${r.status}`)
        return r.json()
      })

    getAll()
      .then(all => {
        const loaded = adaptAll({
          personal: all.personal, softSkills: all['soft-skills'], skills: all.skills, jobs: all.jobs,
          projects: all.projects, education: all.education, certifications: all.certifications,
        })
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(loaded))
        setData(loaded)
        setLoading(false)
      })
      .catch(err => {
        console.warn('[PortfolioData] API unreachable, trying local fallback', err)
        Promise.all([
          local('personal'),
          local('soft-skills'),
          local('skills'),
          local('jobs'),
          local('projects'),
          local('education'),
        ])
          .then(([personal, softSkills, skills, jobs, projects, education]) => {
            setData({
              personal: { ...personal, pillars: personal.pillars ?? PILLARS },
              softSkills, skills, jobs, projects, education,
            })
            setLoading(false)
          })
          .catch(err2 => {
            console.error('[PortfolioData]', err2)
            setError(err.message ?? 'Failed to load portfolio data')
            setLoading(false)
          })
      })
  }, [tick])

  return (
    <PortfolioContext.Provider value={{ ...data, loading, error, reload }}>
      {children}
    </PortfolioContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePortfolioData = () => useContext(PortfolioContext)
