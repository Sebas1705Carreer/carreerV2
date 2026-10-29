import type { ComponentType } from 'react'
import type { SectionProps } from './types'
import { lazyWithPreload } from './lib/lazyWithPreload'
import HeroSection from './components/sections/HeroSection'

/*
 * The deck's sections. The hero ships in the main bundle (it is the first paint); every other
 * section is its own chunk, fetched before the first render when it is the deep-linked one (or in
 * the single-page view), and otherwise prefetched once the page is idle.
 */

export const SECTION_KEYS = ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact']

const lazySections = [
  lazyWithPreload(() => import('./components/sections/AboutSection')),
  lazyWithPreload(() => import('./components/sections/SkillsSection')),
  lazyWithPreload(() => import('./components/sections/ExperienceSection')),
  lazyWithPreload(() => import('./components/sections/ProjectsSection')),
  lazyWithPreload(() => import('./components/sections/EducationSection')),
  lazyWithPreload(() => import('./components/sections/ContactSection')),
]

export const SECTIONS: ComponentType<SectionProps>[] = [HeroSection, ...lazySections]

/** Fetches every lazy section chunk (failures are ignored: the section retries when rendered) */
export const preloadAllSections = () => Promise.all(lazySections.map(s => s.preload().catch(() => {}))).then(() => {})

/** Loads what the first render shows: every section in the single-page view, else the hash's one */
export function preloadInitialSections(viewAll: boolean, hash: string): Promise<void> {
  if (viewAll) return preloadAllSections()
  const index = SECTION_KEYS.indexOf(hash.replace(/^#/, ''))
  return index > 0 ? lazySections[index - 1].preload().catch(() => {}) : Promise.resolve()
}
