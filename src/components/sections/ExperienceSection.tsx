import { usePortfolioData } from '../../context/PortfolioDataContext'
import SectionWrapper from '../ui/SectionWrapper'
import SectionHeader from '../ui/SectionHeader'
import JobCard from '../ui/JobCard'
import { JobCardSkeleton } from '../ui/Skeleton'

export default function ExperienceSection() {
  const { jobs, loading } = usePortfolioData()

  return (
    <SectionWrapper maxWidth="max-w-4xl">
      <SectionHeader navKey="nav.experience" titleKey="experience.title" className="mb-8 sm:mb-10" meta={jobs.length ? String(jobs.length) : undefined} />

      <div className="relative">
        {/* Timeline vertical line */}
        <div className="absolute left-[22px] sm:left-8 top-3 bottom-3 w-px bg-gradient-to-b from-violet-500 via-violet-400 to-transparent" />

        <div className="space-y-4 sm:space-y-5">
          {loading
            ? [1, 2, 3].map(k => <JobCardSkeleton key={k} />)
            : jobs.map((job, i) => <JobCard key={job.id} job={job} index={i} />)
          }
        </div>
      </div>
    </SectionWrapper>
  )
}
