import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
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

const MAX_VISIBLE = 9
const EASE = [0.22, 1, 0.36, 1] as const

type GroupId = typeof GROUPS[number]['id']

export default function SkillsSection() {
  const { t } = useTranslation()
  const lang = useLang()
  const { skills, softSkills, loading } = usePortfolioData()
  const isEs = lang === 'es'
  const [expandedGroup, setExpandedGroup] = useState<GroupId | null>(null)

  const openGroup = expandedGroup ? GROUPS.find(g => g.id === expandedGroup) ?? null : null
  const allGroupSkills = openGroup
    ? skills.filter(s => (openGroup.cats as readonly string[]).includes(s.category)).sort((a, b) => b.level - a.level)
    : []

  return (
    <SectionWrapper maxWidth="max-w-6xl">
      <SectionHeader navKey="nav.skills" titleKey="skills.title" className="mb-4 sm:mb-5" meta={skills.length ? String(skills.length) : undefined} />

      {loading ? (
        <SkillChipsSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.35 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-5 sm:mb-6"
        >
          {GROUPS.map(({ id, cats, labelEn, labelEs, header, border, top, low, accent }) => {
            const grouped = skills
              .filter(s => (cats as readonly string[]).includes(s.category))
              .sort((a, b) => b.level - a.level)
            const total      = grouped.length
            const shown      = grouped.slice(0, MAX_VISIBLE)
            const hiddenCount = total - shown.length
            const label      = isEs ? labelEs : labelEn

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: GROUPS.findIndex(g => g.id === id) * 0.05 + 0.1, duration: 0.3, ease: EASE }}
                className={`rounded-xl sm:rounded-2xl border bg-white/80 dark:bg-slate-900/70 shadow-sm hover:shadow-md transition-shadow duration-200 ${border}`}
              >
                {/* Colored top accent bar */}
                <div className={`h-1 w-full rounded-t-xl sm:rounded-t-2xl ${accent}`} />

                <div className="p-3 sm:p-4">
                  {/* Header row */}
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest ${header}`}>
                      {label}
                    </h3>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${top} opacity-80`}>
                      {total}
                    </span>
                  </div>

                  {/* Chips */}
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {shown.map(s => (
                      <SkillChip
                        key={s.id}
                        skill={s}
                        chipClass={s.level >= 3 ? top : low}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        onClick={() => setExpandedGroup(id as GroupId)}
                        className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border text-[9px] sm:text-[10px] font-semibold cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 ${top}`}
                      >
                        +{hiddenCount} {isEs ? 'más' : 'more'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Soft skills */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2 sm:mb-2.5 text-center">
          {t('skills.soft')}
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          {softSkills.map(ss => {
            const name = typeof ss.name === 'string' ? ss.name : (lang === 'es' ? (ss.name as { es: string }).es : (ss.name as { en: string }).en)
            return (
              <span
                key={name}
                className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs font-medium bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800/50"
              >
                <span>{ss.icon}</span>
                {name}
              </span>
            )
          })}
        </div>
      </motion.div>

      {t('nav.skills') && null}

      {/* Skills popup modal */}
      <AnimatePresence>
        {openGroup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            data-modal
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 bg-black/50 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget) setExpandedGroup(null) }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: EASE }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              {/* Accent bar */}
              <div className={`h-1.5 w-full ${openGroup.accent}`} />

              <div className="p-5 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xs font-bold uppercase tracking-widest ${openGroup.header}`}>
                      {isEs ? openGroup.labelEs : openGroup.labelEn}
                    </h3>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                      {allGroupSkills.length} {isEs ? 'habilidades' : 'skills'}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedGroup(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* All skills */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {allGroupSkills.map(s => (
                    <SkillChip
                      key={s.id}
                      skill={s}
                      chipClass={s.level >= 3 ? openGroup.top : openGroup.low}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
