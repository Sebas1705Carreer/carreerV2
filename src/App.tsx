import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from './hooks/useTheme'
import { useSection } from './hooks/useSection'
import { pickLang } from './hooks/useLang'
import { usePortfolioData } from './context/PortfolioDataContext'
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

/**
 * `?view=all` renders every section stacked in a normal scrolling document
 * (Ctrl+F, screen-reader reading order, print) instead of the slide deck.
 * Read once at load: the toggle is a real link, so switching views reloads.
 */
const VIEW_ALL = new URLSearchParams(window.location.search).get('view') === 'all'

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '55%' : '-55%', opacity: 0, scale: 0.96 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-55%' : '55%', opacity: 0, scale: 0.96 }),
}

// prefers-reduced-motion: no sliding/scaling, just an instant swap. (framer-motion
// animations are JS-driven, so the CSS rule in index.css does not reach them.)
const reducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

// ── Arrow icons ───────────────────────────────────────────────────────────────
const ChevronUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M18 15l-6-6-6 6" />
  </svg>
)
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
)
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M15 18l-6-6 6-6" />
  </svg>
)
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M9 18l6-6-6-6" />
  </svg>
)

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()
  const deck = useSection(SECTION_KEYS, !VIEW_ALL)
  const { i18n, t } = useTranslation()
  const lang = pickLang(i18n.language)
  const reduceMotion = useReducedMotion()
  const { loading } = usePortfolioData()
  const [showCV, setShowCV] = useState(false)
  // Single-page view: which section the nav dots point at (updated by the dots themselves)
  const [stackedCurrent, setStackedCurrent] = useState(() => Math.max(0, SECTION_KEYS.indexOf(window.location.hash.slice(1))))
  const mainRef = useRef<HTMLElement>(null)

  // Keep <html lang> in sync with the UI language (index.html ships lang="en")
  useEffect(() => { document.documentElement.lang = lang }, [lang])

  // Single-page view: honour the hash deep link once React has rendered the targets,
  // and again when the portfolio data lands (sections grow and shift the target down).
  useEffect(() => {
    if (!VIEW_ALL) return
    const id = window.location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView()
  }, [loading])

  const toggleLang = () => i18n.changeLanguage(lang === 'es' ? 'en' : 'es')

  const scrollToSection = (i: number) => {
    const index = Math.min(Math.max(i, 0), SECTION_KEYS.length - 1)
    document.getElementById(SECTION_KEYS[index])?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' })
    history.replaceState(null, '', index === 0 ? window.location.pathname + window.location.search : `#${SECTION_KEYS[index]}`)
    setStackedCurrent(index)
  }

  const current  = VIEW_ALL ? stackedCurrent : deck.current
  const navigate = VIEW_ALL ? scrollToSection : deck.navigate
  const next     = VIEW_ALL ? () => scrollToSection(current + 1) : deck.next
  const prev     = VIEW_ALL ? () => scrollToSection(current - 1) : deck.prev

  const CurrentSection = SECTIONS[current]
  const isFirst = current === 0
  const isLast  = current === SECTIONS.length - 1
  const sectionTitle = t(`nav.${SECTION_KEYS[current]}`)

  // Link to the other view, preserving the current section as a hash deep link
  const viewHref = `${window.location.pathname}${VIEW_ALL ? '' : '?view=all'}${current > 0 ? `#${SECTION_KEYS[current]}` : ''}`

  const skipToContent = (e: React.MouseEvent) => {
    // A plain `href="#main-content"` would be read by the hash router as "unknown section → hero"
    e.preventDefault()
    mainRef.current?.focus()
  }

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <a href="#main-content" onClick={skipToContent} className="skip-link print:hidden">
        {t('nav.skip')}
      </a>

      <Background />
      <Controls
        theme={theme}
        onToggleTheme={toggleTheme}
        onToggleLang={toggleLang}
        lang={lang}
        viewAll={VIEW_ALL}
        viewHref={viewHref}
      />

      {/* NavDots — hidden on mobile, visible on md+ */}
      <div className="hidden md:block print:hidden">
        <NavDots total={SECTIONS.length} current={current} onNavigate={navigate} sectionKeys={SECTION_KEYS} />
      </div>

      {/* Screen readers: announce the section that just came into view (deck mode) */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="section-announcer">
        {VIEW_ALL ? '' : `${sectionTitle} (${current + 1}/${SECTIONS.length})`}
      </div>

      {/* ── Mobile top bar: a backdrop for the fixed controls, so scrolled content never runs under them ── */}
      <div className="fixed top-0 inset-x-0 z-40 h-12 md:hidden flex items-center px-4 border-b border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg print:hidden">
        <button
          onClick={() => navigate(0)}
          className="font-mono text-xs font-semibold text-violet-600 dark:text-violet-400 px-1 py-3 touch-manipulation cursor-pointer"
        >
          ~/sebas1705<span className="sr-only"> ({t('nav.home')})</span>
        </button>
      </div>

      {/* ── Section content ── */}
      {VIEW_ALL ? (
        // Single page: every section stacked, the <main> is the scroll container.
        // SectionWrapper's h-full/overflow resolve to auto inside an auto-height parent.
        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          data-view="all"
          className="absolute inset-0 overflow-y-auto overscroll-contain outline-none pt-12 md:pt-0 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"
        >
          {SECTIONS.map((Section, i) => (
            <div
              key={SECTION_KEYS[i]}
              id={SECTION_KEYS[i]}
              className="relative scroll-mt-12 md:scroll-mt-0 border-b border-slate-100 dark:border-slate-800/80 last:border-0 print:break-inside-avoid"
            >
              <Section onNext={() => scrollToSection(i + 1)} onPrev={() => scrollToSection(i - 1)} onOpenCV={() => setShowCV(true)} />
            </div>
          ))}
        </main>
      ) : (
        // Slide deck: one section at a time.
        // On mobile: leave room for the top bar (48px) and the bottom nav bar (56px + safe area)
        <main id="main-content" ref={mainRef} tabIndex={-1} className="absolute inset-0 outline-none">
          <AnimatePresence mode="wait" custom={deck.direction}>
            <motion.div
              key={current}
              custom={deck.direction}
              variants={reduceMotion ? reducedVariants : variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={reduceMotion
                ? { duration: 0 }
                : {
                    x: { type: 'spring', stiffness: 350, damping: 32 },
                    opacity: { duration: 0.22 },
                    scale: { duration: 0.22 },
                  }}
              className="absolute inset-x-0 top-12 bottom-0 md:inset-0 pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0"
            >
              <SectionDecor sectionKey={SECTION_KEYS[current]} />
              <CurrentSection onNext={next} onPrev={prev} onOpenCV={() => setShowCV(true)} />
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      {/* ── Desktop left navigation pill (deck mode only) ── */}
      {!VIEW_ALL && (
        <div className="fixed left-5 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-0 print:hidden">
          <div className="flex flex-col rounded-2xl border border-slate-200/90 dark:border-slate-700/70 bg-white/75 dark:bg-slate-900/75 backdrop-blur-md shadow-md overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            <button
              onClick={prev}
              disabled={isFirst}
              aria-label={t('nav.prev')}
              className="w-9 h-9 flex items-center justify-center transition-all duration-200 cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed text-slate-500 dark:text-slate-400 enabled:hover:text-violet-600 dark:enabled:hover:text-violet-400 enabled:hover:bg-violet-50 dark:enabled:hover:bg-violet-950/30"
            >
              <ChevronUp />
            </button>
            <button
              onClick={next}
              disabled={isLast}
              aria-label={t('nav.next')}
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
            aria-hidden
            className="mt-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {sectionTitle}
          </motion.p>
        </div>
      )}

      {/* ── Mobile bottom navigation bar (deck mode only) ── */}
      {!VIEW_ALL && (
        <div className="fixed bottom-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-2 h-[calc(3.5rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] border-t border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg print:hidden">
          {/* Prev button */}
          <button
            onClick={prev}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-3 min-h-11 rounded-xl text-slate-500 dark:text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation transition-colors active:bg-slate-100 dark:active:bg-slate-800"
          >
            <ChevronLeft />
            <span className="text-xs font-medium">{t('nav.prev_label')}</span>
            <span className="sr-only"> ({t('nav.prev')})</span>
          </button>

          {/* Section indicator */}
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            aria-hidden
            className="flex flex-col items-center"
          >
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {sectionTitle}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {current + 1} / {SECTIONS.length}
            </span>
          </motion.div>

          {/* Next button */}
          <button
            onClick={next}
            disabled={isLast}
            className="flex items-center gap-1.5 px-3 min-h-11 rounded-xl text-slate-500 dark:text-slate-400 disabled:opacity-25 disabled:cursor-not-allowed touch-manipulation transition-colors active:bg-slate-100 dark:active:bg-slate-800"
          >
            <span className="text-xs font-medium">{t('nav.next_label')}</span>
            <span className="sr-only"> ({t('nav.next')})</span>
            <ChevronRight />
          </button>
        </div>
      )}

      {/* ── CV Generator modal ── */}
      {showCV && (
        <Suspense fallback={null}>
          <CVGenerator onClose={() => setShowCV(false)} />
        </Suspense>
      )}
    </div>
  )
}
