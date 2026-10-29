import { m } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'

const EASE = [0.22, 1, 0.36, 1] as const

export default function AboutSection() {
  const { t } = useTranslation()
  const lang = useLang()
  const { personal, jobs } = usePortfolioData()
  const isEs = lang === 'es'

  const currentJob = jobs.find(j => {
    const period = localize(j.period, 'en').toLowerCase()
    return period.includes('present') || period.includes('presente')
  })

  const profileFacts = [
    { icon: '📍', text: localize(personal.location, lang) },
    { icon: '💼', text: currentJob ? `${currentJob.company} — ${localize(currentJob.role, lang)}` : '' },
    { icon: '🎓', text: isEs ? 'Máster Desarrollo con IA (2026)' : "Master's in AI Dev (2026)" },
    { icon: '🌐', text: isEs ? 'Español (nativo) · Inglés (B2)' : 'Spanish (native) · English (B2)' },
  ].filter(f => f.text)

  const socialLinks = [
    { label: 'GitHub',   href: personal.social?.github,   icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
    ) },
    { label: 'LinkedIn', href: personal.social?.linkedin, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    ) },
    { label: 'Email',    href: `mailto:${personal.email}`, icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
    ) },
  ].filter(l => l.href)

  return (
    <SectionWrapper>
      <SectionHeader
        navKey="nav.about"
        titleKey="about.title"
        subtitle={localize(personal.bio, lang)}
        className="mb-5 sm:mb-7"
      />

      {/* Profile snapshot */}
      <m.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4, ease: EASE }}
        className="rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-100 dark:border-slate-800 px-4 sm:px-6 py-3 sm:py-4 mb-5 sm:mb-7"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
          {profileFacts.map(f => (
            <div key={f.icon} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="text-base flex-shrink-0">{f.icon}</span>
              <span className="truncate">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            {socialLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                target={l.href?.startsWith('mailto') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                {l.icon}
                {l.label}
              </a>
            ))}
          </div>
        )}
      </m.div>

      {/* Pillar cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        {personal.pillars.map((pillar, i) => (
          <m.div
            key={i}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1, duration: 0.45, ease: EASE }}
            className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl hover:shadow-violet-500/5 transition-all duration-300 group"
          >
            <span className="text-3xl sm:text-4xl mb-3 sm:mb-4 block">{pillar.icon}</span>
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-1.5 sm:mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {localize(pillar.title, lang)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {localize(pillar.desc, lang)}
            </p>
          </m.div>
        ))}

        {personal.pillars.length === 0 && [0, 1, 2].map(i => (
          <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-100 dark:border-slate-800 animate-pulse space-y-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>

      {t('nav.about') && null}
    </SectionWrapper>
  )
}
