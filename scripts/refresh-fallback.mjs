/**
 * Regenerates the offline fallback (public/data/*.json) from the live career API,
 * through the same adapters the site uses (src/lib/adapters.ts), so the snapshot
 * always has the shape PortfolioDataContext applies directly.
 *
 * Run: npm run refresh-fallback
 */
import { writeFileSync } from 'fs'
import { createServer } from 'vite'

const API = (process.env.VITE_CAREER_API_URL ?? 'https://api.sebas1705.dev').replace(/\/$/, '')
const get = async path => {
  const res = await fetch(`${API}${path}`)
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`)
  return res.json()
}

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { adaptAll } = await vite.ssrLoadModule('/src/lib/adapters.ts')
  const all = await get('/all')
  const data = adaptAll({
    personal: all.personal, softSkills: all['soft-skills'], skills: all.skills, jobs: all.jobs,
    projects: all.projects, education: all.education, certifications: all.certifications,
  })
  const files = {
    personal: data.personal,
    'soft-skills': data.softSkills,
    skills: data.skills,
    jobs: data.jobs,
    projects: data.projects,
    education: data.education,
  }
  for (const [name, value] of Object.entries(files)) {
    writeFileSync(`public/data/${name}.json`, JSON.stringify(value, null, 2) + '\n')
    console.log(`public/data/${name}.json`)
  }
} finally {
  await vite.close()
}
