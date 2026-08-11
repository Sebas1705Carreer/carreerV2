import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RawJob } from '../../context/PortfolioDataContext'
import { localize, localizeArr } from '../../lib/localize'
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
  job: RawJob
  /** Stagger delay for entry animation */
  index: number
}

/**
 * Single experience card with expand/collapse achievements.
 * Self-contained: reads language and translations internally.
 */
export default function JobCard({ job, index }: Props) {
  const { t } = useTranslation()
  const lang = useLang()
  const [open, setOpen] = useState(false)

  const achievements = localizeArr(job.achievements, lang)
  const projects     = localizeArr(job.projects, lang)
  const longDesc     = localize(job.long_desc, lang)
  const isEs         = lang === 'es'
  const hasDetail    = achievements.length > 0 || longDesc.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative pl-12 sm:pl-20"
    >
      {/* Timeline dot */}
      <div className="absolute left-[14px] sm:left-[26px] top-5 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-violet-600 dark:bg-violet-400 border-4 border-white dark:border-slate-950 shadow-sm" />

      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-200">

        {/* ── Always visible ── */}
        <div className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2 sm:mb-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base leading-snug">
                {localize(job.role, lang)}
              </h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <a
                  href={job.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-violet-600 dark:text-violet-400 font-medium hover:underline"
                  onClick={e => e.stopPropagation()}
                >
                  {job.company}
                </a>
                <span className="text-xs text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
                  {localize(job.type, lang)}
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full whitespace-nowrap shrink-0">
              {localize(job.period, lang)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-3 sm:mb-4 leading-relaxed">
            {localize(job.desc, lang)}
          </p>

          {/* Project tags */}
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {projects.map(p => (
              <span key={p} className="text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50">
                {p}
              </span>
            ))}
          </div>

          {hasDetail && (
            <button
              onClick={() => setOpen(o => !o)}
              className="mt-3 sm:mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors cursor-pointer touch-manipulation"
            >
              <ChevronIcon open={open} />
              {open
                ? (isEs ? 'Ocultar detalle' : 'Hide details')
                : (isEs ? 'Ver detalle completo' : 'See full details')}
            </button>
          )}
        </div>

        {/* ── Expandable achievements ── */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-slate-100 dark:border-slate-800 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4">
                {longDesc && (
                  <>
                    <p className="font-mono text-[10px] tracking-wide text-violet-600 dark:text-violet-400 mb-1.5">
                      {isEs ? '~ en detalle' : '~ in detail'}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3 sm:mb-4">
                      {longDesc}
                    </p>
                  </>
                )}
                {achievements.length > 0 && (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400 mb-2 sm:mb-3">
                      {t('experience.achievements_label')}
                    </p>
                    <ul className="space-y-1.5 sm:space-y-2">
                      {achievements.map((ach, j) => (
                        <motion.li
                          key={j}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: j * 0.05, duration: 0.2 }}
                          className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400"
                        >
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-violet-400 dark:bg-violet-500 shrink-0" />
                          {ach}
                        </motion.li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  )
}
