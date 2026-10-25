import { useTranslation } from 'react-i18next'
import type { Theme } from '../../types'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="4" />
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
)

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

/** Stacked rows: "view as a single page" */
const ListIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <line x1="4" y1="6" x2="20" y2="6" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="18" x2="20" y2="18" />
  </svg>
)

/** One frame with dots: "view as slides" */
const SlidesIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <circle cx="9" cy="20" r="0.5" fill="currentColor" />
    <circle cx="12" cy="20" r="0.5" fill="currentColor" />
    <circle cx="15" cy="20" r="0.5" fill="currentColor" />
  </svg>
)

interface Props {
  theme: Theme
  onToggleTheme: () => void
  onToggleLang: () => void
  lang: string
  /** Whether the single-page (`?view=all`) view is active */
  viewAll: boolean
  /** Link to the other view (a real navigation, so both views start from a clean state) */
  viewHref: string
}

const pill = 'rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 cursor-pointer touch-manipulation'

export default function Controls({ theme, onToggleTheme, onToggleLang, lang, viewAll, viewHref }: Props) {
  const { t } = useTranslation()
  const isEs = lang.startsWith('es')
  const displayLang = isEs ? 'EN' : 'ES'
  const viewLabel = viewAll ? t('nav.view_deck') : t('nav.view_all')

  return (
    // On mobile: centred in the 48px top bar, on md+: top-5 right-14 (leave space for nav dots)
    <div className="fixed top-2 right-4 md:top-5 md:right-14 z-50 flex items-center gap-2 print:hidden">
      <a
        href={viewHref}
        aria-label={viewLabel}
        title={viewLabel}
        data-testid="view-toggle"
        className={`w-8 h-8 flex items-center justify-center ${pill}`}
      >
        {viewAll ? <SlidesIcon /> : <ListIcon />}
      </a>
      <button
        onClick={onToggleLang}
        // Visible text first (WCAG 2.5.3 label-in-name), then the action in the target language
        aria-label={`${displayLang}: ${isEs ? 'Switch to English' : 'Cambiar a español'}`}
        lang={isEs ? 'en' : 'es'}
        className={`text-xs font-semibold px-2.5 py-1.5 md:px-3 ${pill}`}
      >
        {displayLang}
      </button>
      <button
        onClick={onToggleTheme}
        aria-label={t('nav.toggle_theme')}
        aria-pressed={theme === 'dark'}
        className={`w-8 h-8 flex items-center justify-center ${pill}`}
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
