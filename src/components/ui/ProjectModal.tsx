import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { RawProject } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'
import { useProjectMeta } from '../../hooks/useProjectMeta'
import { loadCaseStudy, type CaseStudy } from '../../lib/assetLoader'
import { renderMarkdown } from '../../lib/markdown'
import { isNda } from '../../lib/projectAssets'
import { ExternalIcon, GitHubIcon, NdaBadge } from './ProjectCard'
import { useDemoLabel } from '../../hooks/useDemoLabel'
import { ProjectBanner, ProjectIcon } from './ProjectVisual'

interface Props {
  project: RawProject | null
  onClose: () => void
}

/** The case study for the open project, in the UI language when available (null while unknown/absent) */
function useCaseStudy(project: RawProject | null, lang: string) {
  const [state, setState] = useState<{ key: string; study: CaseStudy | null } | null>(null)
  const github = project?.github ?? null
  const key = `${github}|${lang}`

  useEffect(() => {
    if (!github) return
    let alive = true
    loadCaseStudy(github, lang).then(study => { if (alive) setState({ key: `${github}|${lang}`, study }) })
    return () => { alive = false }
  }, [github, lang])

  return state?.key === key ? state.study : null
}

/** Sanitised HTML of a case study, rendered lazily (marked + DOMPurify load on first use) */
function CaseStudyBody({ study }: { study: CaseStudy }) {
  const { t } = useTranslation()
  const [result, setResult] = useState<{ source: CaseStudy; html: string | null } | null>(null)

  useEffect(() => {
    let alive = true
    renderMarkdown(study.markdown, study.baseUrl)
      .then(html => { if (alive) setResult({ source: study, html }) })
      .catch(() => { if (alive) setResult({ source: study, html: null }) })
    return () => { alive = false }
  }, [study])

  if (result?.source !== study) {
    return <p className="text-sm text-slate-500 dark:text-slate-400" role="status">{t('projects.case_study_loading')}</p>
  }
  if (result.html === null) {
    return <p className="text-sm text-slate-600 dark:text-slate-300" role="alert">{t('projects.case_study_error')}</p>
  }
  // Safe: renderMarkdown sanitises with DOMPurify and restricts URLs to http(s)/mailto
  return <div className="case-study" data-testid="case-study-body" dangerouslySetInnerHTML={{ __html: result.html }} />
}

export default function ProjectModal({ project, onClose }: Props) {
  const { t } = useTranslation()
  const lang = useLang()
  const demoLabel = useDemoLabel()
  const meta = useProjectMeta(project?.github)
  const study = useCaseStudy(project, lang)
  const [readingFor, setReadingFor] = useState<string | null>(null)
  const reading = !!project && !!study && readingFor === project.id
  const closeRef = useRef<HTMLButtonElement>(null)
  const backRef = useRef<HTMLButtonElement>(null)
  const openerRef = useRef<Element | null>(null)

  // Escape closes the case study first, then the dialog
  useEffect(() => {
    if (!project) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (reading) setReadingFor(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [project, onClose, reading])

  // Focus: into the dialog on open, back to the card that opened it on close
  useEffect(() => {
    if (!project) return
    openerRef.current = document.activeElement
    closeRef.current?.focus()
    return () => { (openerRef.current as HTMLElement | null)?.focus?.() }
  }, [project])

  useEffect(() => {
    if (reading) backRef.current?.focus()
  }, [reading])

  const titleId = project ? `project-modal-title-${project.id}` : undefined
  const pill = 'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200'

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          data-modal
          className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-8 bg-slate-950/60 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) onClose() }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full ${reading ? 'max-w-2xl' : 'max-w-xl'} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-4rem)] border border-slate-200 dark:border-slate-700 overflow-y-auto overscroll-contain`}
          >
            {/* Sticky top bar: back (case study) + close */}
            <div data-dialog-bar className="sticky top-0 z-10 flex items-center justify-between gap-2 px-3 pt-3 pointer-events-none">
              {reading ? (
                <button
                  ref={backRef}
                  type="button"
                  onClick={() => setReadingFor(null)}
                  className="pointer-events-auto inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-medium bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
                  {t('projects.back')}
                </button>
              ) : <span />}
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label={t('projects.close')}
                className="pointer-events-auto w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {reading && study ? (
              <article className="px-5 sm:px-8 pb-6 sm:pb-8 -mt-2" aria-labelledby={titleId}>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300 mt-3">
                  {t('projects.case_study_title')}
                </p>
                <h2 id={titleId} className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mt-1 mb-1">
                  {project.name}
                </h2>
                {study.lang !== lang && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {t(study.lang === 'es' ? 'projects.case_study_lang_note_es' : 'projects.case_study_lang_note')}
                  </p>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
                <CaseStudyBody study={study} />
              </article>
            ) : (
              <>
                <ProjectBanner project={project} meta={meta} hideFallback className="-mt-11 border-b border-slate-200 dark:border-slate-700" />

                <div className="px-5 sm:px-6 pt-4 pb-5 sm:pb-6 space-y-4 [[data-dialog-bar]+&]:-mt-9">
                  <div className="flex items-center gap-3 pr-9">
                    <ProjectIcon project={project} meta={meta} className="w-11 h-11 rounded-xl" />
                    <div className="min-w-0">
                      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                        {t(`projects.context_${project.context}`)}
                      </p>
                      <h2 id={titleId} className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                        {project.name}
                      </h2>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {localize(project.long_desc ?? project.desc, lang)}
                  </p>

                  {isNda(project) && (
                    <p className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <NdaBadge />
                      {t('projects.nda_detail')}
                    </p>
                  )}

                  {project.tags?.length > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Stack">
                      {project.tags.map(tag => (
                        <li key={tag} className="text-[11px] sm:text-xs px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}

                  {(project.github || project.demo || study) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {study && (
                        <button
                          type="button"
                          onClick={() => setReadingFor(project.id)}
                          data-testid="case-study-open"
                          className={`${pill} font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25 cursor-pointer`}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z" /><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z" />
                          </svg>
                          {t('projects.case_study')}
                        </button>
                      )}
                      {project.demo && (
                        <a href={project.demo} target="_blank" rel="noopener noreferrer"
                          className={study
                            ? `${pill} border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:text-violet-700 dark:hover:text-violet-300`
                            : `${pill} font-semibold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25`}>
                          <ExternalIcon size={15} />
                          {demoLabel(project.demo)}
                        </a>
                      )}
                      {project.github && (
                        <a href={project.github} target="_blank" rel="noopener noreferrer"
                          className={`${pill} border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-violet-400 hover:text-violet-700 dark:hover:text-violet-300`}>
                          <GitHubIcon size={15} />
                          {t('projects.view_code')}
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
