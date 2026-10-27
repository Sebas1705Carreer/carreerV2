import { useTranslation } from 'react-i18next'
import { demoKind } from '../lib/projectAssets'

/** Button label for a demo link: "Google Play", "Download" or "Live demo" */
export function useDemoLabel() {
  const { t } = useTranslation()
  return (url: string) => {
    const kind = demoKind(url)
    return t(kind === 'play' ? 'projects.view_play' : kind === 'download' ? 'projects.view_download' : 'projects.view_demo')
  }
}
