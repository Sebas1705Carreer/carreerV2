import type { Theme } from '../../types'

const SunIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

interface Props {
  theme: Theme
  onToggleTheme: () => void
  onToggleLang: () => void
  lang: string
}

export default function Controls({ theme, onToggleTheme, onToggleLang, lang }: Props) {
  const displayLang = lang.startsWith('es') ? 'EN' : 'ES'

  return (
    // On mobile: centred in the 48px top bar, on md+: top-5 right-14 (leave space for nav dots)
    <div className="fixed top-2 right-4 md:top-5 md:right-14 z-50 flex items-center gap-2">
      <button
        onClick={onToggleLang}
        className="text-xs font-semibold px-2.5 py-1.5 md:px-3 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 cursor-pointer touch-manipulation"
      >
        {displayLang}
      </button>
      <button
        onClick={onToggleTheme}
        aria-label="Toggle theme"
        className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-slate-700 dark:text-slate-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 cursor-pointer touch-manipulation"
      >
        {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  )
}
