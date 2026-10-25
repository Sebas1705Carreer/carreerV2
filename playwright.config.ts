import { defineConfig, devices } from '@playwright/test'

/*
 * Smoke e2e against the production build served by `vite preview`.
 * Run `npm run build` first (CI does). VITE_BASE_PATH must match the one the
 * build used (CI builds with /carreerV2/, the GitHub Pages path).
 */
const base = process.env.VITE_BASE_PATH ?? '/'
const port = 4173

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${port}${base}`,
    locale: 'en-US',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run preview -- --port ${port} --strictPort`,
    url: `http://localhost:${port}${base}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
