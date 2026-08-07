import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { SectionProps } from '../../types'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'
import SectionWrapper from '../ui/SectionWrapper'

const ease = [0.22, 1, 0.36, 1] as const
// Captured at module load — render stays pure (react-compiler rule)
const NOW = Date.now()
const item = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.55, ease },
})

export default function HeroSection({ onNext, onOpenCV }: SectionProps) {
  const { t } = useTranslation()
  const lang = useLang()
  const { personal, jobs, projects } = usePortfolioData()
  const isEs = lang === 'es'

  // Stats derived from live data, with the pre-API literals as fallback
  const allProjects = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const starts = jobs.map(j => j.startDate).filter((s): s is string => !!s).sort()
  const years = starts.length
    ? Math.max(1, Math.floor((NOW - new Date(`${starts[0]}-01`).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 2
  const playApps = allProjects.filter(p => p.demo?.includes('play.google')).length || 2

  const stats = [
    { num: `${years}+`, label: isEs ? 'años exp.' : 'years exp.' },
    { num: String(playApps), label: isEs ? 'apps Play Store' : 'Play Store apps' },
    { num: allProjects.length ? String(allProjects.length) : '20', label: isEs ? 'proyectos' : 'projects' },
    { num: '90%', label: isEs ? 'cobertura tests' : 'test coverage' },
  ]

  return (
    <SectionWrapper className="text-center">
      <motion.p {...item(0.05)} className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-violet-600 dark:text-violet-400 mb-3 sm:mb-5">
        {localize(personal.greeting, lang)}
      </motion.p>

      <motion.h1
        {...item(0.15)}
        className="font-display text-[2.75rem] sm:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-5 leading-tight break-words hyphens-auto"
      >
        {personal.name || 'Sebastián Entrerrios García'}
      </motion.h1>

      <motion.p {...item(0.25)} className="text-lg sm:text-2xl lg:text-4xl font-light text-violet-600 dark:text-violet-400 mb-5 sm:mb-7">
        {localize(personal.role, lang)}
      </motion.p>

      <motion.p {...item(0.35)} className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg max-w-xl mx-auto mb-8 sm:mb-10 leading-relaxed">
        {localize(personal.tagline, lang)}
      </motion.p>

      <motion.div {...item(0.45)} className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
        <button
          onClick={onNext}
          className="px-6 sm:px-8 py-3 sm:py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/30 cursor-pointer text-sm sm:text-base touch-manipulation"
        >
          {t('hero.cta_work')}
        </button>
        <a
          href={`mailto:${personal.email}`}
          className="px-6 sm:px-8 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-full font-semibold hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base touch-manipulation"
        >
          {t('hero.cta_contact')}
        </a>
        {/* Abre el generador de CV (el cv_url estático de la API apuntaba a un PDF inexistente → 404) */}
        {onOpenCV && (
          <button
            onClick={onOpenCV}
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 border border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400 rounded-full font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base touch-manipulation cursor-pointer"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            {isEs ? 'Descargar CV' : 'Download CV'}
          </button>
        )}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        {...item(0.55)}
        className="inline-flex flex-wrap gap-6 sm:gap-10 justify-center px-6 sm:px-10 py-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 backdrop-blur-sm"
      >
        {stats.map(s => (
          <div key={s.num} className="text-center min-w-[48px]">
            <div className="text-xl sm:text-2xl font-extrabold text-violet-600 dark:text-violet-400 leading-none">{s.num}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="mt-8 sm:mt-10 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600"
      >
        <span className="text-xs tracking-widest uppercase">explore</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </motion.div>
      </motion.div>
    </SectionWrapper>
  )
}
