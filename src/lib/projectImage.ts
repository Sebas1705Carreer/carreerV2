import { localize, type ML } from './localize'

/*
 * Project cover images. The API stores an absolute https URL in `image_url`
 * (hosted by this site under public/projects/<project-id>.webp) and a localized
 * `image_alt`. Both are optional.
 */

/** Intrinsic size the covers are exported at (16:9); used for width/height to avoid layout shift */
export const PROJECT_IMAGE_WIDTH = 1280
export const PROJECT_IMAGE_HEIGHT = 720

/** The URL if it is an absolute https URL, otherwise null (empty, relative, http, javascript:, …) */
export function safeImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const url = value.trim()
  return /^https:\/\/[^\s/]+\S*$/.test(url) ? url : null
}

/** Alt text in the current language, falling back to the project name */
export function projectImageAlt(project: { name: string; imageAlt?: ML | null }, lang: string): string {
  return localize(project.imageAlt, lang).trim() || project.name
}
