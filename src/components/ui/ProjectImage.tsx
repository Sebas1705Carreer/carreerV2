import { useState } from 'react'
import type { RawProject } from '../../context/PortfolioDataContext'
import { useLang } from '../../hooks/useLang'
import { PROJECT_IMAGE_HEIGHT, PROJECT_IMAGE_WIDTH, projectImageAlt } from '../../lib/projectImage'

interface Props {
  project: RawProject
  className?: string
}

/**
 * A project's cover image (16:9). Renders nothing when the project has no image or the file
 * fails to load, so there is never an empty frame. width/height + aspect-video reserve the
 * space up front (no layout shift); the tinted background shows while it loads.
 */
export default function ProjectImage({ project, className = '' }: Props) {
  const lang = useLang()
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const url = project.imageUrl

  if (!url || failedUrl === url) return null

  return (
    <img
      src={url}
      alt={projectImageAlt(project, lang)}
      width={PROJECT_IMAGE_WIDTH}
      height={PROJECT_IMAGE_HEIGHT}
      loading="lazy"
      decoding="async"
      onError={() => setFailedUrl(url)}
      data-testid="project-image"
      className={`block w-full h-auto aspect-video object-cover bg-slate-100 dark:bg-slate-800 ${className}`}
    />
  )
}
