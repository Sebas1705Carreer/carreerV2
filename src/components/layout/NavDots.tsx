import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'

interface Props {
  total: number
  current: number
  onNavigate: (i: number) => void
  sectionKeys: string[]
}

export default function NavDots({ total, current, onNavigate, sectionKeys }: Props) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  return (
    <nav aria-label={t('nav.sections')} className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          title={t(`nav.${sectionKeys[i]}`)}
          onClick={() => onNavigate(i)}
          className="relative flex items-center justify-center w-4 h-4 group"
          aria-label={t(`nav.${sectionKeys[i]}`)}
          aria-current={i === current ? 'true' : undefined}
          data-section={sectionKeys[i]}
        >
          <motion.span
            animate={{ scale: i === current ? 1.6 : 1 }}
            transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 25 }}
            className={`block rounded-full transition-colors duration-300 ${
              i === current
                ? 'w-2 h-2 bg-violet-600 dark:bg-violet-400'
                : 'w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 group-hover:bg-violet-400 dark:group-hover:bg-violet-500'
            }`}
          />
        </button>
      ))}
    </nav>
  )
}
