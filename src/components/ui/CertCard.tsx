import { motion } from 'framer-motion'
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

interface Props {
  cert: RawCert
  /** Stagger animation delay */
  delay?: number
}

const cardClass =
  'flex items-start gap-2.5 sm:gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 sm:p-3.5 border border-slate-100 dark:border-slate-800 transition-all duration-200 group'
const linkClass =
  ' hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md hover:shadow-violet-500/5'

/**
 * Certification card. Renders as an external link only when the cert has a
 * URL — in-progress certs (url: null) are a plain, non-clickable card.
 */
export default function CertCard({ cert, delay = 0 }: Props) {
  const lang = useLang()
  const anim = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }

  const body = (
    <>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-sm shrink-0">
        🏆
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="font-medium text-slate-900 dark:text-white text-xs group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate leading-snug">
            {localize(cert.name, lang)}
          </p>
          {cert.url && (
            <span className="text-slate-400 dark:text-slate-500 shrink-0">
              <ExternalLinkIcon />
            </span>
          )}
        </div>
        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
          {cert.issuer} · {cert.date}
        </p>
      </div>
    </>
  )

  if (!cert.url) {
    return <motion.div {...anim} className={cardClass}>{body}</motion.div>
  }
  return (
    <motion.a
      {...anim}
      href={cert.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cardClass + linkClass}
    >
      {body}
    </motion.a>
  )
}
