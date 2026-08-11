import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './hooks/useTheme'
import { useSection } from './hooks/useSection'
import NavDots from './components/layout/NavDots'
import Controls from './components/layout/Controls'
import Background from './components/layout/Background'
import SectionDecor from './components/layout/SectionDecor'
import HeroSection from './components/sections/HeroSection'
import AboutSection from './components/sections/AboutSection'
import SkillsSection from './components/sections/SkillsSection'
import ExperienceSection from './components/sections/ExperienceSection'
import ProjectsSection from './components/sections/ProjectsSection'
import EducationSection from './components/sections/EducationSection'
import ContactSection from './components/sections/ContactSection'

// Lazy: @react-pdf pesa ~1MB minificado y solo hace falta al generar un CV
const CVGenerator = lazy(() => import('./components/CVGenerator'))

const SECTIONS = [
  HeroSection,
  AboutSection,
  SkillsSection,
  ExperienceSection,
  ProjectsSection,
  EducationSection,
  ContactSection,
]

const SECTION_KEYS = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact']

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0, scale: 0.96 }),
}

// ── Arrow icons ───────────────────────────────────────────────────────────────
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 15l-6-6-6 6" />
  </svg>
)
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9l6 6 6-6" />
  </svg>
)
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 18l-6-6 6-6" />
  </svg>
)
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
)

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const { current, direction, navigate, next, prev } = useSection(SECTION_KEYS)
  const { i18n, t } = useTranslation()
  const [showCV, setShowCV] = useState(false)

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith('es') ? 'en' : 'es')
  const CurrentSection = SECTIONS[current]
  const isFirst = current === 0
  const isLast  = current === SECTIONS.length - 1

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Background />
      <Controls theme={theme} onToggleTheme={toggleTheme} onToggleLang={toggleLang} lang={i18n.language} />

      {/* NavDots — hidden on mobile, visible on md+ */}
      <div className="hidden md:block">
        <NavDots total={SECTIONS.length} current={current} onNavigate={navigate} sectionKeys={SECTION_KEYS} />
      </div>

      {/* ── Section content ── */}
      {/* On mobile: leave 56px at bottom for the bottom nav bar */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 350, damping: 32 },
            opacity: { duration: 0.22 },
            scale: { duration: 0.22 },
          }}
          className="absolute inset-x-0 top-0 bottom-0 md:inset-0 pb-14 md:pb-0"
        >
          <SectionDecor sectionKey={SECTION_KEYS[current]} />
          <CurrentSection onNext={next} onPrev={prev} onOpenCV={() => setShowCV(true)} />
        </motion.div>
      </AnimatePresence>

      {/* ── Desktop left navigation pill ── */}
      <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-0">
        <div className="flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-md overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
          <button
            onClick={prev}
            disabled={isFirst}
            aria-label={t('nav.prev', 'Previous section')}
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 enabled:hover:text-violet-600 dark:enabled:hover:text-violet-400 enabled:hover:bg-violet-50 dark:enabled:hover:bg-violet-950/30"
          >
            <ChevronUp />
          </button>
          <button
            onClick={next}
            disabled={isLast}
            aria-label={t('nav.next', 'Next section')}
            className="w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 enabled:hover:text-violet-600 dark:enabled:hover:text-violet-400 enabled:hover:bg-violet-50 dark:enabled:hover:bg-violet-950/30"
          >
            <ChevronDown />
          </button>
        </div>

        <motion.p
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          {t(`nav.${SECTION_KEYS[current]}`)}
        </motion.p>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 h-14 border-t border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg">
        {/* Prev button */}
        <button
          onClick={prev}
          disabled={isFirst}
          aria-label="Previous"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          <ChevronLeft />
          <span className="text-xs font-medium">{t('nav.prev_label', 'Prev')}</span>
        </button>

        {/* Section indicator */}
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center"
        >
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t(`nav.${SECTION_KEYS[current]}`)}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-600">
            {current + 1} / {SECTIONS.length}
          </span>
        </motion.div>

        {/* Next button */}
        <button
          onClick={next}
          disabled={isLast}
          aria-label="Next"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation transition-colors active:bg-slate-100 dark:active:bg-slate-800"
        >
          <span className="text-xs font-medium">{t('nav.next_label', 'Next')}</span>
          <ChevronRight />
        </button>
      </div>

      {/* ── CV Generator modal ── */}
      {showCV && (
        <Suspense fallback={null}>
          <CVGenerator onClose={() => setShowCV(false)} />
        </Suspense>
      )}
    </div>
  )
}
