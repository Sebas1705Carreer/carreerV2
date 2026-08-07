import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'
import EduCard from '../ui/EduCard'
import CertCard from '../ui/CertCard'
import { EduCardSkeleton, CertCardSkeleton } from '../ui/Skeleton'

const CERTS_VISIBLE = 4

type Tab = 'academic' | 'certifications'

export default function EducationSection() {
  const { t } = useTranslation()
  const { education, loading } = usePortfolioData()
  const [tab, setTab] = useState<Tab>('academic')
  const [showAllCerts, setShowAllCerts] = useState(false)

  const items = education.items ?? []
  const certs = education.certs ?? []
  const hiddenCount = certs.length - CERTS_VISIBLE

  const tabs: { key: Tab; label: string }[] = [
    { key: 'academic',       label: t('education.tab_academic') },
    { key: 'certifications', label: t('education.tab_certifications') },
  ]

  return (
    <SectionWrapper maxWidth="max-w-6xl">
      <SectionHeader navKey="nav.education" titleKey="education.title" className="mb-6 sm:mb-8" meta={certs.length ? `${items.length}+${certs.length}` : undefined} />

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 sm:mb-8">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer touch-manipulation
              ${tab === key
                ? 'text-violet-700 dark:text-violet-300'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            {tab === key && (
              <motion.span
                layoutId="edu-tab-pill"
                className="absolute inset-0 rounded-full bg-violet-100 dark:bg-violet-900/40"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'academic' && (
          <motion.div
            key="academic"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-3 sm:space-y-4"
          >
            {loading
              ? [1, 2, 3].map(k => <EduCardSkeleton key={k} />)
              : items.map((item, i) => <EduCard key={i} item={item} index={i} />)
            }
          </motion.div>
        )}

        {tab === 'certifications' && (
          <motion.div
            key="certifications"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {loading ? (
              <div className="space-y-2 sm:space-y-2.5">
                {[1, 2, 3, 4].map(k => <CertCardSkeleton key={k} />)}
              </div>
            ) : (
              <>
                <div className="space-y-2 sm:space-y-2.5">
                  {certs.slice(0, CERTS_VISIBLE).map((cert, i) => (
                    <CertCard key={cert.id ?? `cert-${i}`} cert={cert} delay={0.18 + i * 0.07} />
                  ))}

                  <AnimatePresence initial={false}>
                    {showAllCerts && certs.slice(CERTS_VISIBLE).map((cert, i) => (
                      <motion.div
                        key={cert.id ?? `cert-${CERTS_VISIBLE + i}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden pt-2 sm:pt-2.5"
                      >
                        <CertCard cert={cert} delay={0} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {hiddenCount > 0 && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    onClick={() => setShowAllCerts(v => !v)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-violet-500 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer touch-manipulation"
                  >
                    <motion.span animate={{ rotate: showAllCerts ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-block">▾</motion.span>
                    {showAllCerts ? t('education.show_less') : t('education.show_more', { count: hiddenCount })}
                  </motion.button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  )
}
