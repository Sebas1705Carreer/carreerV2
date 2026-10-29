import { m } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { RawProject } from '../../context/PortfolioDataContext'
import { localize } from '../../lib/localize'
import { useLang } from '../../hooks/useLang'
import { useProjectMeta } from '../../hooks/useProjectMeta'
import { isNda } from '../../lib/projectAssets'
import { useDemoLabel } from '../../hooks/useDemoLabel'
import { ProjectBanner, ProjectIcon } from './ProjectVisual'

export const GitHubIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
)

export const ExternalIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
)

/** Code + demo links. Sits above the card's stretched "details" button (relative z-10). */
function CardLinks({ project }: { project: RawProject }) {
  const { t } = useTranslation()
  const demoLabel = useDemoLabel()
  if (!project.github && !project.demo) return null
  const link =
    'relative z-10 inline-flex items-center gap-1.5 min-h-8 px-2.5 -mx-0.5 rounded-md text-[11px] sm:text-xs font-medium ' +
    'text-slate-600 dark:text-slate-300 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-950/50 transition-colors touch-manipulation'
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {project.github && (
        <a href={project.github} target="_blank" rel="noopener noreferrer" className={link}
          aria-label={`${t('projects.view_code')}: ${project.name} (GitHub)`}>
          <GitHubIcon />
          {t('projects.view_code')}
        </a>
      )}
      {project.demo && (
        <a href={project.demo} target="_blank" rel="noopener noreferrer" className={link}
          aria-label={`${demoLabel(project.demo)}: ${project.name}`}>
          <ExternalIcon />
          {demoLabel(project.demo)}
        </a>
      )}
    </div>
  )
}

export function NdaBadge() {
  const { t } = useTranslation()
  return (
    <span
      title={t('projects.nda_detail')}
      className="font-mono text-[10px] leading-none px-1.5 py-1 rounded border border-amber-300/80 dark:border-amber-700/70 text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40"
    >
      {t('projects.nda')}
    </span>
  )
}

interface Props {
  project: RawProject
  index: number
  onOpen: (project: RawProject) => void
}

const CARD =
  'group relative h-full flex flex-col rounded-xl sm:rounded-2xl border border-slate-200/70 dark:border-slate-800 ' +
  'bg-white/80 dark:bg-slate-900/80 hover:border-violet-300 dark:hover:border-violet-700 ' +
  'hover:shadow-lg hover:shadow-violet-500/10 transition-[border-color,box-shadow] duration-300 ' +
  'focus-within:border-violet-400 dark:focus-within:border-violet-600'

/** The project name as a button stretched over the whole card: one tab stop opens the detail */
function DetailsButton({ project, onOpen, className }: { project: RawProject; onOpen: Props['onOpen']; className: string }) {
  const { t } = useTranslation()
  return (
    <h4 className={className}>
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={t('projects.details_of', { name: project.name })}
        className="text-left cursor-pointer after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:outline-none group-focus-within:text-violet-700 dark:group-focus-within:text-violet-300"
      >
        {project.name}
      </button>
    </h4>
  )
}

const enter = (index: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: Math.min(index, 8) * 0.045, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
})

/** Large card for the featured row: 2:1 banner, name, two-line pitch, stack, links */
export function FeaturedProjectCard({ project, index, onOpen }: Props) {
  const { t } = useTranslation()
  const lang = useLang()
  const meta = useProjectMeta(project.github)

  return (
    <m.article {...enter(index)} data-testid="project-card" data-featured="true" className={`${CARD} overflow-hidden`}>
      <ProjectBanner project={project} meta={meta} className="border-b border-slate-200/70 dark:border-slate-800" />
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1">
          {t(`projects.context_${project.context}`)}
        </p>
        <DetailsButton
          project={project}
          onOpen={onOpen}
          className="font-display font-semibold text-base sm:text-[1.05rem] leading-tight text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors"
        />
        <p className="mt-1.5 text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
          {localize(project.desc, lang)}
        </p>
        <p className="mt-2 font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
          {project.tags.slice(0, 3).join(' · ')}
        </p>
        <div className="mt-auto pt-2">
          <CardLinks project={project} />
        </div>
      </div>
    </m.article>
  )
}

/** Compact card for the grouped list: icon tile, name, one-line pitch, links */
export default function ProjectCard({ project, index, onOpen }: Props) {
  const lang = useLang()
  const meta = useProjectMeta(project.github)
  const nda = isNda(project)

  return (
    <m.article {...enter(index)} data-testid="project-card" data-nda={nda ? 'true' : undefined} className={`${CARD} p-3 sm:p-3.5`}>
      <div className="flex items-start gap-3">
        <ProjectIcon project={project} meta={meta} className="w-10 h-10 rounded-lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <DetailsButton
              project={project}
              onOpen={onOpen}
              className="font-semibold text-[13px] sm:text-sm leading-snug text-slate-900 dark:text-white group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors truncate"
            />
            {nda && <NdaBadge />}
          </div>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">
            {localize(project.desc, lang)}
          </p>
        </div>
      </div>
      <div className="mt-auto pt-1.5 pl-[3.25rem]">
        <CardLinks project={project} />
      </div>
    </m.article>
  )
}
