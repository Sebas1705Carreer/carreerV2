import { StrictMode } from 'react'
import { LazyMotion, domAnimation } from 'framer-motion'
import { createRoot } from 'react-dom/client'
import './i18n'
// Self-hosted fonts, only the faces the UI uses (font-display: swap): Inter as one variable file
// (300–800), Space Grotesk 700 (display; 600 resolves to it) and JetBrains Mono 400/700
import '@fontsource-variable/inter/wght.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/700.css'
import './index.css'
import App from './App.tsx'
import { PortfolioProvider } from './context/PortfolioDataContext.tsx'
import { preloadInitialSections } from './sections'

// The static snapshot stays on screen until the first render's section chunk is in, so a deep
// link (#projects) or the single-page view never paints an empty section first.
const viewAll = new URLSearchParams(window.location.search).get('view') === 'all'
void preloadInitialSections(viewAll, window.location.hash).then(() => createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PortfolioProvider>
      {/* Components use the slim `m` + domAnimation (animations, exit, gestures) instead of the
          full `motion` bundle; the one shared-layout animation loads domMax itself. */}
      <LazyMotion features={domAnimation}>
        <App />
      </LazyMotion>
    </PortfolioProvider>
  </StrictMode>,
))
