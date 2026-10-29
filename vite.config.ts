import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { staticSnapshot } from './scripts/static-snapshot'
import { fontPreload } from './scripts/font-preload'

export default defineConfig({
  plugins: [react(), tailwindcss(), staticSnapshot(), fontPreload()],
  base: process.env.VITE_BASE_PATH ?? '/',
  build: {
    // Never inline font files as data: URIs: they would bloat the render-blocking CSS with
    // subsets (cyrillic, greek, vietnamese…) the browser would otherwise never download
    assetsInlineLimit: file => (/\.woff2?$/.test(file) ? false : undefined),
  },
})
