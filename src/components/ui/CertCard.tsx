import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { RawCert } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'

const ExternalLinkIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

const ChevronIcon = ({ open }: { open: boolean }) => (
  <motion.svg
    animate={{ rotate: open ? 180 : 0 }}
    transition={{ duration: 0.2 }}
    width="12" height="12" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    className="shrink-0"
  >
    <path d="M6 9l6 6 6-6" />
  </motion.svg>
)

interface Props {
  cert: RawCert
  /** Stagger animation delay */
  delay?: number
}

/**
 * Certification card: the title links to the credential (when it has a URL,
 * in-progress certs render plain) and the chevron discloses the long
 * description — same pattern as JobCard/EduCard.
 */
export default function CertCard({ cert, delay = 0 }: Props) {
  const lang = useLang()
  const isEs = lang === 'es'
  const [open, setOpen] = useState(false)
  const longDesc = localize(cert.long_desc, lang)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 transition-all duration-200"
    >
      <div className="flex items-start gap-2.5 sm:gap-3 p-3 sm:p-3.5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm shrink-0">
          🏆
        </div>
        <div className="min-w-0 flex-1">
          {cert.url ? (
            <a
              href={cert.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-xs hover:text-violet-600 dark:hover:text-violet-400 transition-colors leading-snug"
            >
              <span className="truncate">{localize(cert.name, lang)}</span>
              <span className="text-slate-400 dark:text-slate-500 shrink-0"><ExternalLinkIcon /></span>
            </a>
          ) : (
            <p className="font-medium text-slate-900 dark:text-white text-xs truncate leading-snug">
              {localize(cert.name, lang)}
            </p>
          )}
          <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {cert.issuer} · {cert.date}
          </p>
        </div>
        {longDesc && (
          <button
            onClick={() => setOpen(o => !o)}
            aria-expanded={open}
            aria-label={open ? (isEs ? 'Ocultar detalle' : 'Hide details') : (isEs ? 'Ver detalle completo' : 'See full details')}
            className="shrink-0 mt-0.5 w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
          >
            <ChevronIcon open={open} />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && longDesc && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-slate-100 dark:border-slate-800 px-3 sm:px-3.5 pb-3 sm:pb-3.5 pt-2.5">
              <p className="font-mono text-[10px] tracking-wide text-violet-600 dark:text-violet-400 mb-1">
                {isEs ? '~ en detalle' : '~ in detail'}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {longDesc}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
