import { m, useReducedMotion } from 'framer-motion'
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
  const reduceMotion = useReducedMotion()
  const { personal, jobs, projects } = usePortfolioData()
  const isEs = lang === 'es'

  // Stats derived from live data, with the pre-API literals as fallback
  const allProjects = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const starts = jobs.map(j => j.startDate).filter((s): s is string => !!s).sort()
  const years = starts.length
    ? Math.max(1, Math.round((NOW - new Date(`${starts[0]}-01`).getTime()) / (365.25 * 24 * 3600 * 1000)))
    : 2
  const playApps = allProjects.filter(p => p.demo?.includes('play.google')).length || 2

  const stats = [
    { num: `${years}+`, label: isEs ? 'años exp.' : 'years exp.' },
    { num: String(playApps), label: isEs ? 'apps Play Store' : 'Play Store apps' },
    { num: allProjects.length ? String(allProjects.length) : '20', label: isEs ? 'proyectos' : 'projects' },
    { num: String(allProjects.filter(p => p.github).length), label: isEs ? 'repos públicos' : 'public repos' },
  ]

  return (
    <SectionWrapper className="text-center">
      <m.p {...item(0.05)} className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-violet-600 dark:text-violet-400 mb-3 sm:mb-5">
        {localize(personal.greeting, lang)}
      </m.p>

      <m.h1
        {...item(0.15)}
        className="font-display text-[2.75rem] sm:text-7xl lg:text-8xl font-bold tracking-tight text-slate-900 dark:text-white mb-3 sm:mb-5 leading-tight break-words hyphens-auto"
      >
        {personal.name || 'Sebastián Entrerrios García'}
      </m.h1>

      <m.p {...item(0.25)} className="text-lg sm:text-2xl lg:text-4xl font-light text-violet-600 dark:text-violet-400 mb-5 sm:mb-7">
        {localize(personal.role, lang)}
      </m.p>

      <m.p {...item(0.35)} className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg max-w-xl mx-auto mb-4 sm:mb-5 leading-relaxed">
        {localize(personal.tagline, lang)}
      </m.p>

      {/* Availability: plain text (the dot is decorative), so it reads the same for everyone */}
      <m.p
        {...item(0.4)}
        data-testid="hero-availability"
        className="inline-flex items-center gap-2 mb-8 sm:mb-10 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-50/80 dark:bg-teal-950/40 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-500 shrink-0" />
        {t('hero.availability')}
      </m.p>

      <m.div {...item(0.45)} className="flex flex-wrap gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
        {/* Primary: the static PDF rendered at build time by scripts/build-cv.mjs (same document as the generator) */}
        <a
          href={`${import.meta.env.BASE_URL}cv/cv-${lang}.pdf`}
          download={`CV_Sebastian_Entrerrios_${lang.toUpperCase()}.pdf`}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-full font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-violet-500/30 text-sm sm:text-base touch-manipulation cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {isEs ? 'Descargar CV (PDF)' : 'Download CV (PDF)'}
        </a>
        <button
          onClick={onNext}
          className="px-6 sm:px-8 py-3 sm:py-3.5 border border-violet-300 dark:border-violet-700 text-violet-700 dark:text-violet-300 rounded-full font-semibold hover:bg-violet-50 dark:hover:bg-violet-950/40 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer text-sm sm:text-base touch-manipulation"
        >
          {t('hero.cta_work')}
        </button>
        <a
          href={`mailto:${personal.email}`}
          className="px-6 sm:px-8 py-3 sm:py-3.5 border border-slate-200 dark:border-slate-700 rounded-full font-semibold hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-700 dark:hover:text-violet-300 transition-all duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base touch-manipulation"
        >
          {t('hero.cta_contact')}
        </a>
      </m.div>

      {/* Secondary: the in-browser generator (role-specific and ATS variants) */}
      {onOpenCV && (
        <m.p {...item(0.5)} className="-mt-5 sm:-mt-6 mb-8 sm:mb-10 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          <button
            onClick={onOpenCV}
            className="underline underline-offset-4 decoration-slate-300 dark:decoration-slate-700 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer touch-manipulation"
          >
            {isEs ? 'Otras versiones del CV (por rol, ATS)' : 'Other CV versions (by role, ATS)'}
          </button>
        </m.p>
      )}

      {/* Stats bar */}
      <m.div
        {...item(0.55)}
        className="grid grid-cols-2 gap-x-6 gap-y-4 max-w-[280px] mx-auto sm:max-w-none sm:inline-flex sm:flex-wrap sm:gap-10 justify-center px-6 sm:px-10 py-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 backdrop-blur-sm"
      >
        {stats.map(s => (
          <div key={s.label} className="text-center min-w-[48px]">
            <div className="text-xl sm:text-2xl font-extrabold text-violet-600 dark:text-violet-400 leading-none">{s.num}</div>
            <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 leading-tight">{s.label}</div>
          </div>
        ))}
      </m.div>

      <m.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        onClick={onNext}
        className="mt-8 sm:mt-10 mx-auto flex flex-col items-center gap-2 px-4 py-2 text-slate-400 dark:text-slate-600 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer touch-manipulation"
      >
        <span className="text-xs tracking-widest uppercase">{t('nav.explore')}</span>
        <m.div animate={reduceMotion ? undefined : { y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M7 10l5 5 5-5" />
          </svg>
        </m.div>
      </m.button>
    </SectionWrapper>
  )
}
