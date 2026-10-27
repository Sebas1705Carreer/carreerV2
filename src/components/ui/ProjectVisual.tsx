import { useState, type CSSProperties } from 'react'
import { useLang } from '../../hooks/useLang'
import { getManifest } from '../../lib/assetLoader'
import {
  BANNER_HEIGHT, BANNER_WIDTH, ICON_SIZE, assetRepo, inkOn, isNda, projectInitials, resolveBanner, resolveIcon,
  type AssetProject, type PortfolioMeta,
} from '../../lib/projectAssets'

/*
 * Project visuals from the portfolio assets standard. Both components reserve their box up front
 * (banner 2:1, icon 1:1) so nothing shifts while images load, and fall through
 * API image → repo asset → generated plate when a file is missing or fails to load.
 */

type Project = AssetProject & { context: string }

/** Remembers URLs that failed to load in this component so resolution moves to the next source */
function useFailed() {
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set())
  const markFailed = (url: string) => setFailed(prev => new Set(prev).add(url))
  return [failed, markFailed] as const
}

function plateStyle(accent: string | undefined): CSSProperties | undefined {
  if (!accent) return undefined
  return {
    backgroundColor: accent,
    backgroundImage: 'linear-gradient(135deg, rgb(255 255 255 / 0.16), rgb(0 0 0 / 0.18))',
    color: inkOn(accent),
  }
}

/* Neutral plate (no accent): the brand ink tinted over slate, with a faint dot grid */
const NEUTRAL_PLATE =
  'bg-gradient-to-br from-violet-50 via-slate-50 to-slate-100 text-violet-700 ' +
  'dark:from-violet-950 dark:via-slate-900 dark:to-slate-900 dark:text-violet-300'

const DOTS: CSSProperties = {
  backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
  backgroundSize: '14px 14px',
}

/**
 * Generated banner: the project's initials set large in the display face, and the repository it
 * comes from as a mono caption — or "private · NDA" for client work. Decorative (the card already
 * names the project), so it is hidden from assistive tech.
 */
function BannerPlate({ project, accent }: { project: Project; accent?: string }) {
  const repo = assetRepo(project.github)
  const caption = repo ?? (isNda(project) ? 'private · NDA' : project.name)
  return (
    <div
      aria-hidden="true"
      data-testid="project-banner-fallback"
      style={plateStyle(accent)}
      className={`relative w-full h-full overflow-hidden ${accent ? '' : NEUTRAL_PLATE}`}
    >
      <div className="absolute inset-0 opacity-[0.12]" style={DOTS} />
      <span className="absolute right-[6%] top-1/2 -translate-y-1/2 font-display font-bold leading-none tracking-tighter text-[clamp(2.75rem,9cqw,5.5rem)] opacity-90 select-none">
        {projectInitials(project.name)}
      </span>
      <span className="absolute left-3 bottom-2.5 sm:left-4 sm:bottom-3 font-mono text-[10px] sm:text-[11px] tracking-wide opacity-75 truncate max-w-[70%]">
        {caption}
      </span>
    </div>
  )
}

interface BannerProps {
  project: Project
  meta?: PortfolioMeta | null
  className?: string
  /** Render nothing instead of the generated plate (the detail dialog already shows icon + name) */
  hideFallback?: boolean
}

/** 2:1 banner: API image_url → repo banner.png → generated plate */
export function ProjectBanner({ project, meta, className = '', hideFallback = false }: BannerProps) {
  const lang = useLang()
  const [failed, markFailed] = useFailed()
  const banner = resolveBanner(project, { lang, meta, manifest: getManifest(), failed })
  if (hideFallback && !banner.src) return null

  return (
    <div
      data-testid="project-banner"
      data-source={banner.source}
      className={`relative w-full aspect-[2/1] overflow-hidden bg-slate-100 dark:bg-slate-800 [container-type:inline-size] ${className}`}
    >
      {banner.src ? (
        <img
          key={banner.src}
          src={banner.src}
          alt={banner.alt}
          width={BANNER_WIDTH}
          height={BANNER_HEIGHT}
          loading="lazy"
          decoding="async"
          onError={() => markFailed(banner.src as string)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <BannerPlate project={project} accent={meta?.accent} />
      )}
    </div>
  )
}

interface IconProps {
  project: Project
  meta?: PortfolioMeta | null
  /** Tailwind size + radius classes, e.g. "w-10 h-10 rounded-lg" */
  className?: string
}

/** 1:1 icon: repo icon.png → initials tile. Decorative next to the project name. */
export function ProjectIcon({ project, meta, className = 'w-10 h-10 rounded-lg' }: IconProps) {
  const lang = useLang()
  const [failed, markFailed] = useFailed()
  const icon = resolveIcon(project, { lang, meta, manifest: getManifest(), failed })

  return (
    <div
      data-testid="project-icon"
      data-source={icon.source}
      className={`relative shrink-0 aspect-square overflow-hidden border border-slate-200/80 dark:border-slate-700/80 ${className}`}
    >
      {icon.src ? (
        <img
          key={icon.src}
          src={icon.src}
          alt=""
          width={ICON_SIZE}
          height={ICON_SIZE}
          loading="lazy"
          decoding="async"
          onError={() => markFailed(icon.src as string)}
          className="absolute inset-0 w-full h-full object-cover bg-white dark:bg-slate-900"
        />
      ) : (
        <div
          aria-hidden="true"
          style={plateStyle(meta?.accent)}
          className={`absolute inset-0 flex items-center justify-center font-display font-bold text-[0.8rem] tracking-tight ${meta?.accent ? '' : NEUTRAL_PLATE}`}
        >
          {projectInitials(project.name)}
        </div>
      )}
    </div>
  )
}
