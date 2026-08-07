import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

interface Props {
  /** i18n key for the nav label — also drives the mono path (e.g. 'nav.skills' → ~/portfolio/skills) */
  navKey: string
  /** i18n key for the main h2 title (e.g. 'skills.title') */
  titleKey: string
  className?: string
  /** Optional subtitle rendered below the title */
  subtitle?: string
  /** Optional right-aligned mono datum, rendered as [meta] — e.g. a count */
  meta?: string
}

/**
 * "File header" — the signature shared with the Folio editor: a monospace
 * path (~/portfolio/<section>), the section datum as a [counter] on the
 * right, a display-face title and a hairline rule. Left-aligned from sm up.
 */
export default function SectionHeader({ navKey, titleKey, className = '', subtitle, meta }: Props) {
  const { t } = useTranslation()
  const slug = navKey.split('.').pop() ?? navKey

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`text-left ${className}`}
    >
      <div className="flex items-baseline gap-3">
        <p className="font-mono text-[11px] sm:text-xs tracking-wide text-violet-600 dark:text-violet-400 truncate">
          ~/portfolio/{slug}
        </p>
        {meta && (
          <p className="ml-auto font-mono text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
            [{meta}]
          </p>
        )}
      </div>
      <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
        {t(titleKey)}
      </h2>
      <div className="h-px bg-slate-200 dark:bg-slate-800 mt-3" />
      {subtitle && (
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl text-sm sm:text-base leading-relaxed mt-3">
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}
