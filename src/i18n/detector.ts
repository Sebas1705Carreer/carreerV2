import type { LanguageDetectorModule } from 'i18next'

/*
 * Minimal language detector (replaces i18next-browser-languagedetector, ~11 KB of the main bundle):
 * the language the visitor picked before (localStorage, same key as before), else the browser's
 * preferred languages; i18next then picks the first supported one and falls back to English.
 */
export const STORAGE_KEY = 'i18nextLng'

export function detectLanguages(
  storage: Pick<Storage, 'getItem'> | null,
  nav: { languages?: readonly string[]; language?: string } | null,
): string[] {
  const out: string[] = []
  try {
    const saved = storage?.getItem(STORAGE_KEY)
    if (saved) out.push(saved)
  } catch { /* storage blocked */ }
  if (nav?.languages?.length) out.push(...nav.languages)
  else if (nav?.language) out.push(nav.language)
  return out
}

const safeStorage = (): Storage | null => {
  try { return typeof localStorage !== 'undefined' ? localStorage : null } catch { return null }
}

export const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: () => detectLanguages(safeStorage(), typeof navigator !== 'undefined' ? navigator : null),
  cacheUserLanguage: (lng: string) => {
    try { safeStorage()?.setItem(STORAGE_KEY, lng) } catch { /* storage blocked */ }
  },
}
