import { defineConfig } from 'vitest/config'

// Unit tests only (pure adapters / helpers). Browser smoke tests live in e2e/ (Playwright).
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    environment: 'node',
  },
})
