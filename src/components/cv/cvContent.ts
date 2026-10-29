import { localize } from '../../lib/localize'
import type { PortfolioRawData, RawCert, RawProject, RawSkill } from '../../context/PortfolioDataContext'
import { ROLES, SPOKEN_LANGS, type RoleId } from './profiles'

/*
 * Pure data mapping for the CV (no React): turns the portfolio data (API or
 * public/data snapshot) plus a role profile into everything the PDF documents
 * and the in-browser preview print. Kept separate so it can be unit-tested
 * without rendering a PDF.
 */

export type CvLang = 'en' | 'es'

/** Fallback when the API carries no cv_url to derive the portfolio address from */
const DEFAULT_PORTFOLIO_URL = 'https://sebas1705carreer.github.io/carreerV2/'

export interface CvLink { url: string; label: string }

export interface CvSkillRow { key: string; label: string; names: string[] }

export interface CvProject {
  id: string
  name: string
  context: string
  desc: string
  tags: string[]
  links: CvLink[]
}

export interface CvContent {
  roleTitle: string
  tagline: string
  summary: string
  portfolio: CvLink
  keywords: string[]
  contact: { email: string; location: string; links: CvLink[] }
  skillRows: CvSkillRow[]
  projects: CvProject[]
  certs: RawCert[]
  spokenLangs: { lang: string; level: string }[]
}

/**
 * Short, printable form of a URL: no scheme, no `www.`, no trailing slash, and
 * non-ASCII characters percent-encoded (so a LinkedIn slug with accents prints
 * the same address the link opens).
 */
export function displayUrl(raw: string): string {
  try {
    const u = new URL(raw.trim())
    if (u.hostname === 'play.google.com') return 'Google Play'
    const path = u.pathname.replace(/\/+$/, '')
    return `${u.hostname.replace(/^www\./, '')}${path}`
  } catch {
    return raw
  }
}

/** Portfolio root, derived from the published CV URL (…/cv/cv-en.pdf → …/) */
export function portfolioUrl(personal: Pick<PortfolioRawData['personal'], 'cvUrl'>): string {
  const fromCv = personal.cvUrl?.replace(/cv\/[^/]*$/, '')
  return fromCv && /^https?:\/\//.test(fromCv) && fromCv !== personal.cvUrl ? fromCv : DEFAULT_PORTFOLIO_URL
}

const CONTEXT_LABEL: Record<string, Record<CvLang, string>> = {
  work:     { en: 'Client work · Solusoft', es: 'Cliente · Solusoft' },
  personal: { en: 'Personal',               es: 'Personal' },
  academic: { en: 'Academic',               es: 'Académico' },
}

/** Skill rows in print order; any category not listed lands in the last row */
const SKILL_ROWS: { key: string; cats: string[]; label: Record<CvLang, string> }[] = [
  { key: 'languages',    cats: ['languages'],                     label: { en: 'Languages',                es: 'Lenguajes' } },
  { key: 'frameworks',   cats: ['frameworks'],                    label: { en: 'Frameworks & Platforms',   es: 'Frameworks y plataformas' } },
  { key: 'clouddb',      cats: ['cloud', 'databases'],            label: { en: 'Cloud & Databases',        es: 'Cloud y bases de datos' } },
  { key: 'tools',        cats: ['tools'],                         label: { en: 'Tools, CI & Testing',      es: 'Herramientas, CI y testing' } },
  { key: 'architecture', cats: ['architecture', 'methodologies'], label: { en: 'Architecture & Practices', es: 'Arquitectura y prácticas' } },
  { key: 'ai',           cats: ['ai'],                            label: { en: 'AI',                       es: 'IA' } },
]
const OTHER_ROW = { key: 'other', label: { en: 'Other', es: 'Otros' } }

/**
 * Every API skill, grouped by category. Within a row the role's priority list
 * comes first (core stack), then the rest by level (highest first), then API order.
 */
export function groupSkills(skills: RawSkill[], priority: string[], lang: CvLang): CvSkillRow[] {
  const rank = (s: RawSkill) => {
    const i = priority.indexOf(s.id)
    return i === -1 ? Number.POSITIVE_INFINITY : i
  }
  const ordered = skills
    .map((s, i) => ({ s, i }))
    .sort((a, b) => rank(a.s) - rank(b.s) || (b.s.level ?? 0) - (a.s.level ?? 0) || a.i - b.i)
    .map(({ s }) => s)

  const known = new Set(SKILL_ROWS.flatMap(r => r.cats))
  const rows: CvSkillRow[] = SKILL_ROWS.map(r => ({
    key: r.key,
    label: r.label[lang],
    names: ordered.filter(s => r.cats.includes(s.category)).map(s => s.name),
  }))
  rows.push({ key: OTHER_ROW.key, label: OTHER_ROW.label[lang], names: ordered.filter(s => !known.has(s.category)).map(s => s.name) })
  return rows.filter(r => r.names.length > 0)
}

/** Public links of a project: live site first, then the repo; a demo that is just the repo's releases page is skipped */
export function projectLinks(p: Pick<RawProject, 'github' | 'demo'>): CvLink[] {
  const links: CvLink[] = []
  const repo = p.github?.replace(/\/+$/, '')
  if (p.demo && !(repo && p.demo.startsWith(repo))) links.push({ url: p.demo, label: displayUrl(p.demo) })
  if (p.github) links.push({ url: p.github, label: displayUrl(p.github) })
  return links
}

export interface CvContentInput {
  lang: CvLang
  role: RoleId
  personal: PortfolioRawData['personal']
  skills: PortfolioRawData['skills']
  projects: PortfolioRawData['projects']
  education: PortfolioRawData['education']
}

export function buildCvContent({ lang, role, personal, skills, projects, education }: CvContentInput): CvContent {
  const profile = ROLES[role]
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)

  // The headline role comes from the API; role variants override it with their own focus
  const roleTitle = profile.label?.[lang] || loc(personal.role)

  const all = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const cvProjects = profile.projectIds
    .map(id => all.find(p => p.id === id))
    .filter((p): p is RawProject => !!p)
    .map(p => ({
      id: p.id,
      name: p.name,
      context: CONTEXT_LABEL[p.context]?.[lang] ?? p.context,
      desc: loc(p.desc),
      tags: (p.tags ?? []).filter(t => t !== 'NDA'),
      links: projectLinks(p),
    }))

  const portfolio = portfolioUrl(personal)
  const links: CvLink[] = []
  if (personal.social?.linkedin) links.push({ url: personal.social.linkedin, label: displayUrl(personal.social.linkedin) })
  if (personal.social?.github) links.push({ url: personal.social.github, label: displayUrl(personal.social.github) })
  links.push({ url: portfolio, label: displayUrl(portfolio) })

  return {
    roleTitle,
    tagline: loc(personal.tagline),
    summary: profile.summary[lang],
    portfolio: { url: portfolio, label: displayUrl(portfolio) },
    keywords: profile.keywords[lang],
    contact: { email: personal.email, location: loc(personal.location), links },
    skillRows: groupSkills(skills ?? [], profile.prioritySkillIds, lang),
    projects: cvProjects,
    certs: (education.certs ?? []).slice(0, profile.maxCerts),
    spokenLangs: SPOKEN_LANGS[lang],
  }
}
