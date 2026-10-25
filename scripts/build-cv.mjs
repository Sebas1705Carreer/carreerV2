/**
 * Renders the static CV PDFs (public/cv/cv-en.pdf, public/cv/cv-es.pdf) from the
 * SAME @react-pdf document the in-browser generator uses (src/components/cv/CVDocument.tsx),
 * so the files Vite copies to dist/cv/ are always in sync with the site.
 *
 * Data: GET /all from the career API, adapted through src/lib/adapters.ts; if the
 * API is unreachable the snapshot in public/data/*.json is used instead.
 *
 * Run: npm run build-cv   (also runs as part of `npm run build`)
 */
import { mkdirSync, readFileSync, statSync } from 'fs'
import { createServer } from 'vite'
import { createElement } from 'react'
import { renderToFile } from '@react-pdf/renderer'

const API = (process.env.VITE_CAREER_API_URL ?? 'https://api.sebas1705.dev').replace(/\/$/, '')
const OUT_DIR = 'public/cv'
const LANGS = ['en', 'es']
const ROLE = 'fullstack'

const readLocal = name => JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'))

async function loadData(adaptAll) {
  try {
    const res = await fetch(`${API}/all`, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) throw new Error(`/all: HTTP ${res.status}`)
    const all = await res.json()
    console.log(`[build-cv] data: ${API}/all`)
    return adaptAll({
      personal: all.personal, softSkills: all['soft-skills'], skills: all.skills, jobs: all.jobs,
      projects: all.projects, education: all.education, certifications: all.certifications,
    })
  } catch (err) {
    console.warn(`[build-cv] API unreachable (${err.message}), using public/data snapshot`)
    return {
      personal: readLocal('personal'), skills: readLocal('skills'), jobs: readLocal('jobs'),
      projects: readLocal('projects'), education: readLocal('education'),
    }
  }
}

/** GitHub avatar as data-URL for the HR header; the PDF still renders without it. */
async function loadAvatar(githubUrl) {
  const user = githubUrl?.split('/').filter(Boolean).pop()
  if (!user) return undefined
  try {
    const res = await fetch(`https://avatars.githubusercontent.com/${user}?size=240`, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const type = res.headers.get('content-type') ?? 'image/png'
    return `data:${type};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
  } catch (err) {
    console.warn(`[build-cv] avatar unavailable (${err.message}), rendering without photo`)
    return undefined
  }
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { adaptAll } = await vite.ssrLoadModule('/src/lib/adapters.ts')
  const { CVDocument } = await vite.ssrLoadModule('/src/components/cv/CVDocument.tsx')
  const data = await loadData(adaptAll)
  const avatar = await loadAvatar(data.personal.social?.github)

  mkdirSync(OUT_DIR, { recursive: true })
  for (const lang of LANGS) {
    const file = `${OUT_DIR}/cv-${lang}.pdf`
    const doc = createElement(CVDocument, { lang, role: ROLE, avatar, ...data })
    await renderToFile(doc, file)
    const size = statSync(file).size
    if (size < 20 * 1024) throw new Error(`${file} is suspiciously small (${size} bytes)`)
    console.log(`${file} (${(size / 1024).toFixed(0)} KB)`)
  }
} finally {
  await vite.close()
}
