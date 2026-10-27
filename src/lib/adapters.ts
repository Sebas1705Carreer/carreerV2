import type { ML } from './localize'
import { safeImageUrl } from './projectImage'
import type {
  PortfolioRawData, RawCert, RawEduItem, RawJob, RawPersonal, RawPillar, RawProject, RawSkill, RawSoftSkill,
} from '../context/PortfolioDataContext'

/*
 * Pure API → portfolio-shape adapters, shared by the data provider and by
 * scripts/refresh-fallback.mjs (which regenerates public/data/*.json).
 */

export const PILLARS: RawPillar[] = [
  { icon: '🔭', title: { en: 'Curiosity', es: 'Curiosidad' }, desc: { en: 'New tools get a real project first: Kotlin Multiplatform, Wails, AI-assisted workflows. What proves itself moves into client work.', es: 'Las herramientas nuevas se prueban primero en un proyecto real: Kotlin Multiplatform, Wails, flujos con IA. Lo que funciona pasa al trabajo con clientes.' } },
  { icon: '⚡', title: { en: 'Constancy', es: 'Constancia' }, desc: { en: 'Side projects that ship: Owlsplit went from a written spec to a public beta on Google Play, with CI, tests and docs along the way.', es: 'Proyectos personales que se publican: Owlsplit pasó de una especificación escrita a una beta pública en Google Play, con CI, tests y documentación.' } },
  { icon: '🎯', title: { en: 'Responsibility', es: 'Responsabilidad' }, desc: { en: 'Client apps in production at Solusoft: reviewed, tested and documented so the next person can maintain them.', es: 'Apps de clientes en producción en Solusoft: revisadas, probadas y documentadas para que otra persona pueda mantenerlas.' } },
]

// ── API response → portfolio shape adapters ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ml = (en: any, es: any): ML => ({ en: en ?? '', es: es ?? '' })
/** Accepts a JSON-encoded array or a plain array; anything else (undefined, bad JSON, objects) → [] */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (v: any): any[] => {
  try {
    const out = typeof v === 'string' ? JSON.parse(v) : v
    return Array.isArray(out) ? out : []
  } catch { return [] }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptPersonal(raw: any): RawPersonal {
  return {
    name:     raw.name     ?? '',
    greeting: raw.greeting ?? ml('', ''),
    role:     raw.role     ?? ml('', ''),
    tagline:  raw.tagline  ?? ml('', ''),
    bio:      raw.bio      ?? ml('', ''),
    email:    raw.email    ?? '',
    location: raw.location ?? ml('', ''),
    cvUrl:    raw.cv_url   ?? undefined,
    social: {
      github:   raw.github   ?? '',
      linkedin: raw.linkedin ?? '',
      codewars: raw.codewars ?? '',
    },
    pillars: PILLARS,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptJobs(rows: any[]): RawJob[] {
  return rows.map(r => {
    // achievements: API returns { en: string[], es: string[] } → zip into ML[]
    const achEn: string[] = r.achievements?.en ?? []
    const achEs: string[] = r.achievements?.es ?? []
    const achievements: ML[] = achEn.map((en, i) => ml(en, achEs[i] ?? en))

    // projects: API returns string[] (project IDs / names) → wrap as ML[]
    const projectNames: string[] = Array.isArray(r.projects) ? r.projects : parse(r.projects)
    const projects: ML[] = projectNames.map(p => ml(p, p))

    return {
      id:         r.id,
      role:       r.role,
      company:    r.company,
      companyUrl: r.companyUrl,
      startDate:  r.startDate ?? undefined,
      endDate:    r.endDate ?? null,
      period:     r.period,
      type:       r.type,
      desc:       r.desc,
      long_desc:  r.long_desc ?? undefined,
      projects,
      achievements,
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptProjects(rows: any[]): { work: RawProject[]; featured: RawProject[] } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toProject = (r: any): RawProject => ({
    id:        r.id,
    name:      r.name,
    context:   r.context,
    desc:      r.desc,
    long_desc: r.long_desc,
    tags:      Array.isArray(r.tags) ? r.tags : parse(r.tags),
    github:    r.github ?? null,
    demo:      r.demo ?? null,
    imageUrl:  safeImageUrl(r.image_url),
    imageAlt:  r.image_alt && typeof r.image_alt === 'object' ? r.image_alt : null,
  })
  return {
    work:     rows.filter(r => r.context === 'work').map(toProject),
    featured: rows.filter(r => r.context !== 'work').map(toProject),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptEducation(eduRows: any[], certRows: any[]): { items: RawEduItem[]; certs: RawCert[] } {
  return {
    items: eduRows.map(r => ({
      degree: r.degree,
      school: r.school,
      period: r.period,
      detail: r.detail,
      long_desc: r.long_desc ?? undefined,
      icon:   ({ graduation: '🎓', university: '🎓', school: '🏫', master: '🎓' } as Record<string, string>)[r.icon] ?? r.icon ?? '🎓',
    })),
    certs: certRows.map(r => ({
      id:        r.id,
      name:      r.name,
      issuer:    r.issuer,
      date:      r.date,
      url:       r.url ?? null,
      long_desc: r.long_desc ?? undefined,
    })),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adaptSoftSkills = (rows: any[]): RawSoftSkill[] =>
  rows.map(s => ({ icon: s.icon ?? '✦', name: s.name ?? ml('', '') }))

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adaptSkills = (rows: any[]): RawSkill[] =>
  rows.map(s => ({ id: s.id, name: s.name, iconUrl: s.icon_url, level: s.level, category: s.category }))

/** Raw API responses, one per endpoint */
export interface ApiPayload {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personal: any; softSkills: any[]; skills: any[]; jobs: any[]; projects: any[]; education: any[]; certifications: any[]
}

export const adaptAll = (r: ApiPayload): PortfolioRawData => ({
  personal:   adaptPersonal(r.personal),
  softSkills: adaptSoftSkills(r.softSkills),
  skills:     adaptSkills(r.skills),
  jobs:       adaptJobs(r.jobs),
  projects:   adaptProjects(r.projects),
  education:  adaptEducation(r.education, r.certifications),
})
