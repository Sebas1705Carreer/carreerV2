import { describe, expect, it } from 'vitest'
import {
  PILLARS, adaptAll, adaptEducation, adaptJobs, adaptPersonal, adaptProjects, adaptSkills, adaptSoftSkills,
} from './adapters'

const apiPersonal = {
  name: 'Sebastián Entrerrios García',
  greeting: { en: 'Hi, I\'m', es: 'Hola, soy' },
  role: { en: 'Full Stack & Mobile Developer', es: 'Desarrollador Full Stack & Móvil' },
  tagline: { en: 'Tagline', es: 'Eslogan' },
  bio: { en: 'Bio', es: 'Biografía' },
  email: 'me@example.com',
  location: { en: 'Madrid, Spain', es: 'Madrid, España' },
  cv_url: 'https://example.com/cv.pdf',
  github: 'https://github.com/x',
  linkedin: 'https://linkedin.com/in/x',
  codewars: 'https://codewars.com/users/x',
}

describe('adaptPersonal', () => {
  it('maps the API row to the UI shape (snake_case cv_url, flat socials)', () => {
    const p = adaptPersonal(apiPersonal)
    expect(p.name).toBe('Sebastián Entrerrios García')
    expect(p.role).toEqual({ en: 'Full Stack & Mobile Developer', es: 'Desarrollador Full Stack & Móvil' })
    expect(p.cvUrl).toBe('https://example.com/cv.pdf')
    expect(p.social).toEqual({ github: 'https://github.com/x', linkedin: 'https://linkedin.com/in/x', codewars: 'https://codewars.com/users/x' })
    expect(p.pillars).toBe(PILLARS)
  })

  it('fills missing fields with empty LocalizedStrings instead of undefined', () => {
    const p = adaptPersonal({})
    expect(p.name).toBe('')
    expect(p.greeting).toEqual({ en: '', es: '' })
    expect(p.location).toEqual({ en: '', es: '' })
    expect(p.cvUrl).toBeUndefined()
    expect(p.social).toEqual({ github: '', linkedin: '', codewars: '' })
  })

  it('keeps a plain-string LocalizedString untouched', () => {
    expect(adaptPersonal({ role: 'Developer' }).role).toBe('Developer')
  })
})

describe('adaptJobs', () => {
  const row = {
    id: 'j1',
    role: { en: 'Dev', es: 'Desarrollador' },
    company: 'ACME',
    companyUrl: 'https://acme.test',
    startDate: '2024-01',
    endDate: null,
    period: { en: '2024 - Present', es: '2024 - Presente' },
    type: { en: 'Hybrid', es: 'Híbrido' },
    desc: { en: 'Desc', es: 'Descr' },
    achievements: { en: ['Shipped A', 'Shipped B'], es: ['Entregué A'] },
    projects: ['P1', 'P2'],
  }

  it('zips achievements per language, falling back to English when Spanish is shorter', () => {
    const [job] = adaptJobs([row])
    expect(job.achievements).toEqual([
      { en: 'Shipped A', es: 'Entregué A' },
      { en: 'Shipped B', es: 'Shipped B' },
    ])
  })

  it('wraps project names as LocalizedStrings and accepts a JSON-encoded array', () => {
    const [arr] = adaptJobs([row])
    expect(arr.projects).toEqual([{ en: 'P1', es: 'P1' }, { en: 'P2', es: 'P2' }])
    const [str] = adaptJobs([{ ...row, projects: '["Q"]' }])
    expect(str.projects).toEqual([{ en: 'Q', es: 'Q' }])
  })

  it('tolerates missing optional fields', () => {
    const [job] = adaptJobs([{ id: 'j2', role: 'Dev', company: 'X', companyUrl: '', period: '', type: '', desc: '' }])
    expect(job.achievements).toEqual([])
    expect(job.projects).toEqual([])
    expect(job.startDate).toBeUndefined()
    expect(job.endDate).toBeNull()
    expect(job.long_desc).toBeUndefined()
  })

  it('does not crash on malformed JSON project strings', () => {
    const [job] = adaptJobs([{ id: 'j3', projects: '{not json' }])
    expect(job.projects).toEqual([])
  })
})

describe('adaptProjects', () => {
  const rows = [
    { id: 'w', name: 'Work app', context: 'work', desc: { en: 'd' }, long_desc: { en: 'ld' }, tags: ['Kotlin'], github: null, demo: 'https://play.google.com/x' },
    { id: 'f', name: 'Side project', context: 'personal', desc: 'd', long_desc: 'ld', tags: '["React","Vite"]' },
  ]

  it('splits work vs featured by context and parses JSON tags', () => {
    const { work, featured } = adaptProjects(rows)
    expect(work.map(p => p.id)).toEqual(['w'])
    expect(featured.map(p => p.id)).toEqual(['f'])
    expect(featured[0].tags).toEqual(['React', 'Vite'])
  })

  it('normalises missing links to null', () => {
    const { featured } = adaptProjects(rows)
    expect(featured[0].github).toBeNull()
    expect(featured[0].demo).toBeNull()
  })
})

describe('adaptEducation', () => {
  it('maps known icon names to emoji and keeps unknown/custom icons', () => {
    const { items } = adaptEducation(
      [
        { degree: 'A', school: 'S', period: 'P', detail: 'D', icon: 'university' },
        { degree: 'B', school: 'S', period: 'P', detail: 'D', icon: 'school' },
        { degree: 'C', school: 'S', period: 'P', detail: 'D', icon: '🧪' },
        { degree: 'D', school: 'S', period: 'P', detail: 'D' },
      ],
      [],
    )
    expect(items.map(i => i.icon)).toEqual(['🎓', '🏫', '🧪', '🎓'])
  })

  it('maps certifications, keeping url null for in-progress ones', () => {
    const { certs } = adaptEducation([], [
      { id: 'c1', name: { en: 'Cert', es: 'Certificado' }, issuer: 'Org', date: '2026', url: null },
      { id: 'c2', name: 'Cert 2', issuer: 'Org', date: '2025', url: 'https://cert.test', long_desc: 'x' },
    ])
    expect(certs[0].url).toBeNull()
    expect(certs[0].long_desc).toBeUndefined()
    expect(certs[1]).toMatchObject({ id: 'c2', url: 'https://cert.test', long_desc: 'x' })
  })
})

describe('adaptSkills / adaptSoftSkills', () => {
  it('renames icon_url → iconUrl', () => {
    expect(adaptSkills([{ id: 'kt', name: 'Kotlin', icon_url: 'https://i/kt.svg', level: 4, category: 'mobile' }]))
      .toEqual([{ id: 'kt', name: 'Kotlin', iconUrl: 'https://i/kt.svg', level: 4, category: 'mobile' }])
  })

  it('defaults soft-skill icon and name', () => {
    expect(adaptSoftSkills([{ name: { en: 'Teamwork', es: 'Trabajo en equipo' } }, {}])).toEqual([
      { icon: '✦', name: { en: 'Teamwork', es: 'Trabajo en equipo' } },
      { icon: '✦', name: { en: '', es: '' } },
    ])
  })
})

describe('adaptAll', () => {
  it('assembles the full portfolio shape from the /all payload', () => {
    const data = adaptAll({
      personal: apiPersonal,
      softSkills: [{ icon: '🤝', name: 'Teamwork' }],
      skills: [{ id: 'ts', name: 'TypeScript', level: 3, category: 'web' }],
      jobs: [],
      projects: [],
      education: [],
      certifications: [],
    })
    expect(Object.keys(data).sort()).toEqual(['education', 'jobs', 'personal', 'projects', 'skills', 'softSkills'])
    expect(data.projects).toEqual({ work: [], featured: [] })
    expect(data.education).toEqual({ items: [], certs: [] })
    expect(data.skills[0].iconUrl).toBeUndefined()
  })
})
