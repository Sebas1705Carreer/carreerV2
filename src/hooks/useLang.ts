import { useTranslation } from 'react-i18next'
import type { Lang } from '../types'

/** Pure: narrows any i18next language tag ('es-ES', 'en-GB', 'fr'…) to the two UI languages. */
export function pickLang(language: string | undefined | null): Lang {
  return language?.toLowerCase().startsWith('es') ? 'es' : 'en'
}

/** Returns the current active language code ('en' | 'es'). */
export function useLang(): Lang {
  const { i18n } = useTranslation()
  return pickLang(i18n.language)
}
