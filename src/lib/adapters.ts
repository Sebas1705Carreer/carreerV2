import type { ML } from './localize'
import type {
  PortfolioRawData, RawCert, RawEduItem, RawJob, RawPersonal, RawPillar, RawProject, RawSkill, RawSoftSkill,
} from '../context/PortfolioDataContext'

/*
 * Pure API → portfolio-shape adapters, shared by the data provider and by
 * scripts/refresh-fallback.mjs (which regenerates public/data/*.json).
 */

export const PILLARS: RawPillar[] = [
  { icon: '🔭', title: { en: 'Curiosity', es: 'Curiosidad' }, desc: { en: 'I stay current with the latest tech developments and love exploring new ideas and tools.', es: 'Me mantengo al día con los últimos avances tecnológicos y disfruto explorando nuevas ideas y herramientas.' } },
  { icon: '⚡', title: { en: 'Constancy', es: 'Constancia' }, desc: { en: 'I sustain effort on complex, long-term projects, pushing through challenges with dedication.', es: 'Mantengo el esfuerzo en proyectos complejos y a largo plazo, superando desafíos con dedicación.' } },
  { icon: '🎯', title: { en: 'Responsibility', es: 'Responsabilidad' }, desc: { en: 'I deliver professional work with commitment, meeting standards with attention to detail.', es: 'Entrego trabajo profesional con compromiso, cumpliendo estándares con atención al detalle.' } },
]

// ── API response → portfolio shape adapters ───────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ml = (en: any, es: any): ML => ({ en: en ?? '', es: es ?? '' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parse = (v: any) => { try { return typeof v === 'string' ? JSON.parse(v) : v } catch { return [] } }

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
