import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { RawEduItem } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2 }}
    width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M6 9l6 6 6-6" />
  </motion.svg>
)

interface Props {
  item: RawEduItem
  index: number
}

/**
 * Academic education card with an expandable long-description panel
 * (same disclosure pattern as JobCard).
 */
export default function EduCard({ item, index }: Props) {
  const lang = useLang()
  const isEs = lang === 'es'
  const [open, setOpen] = useState(false)
  const longDesc = localize(item.long_desc, lang)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200"
    >
      <div className="p-4 sm:p-5 flex gap-3 sm:gap-4 items-start">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-xl sm:text-2xl shrink-0">
          {item.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-white text-sm leading-snug">
            {localize(item.degree, lang)}
          </p>
          <p className="text-violet-600 dark:text-violet-400 text-xs mt-1 font-medium">
            {item.school}
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            {localize(item.period, lang)}
          </p>
          {item.detail && (
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1 leading-relaxed">
              {localize(item.detail, lang)}
            </p>
          )}
          {longDesc && (
            <button
              onClick={() => setOpen(o => !o)}
              className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer touch-manipulation"
            >
              <ChevronIcon open={open} />
              {open
                ? (isEs ? 'Ocultar detalle' : 'Hide details')
                : (isEs ? 'Ver detalle completo' : 'See full details')}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open && longDesc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-5 pb-4 sm:pb-5 pt-3">
              <p className="font-mono text-[10px] tracking-wide text-violet-600 dark:text-violet-400 mb-1.5">
                {isEs ? '~ en detalle' : '~ in detail'}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {longDesc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
