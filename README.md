# carreerV2 - Personal Portfolio

Personal portfolio v2 built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. Deployed as a static site on GitHub Pages, consuming live data from the career API. Includes an in-browser **PDF CV generator**.

**Live site:** https://sebas1705carreer.github.io/carreerV2/

---

## Features

- **React 19 + Vite** - Fast build tooling and modern React
- **Tailwind CSS v4** - Utility-first styling with zero config
- **Framer Motion** - Smooth section animations
- **i18next** - Internationalization with browser language detection
- **CV PDF** - Static `cv/cv-en.pdf` and `cv/cv-es.pdf` rendered at build time (`scripts/build-cv.mjs`) from the same react-pdf document as the in-browser generator
- **PDF CV generator** - Role-specific and ATS variants exported directly from the browser (react-pdf)
- **SEO** - robots.txt, sitemap.xml, JSON-LD Person schema and a static HTML snapshot of the main sections injected at build time (`scripts/static-snapshot.ts`)
- **Live API data** - All content loaded from career-api at runtime
- **Project assets from each repo** - Icons, 2:1 banners, `portfolio.json` (accent, alt text) and `case-study.<lang>.md` read from `.github/portfolio/` in every project repo (`src/lib/projectAssets.ts`). Precedence: API `image_url` → repo banner → generated plate. The production build HEAD-checks the files and inlines a manifest, so only existing assets are requested; case studies render through marked + DOMPurify, loaded on demand
- **CI/CD** - GitHub Actions build + GitHub Pages deploy

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 8 |
| Language | TypeScript 6 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| i18n | i18next + react-i18next |
| PDF export | @react-pdf/renderer |
| Data source | career-api (Cloudflare Workers + KV) |
| Hosting | GitHub Pages |

---

## Project Structure

```
carreerV2/
  public/
    data/                  # Local JSON fallback data
      personal.json
      jobs.json
      projects.json
      skills.json
      soft-skills.json
      education.json       # items + certifications
    cv/                    # cv-en.pdf, cv-es.pdf (generated, git-ignored)
    robots.txt
    sitemap.xml
    favicon.svg
    icons.svg
  src/
    App.tsx                # Root component, routing
    assets/                # Static images
    components/
      layout/              # Background, Controls, NavDots, SectionDecor
      sections/            # HeroSection, AboutSection, ExperienceSection,
                           #   EducationSection, ProjectsSection, SkillsSection,
                           #   ContactSection
      ui/                  # Reusable cards and modals (JobCard, ProjectCard ...)
      cv/                  # CVDocument.tsx (react-pdf documents), profiles.ts (role profiles)
      CVGenerator.tsx      # In-browser PDF CV generator modal
  scripts/
    build-cv.mjs           # Static CV PDFs (runs inside `npm run build`)
    static-snapshot.ts     # Vite plugin: crawlable HTML snapshot in index.html
    refresh-fallback.mjs   # Regenerates public/data/*.json from the API
  .github/workflows/
    deploy.yml             # Build + GitHub Pages deploy
```

---

## Quick Start

Prerequisites: Node.js 20+, npm

```bash
git clone https://github.com/Sebas1705Carreer/carreerV2.git
cd carreerV2
npm install
npm run dev
```

### Available Scripts

```bash
npm run dev      # Dev server with hot reload
npm run build    # Production build
npm run preview  # Preview production build locally
npm run lint     # ESLint
npm test         # Vitest unit tests (adapters, localize, section routing, language pick, static snapshot)
npm run test:e2e # Playwright smoke + axe accessibility checks against `vite preview` of the built site
npm run build-cv # Render public/cv/cv-{en,es}.pdf from the API (fallback: public/data)
```

First e2e run: `npm run build && npx playwright install chromium`. The e2e suite serves `dist/` with the same `VITE_BASE_PATH` the build used (unset locally, `/carreerV2/` in CI).

### Accessibility

- `<main>` landmark with a skip link, `aria-current` on the section nav, and an `aria-live` region announcing the section that comes into view.
- `prefers-reduced-motion`: the slide transition, nav dots and ambient glyphs switch to instant/static (framer-motion `useReducedMotion`), CSS transitions are disabled in `index.css`.
- **Single-page view** (`?view=all`, toggle in the top-right controls): every section stacked in a normal scrolling document for Ctrl+F, screen-reader reading order and printing.
- Every CI run executes axe-core (WCAG 2.1 A/AA) on both views and fails on serious/critical violations.

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_CAREER_API_URL` | Base URL for career-api | `https://api.sebas1705.dev` |
| `VITE_BASE_PATH` | GitHub Pages base path | `/carreerV2/` |
| `PORTFOLIO_ASSETS_CHECK` | `0` skips the build-time HEAD checks of project assets (offline builds) | checks on |

Set in `.env` for local development or as CI secrets for production.

---

## CI/CD

Runs on every push to `main`:

1. **build** - `npm ci` + `npm run lint` + `npm test` + `npm run build` (with `VITE_BASE_PATH=/carreerV2/`): type-check, render `public/cv/*.pdf` from the API, Vite build; then `npm run test:e2e` (Playwright Chromium, cached per version) against the built site
2. **deploy** - GitHub Pages (push to `main` only; pull requests run the build job alone)

---

## Related Repositories

| Repo | Description |
|---|---|
| [career-api-worker](https://github.com/Sebas1705Carreer/career-api-worker) | Cloudflare Workers + KV API powering the data |
| [carreerV1](https://github.com/Sebas1705Carreer/carreerV1) | Portfolio v1 - Astro SSG, Clean Architecture, 10 languages |
| [career-editor-kmp](https://github.com/Sebas1705Carreer/career-editor-kmp) | KMP desktop/Android editor for career-api data |
