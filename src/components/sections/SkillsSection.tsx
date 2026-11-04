import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import type { RawSkill } from '../../context/PortfolioDataContext'
import { useLang } from '../../hooks/useLang'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'
import SkillChip from '../ui/SkillChip'
import { SkillChipsSkeleton } from '../ui/Skeleton'

const GROUPS = [
  {
    id: 'languages',
    cats: ['languages'],
    labelEn: 'Languages',
    labelEs: 'Lenguajes',
    accent:  'bg-violet-500',
    header:  'text-violet-600 dark:text-violet-400',
    border:  'border-violet-100 dark:border-violet-900/40',
    top:     'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'frameworks',
    cats: ['frameworks'],
    labelEn: 'Frameworks & Libraries',
    labelEs: 'Frameworks',
    accent:  'bg-indigo-500',
    header:  'text-indigo-600 dark:text-indigo-400',
    border:  'border-indigo-100 dark:border-indigo-900/40',
    top:     'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'tools',
    cats: ['tools'],
    labelEn: 'Tools & DevOps',
    labelEs: 'Herramientas',
    accent:  'bg-slate-500',
    header:  'text-slate-600 dark:text-slate-300',
    border:  'border-slate-200 dark:border-slate-700/60',
    top:     'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'databases',
    cats: ['databases'],
    labelEn: 'Databases',
    labelEs: 'Bases de Datos',
    accent:  'bg-sky-500',
    header:  'text-sky-600 dark:text-sky-400',
    border:  'border-sky-100 dark:border-sky-900/40',
    top:     'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'cloud',
    cats: ['cloud'],
    labelEn: 'Cloud',
    labelEs: 'Cloud',
    accent:  'bg-cyan-500',
    header:  'text-cyan-600 dark:text-cyan-400',
    border:  'border-cyan-100 dark:border-cyan-900/40',
    top:     'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'ides',
    cats: ['ides'],
    labelEn: 'IDEs',
    labelEs: 'Entornos de Desarrollo',
    accent:  'bg-teal-500',
    header:  'text-teal-600 dark:text-teal-400',
    border:  'border-teal-100 dark:border-teal-900/40',
    top:     'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'ai',
    cats: ['ai'],
    labelEn: 'Artificial Intelligence',
    labelEs: 'Inteligencia Artificial',
    accent:  'bg-amber-500',
    header:  'text-amber-600 dark:text-amber-400',
    border:  'border-amber-100 dark:border-amber-900/40',
    top:     'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'os',
    cats: ['os'],
    labelEn: 'Operating Systems',
    labelEs: 'Sistemas Operativos',
    accent:  'bg-rose-500',
    header:  'text-rose-600 dark:text-rose-400',
    border:  'border-rose-100 dark:border-rose-900/40',
    top:     'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'arch',
    cats: ['architecture'],
    labelEn: 'Architecture',
    labelEs: 'Arquitectura',
    accent:  'bg-emerald-500',
    header:  'text-emerald-600 dark:text-emerald-400',
    border:  'border-emerald-100 dark:border-emerald-900/40',
    top:     'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
  {
    id: 'methodologies',
    cats: ['methodologies'],
    labelEn: 'Methodologies',
    labelEs: 'Metodologías',
    accent:  'bg-orange-500',
    header:  'text-orange-600 dark:text-orange-400',
    border:  'border-orange-100 dark:border-orange-900/40',
    top:     'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/50',
    low:     'bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-500 border-slate-100 dark:border-slate-800/40',
  },
] as const

type Group = typeof GROUPS[number]
type TabId = 'all' | 'soft' | Group['id']

const EASE = [0.22, 1, 0.36, 1] as const
/** The soft-skills tab and card use their own accent, like a category */
const SOFT_GROUP = { accent: 'bg-fuchsia-500' }

const LEVEL_TITLE: Record<number, { en: string; es: string }> = {
  4: { en: 'Advanced',   es: 'Avanzado' },
  3: { en: 'Proficient', es: 'Competente' },
  2: { en: 'Familiar',   es: 'Conocimiento' },
  1: { en: 'Basic',      es: 'Básico' },
}

/** Case- and accent-insensitive, so "ingenieria" finds "Ingeniería" */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const byLevel = (a: RawSkill, b: RawSkill) => Math.min(4, b.level) - Math.min(4, a.level) || a.name.localeCompare(b.name)

interface Bucket { g: Group; items: RawSkill[] }

export default function SkillsSection() {
  const { t } = useTranslation()
  const lang = useLang()
  const { skills, softSkills, loading } = usePortfolioData()
  const isEs = lang === 'es'
  const [tab, setTab] = useState<TabId>('all')
  const [query, setQuery] = useState('')

  // Every category that has skills, each sorted by level (then name)
  const buckets = useMemo<Bucket[]>(
    () => GROUPS
      .map(g => ({ g, items: skills.filter(s => (g.cats as readonly string[]).includes(s.category)).sort(byLevel) }))
      .filter(b => b.items.length > 0),
    [skills],
  )

  const softItems = useMemo(
    () => softSkills.map(ss => ({
      icon: ss.icon,
      name: typeof ss.name === 'string' ? ss.name : (lang === 'es' ? (ss.name as { es: string }).es : (ss.name as { en: string }).en),
    })),
    [softSkills, lang],
  )

  const q = norm(query.trim())
  const active: TabId = tab === 'all' || (tab === 'soft' && softItems.length > 0) || buckets.some(b => b.g.id === tab) ? tab : 'all'

  // Searching looks in every category; otherwise the selected tab decides what is shown
  const shown: Bucket[] = q
    ? buckets.map(b => ({ g: b.g, items: b.items.filter(s => norm(s.name).includes(q)) })).filter(b => b.items.length > 0)
    : active === 'all' ? buckets : buckets.filter(b => b.g.id === active)
  // Soft skills ride along in All, in their own tab, and in a search that matches them
  const softShown = q ? softItems.filter(ss => norm(ss.name).includes(q)) : active === 'all' || active === 'soft' ? softItems : []
  const matches = shown.reduce((n, b) => n + b.items.length, 0) + (q ? softShown.length : 0)
  const totalSkills = buckets.reduce((n, b) => n + b.items.length, 0)
  // One category selected: break it down by level so the strongest read first
  const byLevelView = !q && active !== 'all'

  const tabs: { id: TabId; label: string; count: number; g?: { accent: string } }[] = [
    { id: 'all', label: isEs ? 'Todas' : 'All', count: totalSkills },
    ...buckets.map(b => ({ id: b.g.id as TabId, label: isEs ? b.g.labelEs : b.g.labelEn, count: b.items.length, g: b.g })),
    ...(softItems.length ? [{ id: 'soft' as TabId, label: t('skills.soft'), count: softItems.length, g: SOFT_GROUP }] : []),
  ]

  return (
    <SectionWrapper maxWidth="max-w-5xl">
      <SectionHeader navKey="nav.skills" titleKey="skills.title" className="mb-4 sm:mb-5" meta={totalSkills ? String(totalSkills) : undefined} />

      {loading ? (
        <SkillChipsSkeleton />
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.35 }}>
          {/* Search */}
          <div className="relative mb-3 sm:mb-4">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}
              placeholder={isEs ? 'Buscar una habilidad…' : 'Search a skill…'}
              aria-label={isEs ? 'Buscar una habilidad' : 'Search a skill'}
              autoComplete="off"
              enterKeyHint="search"
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-base sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:border-violet-400 dark:focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition"
            />
          </div>

          {/* Category tabs: a scrolling strip on phones, wrapped on larger screens */}
          <div
            role="tablist"
            aria-label={isEs ? 'Categorías de habilidades' : 'Skill categories'}
            data-no-swipe
            className="flex gap-2 overflow-x-auto sm:flex-wrap -mx-5 px-5 sm:mx-0 sm:px-0 pb-2 mb-4 sm:mb-5 snap-x"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.map(({ id, label, count, g }) => {
              const selected = !q && active === id
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={selected}
                  onClick={() => { setQuery(''); setTab(id) }}
                  className={`shrink-0 snap-start inline-flex items-center gap-2 min-h-10 px-3.5 rounded-full border text-sm font-medium cursor-pointer touch-manipulation transition-colors duration-150 ${
                    selected
                      ? `${g ? g.accent : 'bg-violet-600'} border-transparent text-white shadow-sm`
                      : 'border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-violet-600'
                  }`}
                >
                  {label}
                  <span className={`text-[11px] font-semibold tabular-nums ${selected ? 'text-white/80' : 'text-slate-400 dark:text-slate-500'}`}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Results */}
          <div role="tabpanel" aria-live="polite" className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {q && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {matches
                  ? (isEs ? `${matches} resultado${matches === 1 ? '' : 's'} para «${query.trim()}»` : `${matches} result${matches === 1 ? '' : 's'} for “${query.trim()}”`)
                  : (isEs ? `Nada coincide con «${query.trim()}».` : `Nothing matches “${query.trim()}”.`)}
              </p>
            )}

            {shown.map(({ g, items }, i) => (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 5) * 0.04, duration: 0.28, ease: EASE }}
                className={`min-w-0 rounded-xl sm:rounded-2xl border bg-white/80 dark:bg-slate-900/70 shadow-sm overflow-hidden ${g.border}`}
              >
                <div className={`h-1 w-full ${g.accent}`} />
                <div className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${g.header}`}>{isEs ? g.labelEs : g.labelEn}</h3>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${g.top} opacity-80`}>{items.length}</span>
                  </div>

                  {byLevelView ? (
                    <div className="space-y-3.5">
                      {[4, 3, 2, 1].map(lv => {
                        const group = items.filter(s => Math.min(4, s.level) === lv)
                        if (!group.length) return null
                        return (
                          <div key={lv}>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                              {LEVEL_TITLE[lv][lang]}
                            </p>
                            <div className="flex flex-wrap gap-1.5 sm:gap-2">
                              {group.map(s => <SkillChip key={s.id} skill={s} chipClass={s.level >= 3 ? g.top : g.low} />)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {items.map(s => <SkillChip key={s.id} skill={s} chipClass={s.level >= 3 ? g.top : g.low} />)}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {softShown.length > 0 && (
              <motion.div
                key="soft"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(shown.length, 5) * 0.04, duration: 0.28, ease: EASE }}
                className="rounded-xl sm:rounded-2xl border border-fuchsia-100 dark:border-fuchsia-900/40 bg-white/80 dark:bg-slate-900/70 shadow-sm overflow-hidden"
              >
                <div className={`h-1 w-full ${SOFT_GROUP.accent}`} />
                <div className="p-3.5 sm:p-5">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">{t('skills.soft')}</h3>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border border-fuchsia-200 dark:border-fuchsia-800/50 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 opacity-80">
                      {softShown.length}
                    </span>
                  </div>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                    {softShown.map(ss => (
                      <li
                        key={ss.name}
                        className="flex items-center gap-2.5 min-w-0 px-2.5 py-2 sm:px-3 sm:py-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/70 dark:bg-slate-900/60"
                      >
                        <span className="w-8 h-8 shrink-0 flex items-center justify-center rounded-lg bg-fuchsia-50 dark:bg-fuchsia-900/20 text-base" aria-hidden>{ss.icon}</span>
                        <span className="text-[13px] sm:text-sm font-medium leading-tight text-slate-700 dark:text-slate-200">{ss.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

    </SectionWrapper>
  )
}
