# carreerV2 - Personal Portfolio

Personal portfolio v2 built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**. Deployed as a static site on GitHub Pages, consuming live data from the career API. Includes an in-browser **PDF CV generator**.

**Live site:** https://sebas1705carreer.github.io/carreerV2/

---

## Features

- **React 19 + Vite** - Fast build tooling and modern React
- **Tailwind CSS v4** - Utility-first styling with zero config
- **Framer Motion** - Smooth section animations
- **i18next** - Internationalization with browser language detection
- **PDF CV generator** - Export your CV as a PDF directly from the browser (react-pdf)
- **Live API data** - All content loaded from career-api at runtime
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
| Data source | career-api (Cloudflare Workers + D1) |
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
      education.json
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
      CVGenerator.tsx      # PDF CV generator (react-pdf)
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
```

---

## Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_CAREER_API_URL` | Base URL for career-api | `https://career-api.sebas1705.workers.dev` |
| `VITE_BASE_PATH` | GitHub Pages base path | `/carreerV2/` |

Set in `.env` for local development or as CI secrets for production.

---

## CI/CD

Runs on every push to `main`:

1. **build** - `npm ci` + `npm run build` (with `VITE_BASE_PATH=/carreerV2/`)
2. **deploy** - GitHub Pages

---

## Related Repositories

| Repo | Description |
|---|---|
| [career-api-worker](https://github.com/Sebas1705Carreer/career-api-worker) | Cloudflare Workers + KV API powering the data |
| [carreerV1](https://github.com/Sebas1705Carreer/carreerV1) | Portfolio v1 - Astro SSG, Clean Architecture, 10 languages |
| [career-editor-kmp](https://github.com/Sebas1705Carreer/career-editor-kmp) | KMP desktop/Android editor for career-api data |
