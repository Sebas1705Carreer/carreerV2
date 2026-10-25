import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { staticSnapshot } from './scripts/static-snapshot'

export default defineConfig({
  plugins: [react(), tailwindcss(), staticSnapshot()],
  base: process.env.VITE_BASE_PATH ?? '/',
})
