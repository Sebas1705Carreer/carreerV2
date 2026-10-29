import { m } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import type { RawProject } from '../../context/PortfolioDataContext'
import { arrangeProjects } from '../../lib/projectAssets'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'
import ProjectCard, { FeaturedProjectCard } from '../ui/ProjectCard'
import ProjectModal from '../ui/ProjectModal'
import { ProjectCardSkeleton } from '../ui/Skeleton'

/** Mono eyebrow + count, matching the section's file-header vernacular */
function GroupHeading({ id, label, count, note }: { id: string; label: string; count: number; note?: string }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 mb-2.5 sm:mb-3">
      <h3 id={id} className="font-display text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
        {label}
      </h3>
      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400" aria-hidden="true">[{count}]</span>
      {note && <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 basis-full sm:basis-auto">{note}</p>}
    </div>
  )
}

export default function ProjectsSection() {
  const { t } = useTranslation()
  const { projects, loading } = usePortfolioData()
  const [selected, setSelected] = useState<RawProject | null>(null)

  const all = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const { featured, groups } = arrangeProjects(all)

  return (
    <SectionWrapper maxWidth="max-w-6xl">
      <SectionHeader navKey="nav.projects" titleKey="projects.title" className="mb-5 sm:mb-6" meta={String(all.length)} />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map(k => <ProjectCardSkeleton key={k} />)}
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {featured.length > 0 && (
            <section aria-labelledby="projects-featured">
              <GroupHeading id="projects-featured" label={t('projects.featured')} count={featured.length} />
              <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3" data-testid="featured-projects">
                {featured.map((project, i) => (
                  <li key={project.id}>
                    <FeaturedProjectCard project={project} index={i} onOpen={setSelected} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {groups.map(group => (
            <section key={group.key} aria-labelledby={`projects-${group.key}`} data-testid={`project-group-${group.key}`}>
              <GroupHeading
                id={`projects-${group.key}`}
                label={t(`projects.group_${group.key}`)}
                count={group.items.length}
                note={group.key === 'work' ? t('projects.nda_note') : undefined}
              />
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {group.items.map((project, i) => (
                  <li key={project.id}>
                    <ProjectCard project={project} index={featured.length + i} onOpen={setSelected} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-5">
        {t('projects.click_hint')}
      </m.p>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </SectionWrapper>
  )
}
