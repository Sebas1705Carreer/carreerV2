import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePortfolioData } from '../../context/PortfolioDataContext'
import type { RawProject } from '../../context/PortfolioDataContext'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'
import ProjectCard from '../ui/ProjectCard'
import ProjectModal from '../ui/ProjectModal'
import { ProjectCardSkeleton } from '../ui/Skeleton'

type Tab = 'work' | 'featured'

export default function ProjectsSection() {
  const { t } = useTranslation()
  const { projects, loading } = usePortfolioData()
  const [tab, setTab] = useState<Tab>('work')
  const [selected, setSelected] = useState<RawProject | null>(null)

  const workList     = projects.work     ?? []
  const featuredList = projects.featured ?? []
  const list = tab === 'work' ? workList : featuredList

  return (
    <SectionWrapper maxWidth="max-w-6xl">
      <SectionHeader navKey="nav.projects" titleKey="projects.title" className="mb-4 sm:mb-6" meta={String(workList.length + featuredList.length)} />

      {/* Tab switcher */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex gap-2 justify-center mb-4 sm:mb-6">
        {(['work', 'featured'] as Tab[]).map(t2 => (
          <button key={t2} onClick={() => setTab(t2)}
            className={`px-4 sm:px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer touch-manipulation ${tab === t2 ? 'bg-violet-600 text-white shadow-md shadow-violet-500/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
            {t(`projects.filter_${t2}`)}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t2 ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
              {t2 === 'work' ? workList.length : featuredList.length}
            </span>
          </button>
        ))}
      </motion.div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {[1, 2, 3, 4].map(k => <ProjectCardSkeleton key={k} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {list.map((project, i) => (
                <ProjectCard key={project.id} project={project} index={i} onOpen={setSelected} />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="text-center text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-600 mt-3 sm:mt-4">
        {t('projects.click_hint', 'Tap a card to read more')}
      </motion.p>

      {/* Detail modal */}
      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </SectionWrapper>
  )
}
