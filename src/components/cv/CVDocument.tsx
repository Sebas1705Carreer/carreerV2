import {
  Document, Page, Text, View, Link, Image, StyleSheet,
} from '@react-pdf/renderer'
import { localize } from '../../lib/localize'
import type { PortfolioRawData } from '../../context/PortfolioDataContext'
import { ROLES, SPOKEN_LANGS, atsDates, type RoleId } from './profiles'

/*
 * Pure @react-pdf CV documents (HR + ATS variants).
 * No hooks, no DOM: shared by the in-browser generator (CVGenerator.tsx) and
 * by scripts/build-cv.mjs, which renders the static /cv/cv-{en,es}.pdf in CI.
 */


// ── PDF styles ────────────────────────────────────────────────────────────────
// Sin Font.register: @react-pdf no soporta woff2 (el registro anterior con
// fonts.gstatic caía en silencio) — Helvetica es una de las 14 fuentes
// estándar de PDF y no necesita registro ni red.

// Family ink palette — same brand as the site, the org and the Folio editor
const PURPLE = '#4A5AF0'
const DARK   = '#1e293b'
const MID    = '#475569'
const LIGHT  = '#94a3b8'
const BORDER = '#E0E4FD'

const s = StyleSheet.create({
  page:       { fontFamily: 'Helvetica', fontSize: 9, color: DARK, paddingTop: 28, paddingBottom: 28, paddingHorizontal: 32, lineHeight: 1.4 },
  // header
  header:     { flexDirection: 'row', gap: 12, marginBottom: 10 },
  headerText: { flex: 1 },
  photo:      { width: 62, height: 62, borderRadius: 31, borderWidth: 2, borderColor: PURPLE, objectFit: 'cover' },
  name:       { fontSize: 18, fontWeight: 700, color: DARK, letterSpacing: -0.5 },
  title:      { fontSize: 10, fontWeight: 700, color: PURPLE, marginTop: 2 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginTop: 5, fontSize: 7.5, color: MID, borderTopWidth: 1.5, borderTopColor: PURPLE, paddingTop: 4 },
  contactSep: { color: LIGHT },
  kwRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 5 },
  kw:         { fontSize: 7, fontWeight: 700, color: PURPLE, borderWidth: 1, borderColor: '#C7CDFB', backgroundColor: '#EEF0FE', borderRadius: 2, paddingHorizontal: 5, paddingVertical: 1 },
  // section heading
  h2:         { fontSize: 7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, color: PURPLE, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 2, marginTop: 12, marginBottom: 5 },
  // summary
  summary:    { fontSize: 8.5, color: '#334155', lineHeight: 1.5 },
  // job
  job:        { marginBottom: 8 },
  jobRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  jobTitle:   { fontSize: 9, fontWeight: 700, color: DARK },
  jobMeta:    { fontSize: 7.5, color: LIGHT },
  jobCompany: { fontSize: 8.5, fontWeight: 700, color: PURPLE, marginTop: 1 },
  jobDesc:    { fontSize: 8, color: MID, marginTop: 1 },
  bullet:     { fontSize: 8, color: '#334155', marginTop: 1.5, paddingLeft: 8 },
  jobProjs:   { fontSize: 7.5, color: LIGHT, marginTop: 2 },
  // skills
  skillRow:   { flexDirection: 'row', marginBottom: 3, alignItems: 'flex-start' },
  skillCat:   { fontSize: 7.5, fontWeight: 700, color: MID, width: 110 },
  skillList:  { flex: 1, fontSize: 8.5, color: DARK },
  // projects
  proj:       { marginBottom: 7 },
  projRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  projName:   { fontSize: 9, fontWeight: 700, color: DARK },
  projCtx:    { fontSize: 7.5, color: LIGHT },
  projDesc:   { fontSize: 8, color: MID, marginTop: 1.5 },
  projTags:   { fontSize: 7.5, color: LIGHT, marginTop: 1 },
  // edu
  edu:        { marginBottom: 7 },
  eduRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eduDeg:     { fontSize: 9, fontWeight: 700, color: DARK },
  eduPeriod:  { fontSize: 7.5, color: LIGHT },
  eduSchool:  { fontSize: 8, color: MID, fontWeight: 700, marginTop: 1 },
  eduDetail:  { fontSize: 7.5, color: LIGHT, marginTop: 1 },
  // certs
  certRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3.5 },
  certName:   { fontSize: 8.5, color: PURPLE, fontWeight: 700 },
  certMeta:   { fontSize: 7.5, color: LIGHT },
  // langs
  langRow:    { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  langItem:   { fontSize: 8.5, color: DARK },
  langBold:   { fontWeight: 700 },
  // link inline
  inlineLink: { fontSize: 7.5, color: PURPLE },
})

// ── PDF Document ──────────────────────────────────────────────────────────────
export interface CVDocProps {
  lang: 'en' | 'es'
  role: RoleId
  personal: PortfolioRawData['personal']
  skills: PortfolioRawData['skills']
  jobs: PortfolioRawData['jobs']
  projects: PortfolioRawData['projects']
  education: PortfolioRawData['education']
  /** Data-URL of the profile photo (HR variant only; ATS stays photo-free on purpose) */
  avatar?: string
}

export function CVDocument({ lang, role, personal, skills, jobs, projects, education, avatar }: CVDocProps) {
  const profile = ROLES[role]
  const isEs = lang === 'es'
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)

  const cvSkills = profile.prioritySkillIds
    .map(id => skills.find(s => s.id === id))
    .filter(Boolean) as typeof skills

  const skillGroups: Record<string, string[]> = {}
  cvSkills.forEach(s => {
    if (!skillGroups[s.category]) skillGroups[s.category] = []
    skillGroups[s.category].push(s.name)
  })

  const CV_ROW_ORDER = [
    { key: 'languages',     cats: ['languages'],              label: { en: 'Programming Languages', es: 'Lenguajes' } },
    { key: 'frameworks',    cats: ['frameworks'],             label: { en: 'Frameworks & Libraries', es: 'Frameworks' } },
    { key: 'tools',         cats: ['tools'],                  label: { en: 'Tools & DevOps',         es: 'Herramientas & DevOps' } },
    { key: 'clouddb',       cats: ['databases', 'cloud'],     label: { en: 'Cloud & Databases',      es: 'Cloud & Bases de datos' } },
    { key: 'architecture',  cats: ['architecture'],           label: { en: 'Architecture',            es: 'Arquitectura' } },
    { key: 'methodologies', cats: ['methodologies'],          label: { en: 'Methodologies',           es: 'Metodologías' } },
    { key: 'ai',            cats: ['ai', 'ides', 'os'],       label: { en: 'AI & Tools',              es: 'IA y Herramientas' } },
  ] as const

  const skillRows = CV_ROW_ORDER
    .map(row => ({ ...row, names: row.cats.flatMap(c => skillGroups[c] ?? []) }))
    .filter(row => row.names.length > 0)

  const allProjects = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const cvProjects = profile.projectIds
    .map(id => allProjects.find(p => p.id === id))
    .filter(Boolean) as typeof allProjects

  const cvCerts = (education.certs ?? []).slice(0, profile.maxCerts)
  const spokenLangs = SPOKEN_LANGS[isEs ? 'es' : 'en']
  const keywords    = isEs ? profile.keywordsEs : profile.keywordsEn
  const summary     = isEs ? profile.summaryEs  : profile.summaryEn
  const roleTitle   = isEs ? profile.labelEs    : profile.labelEn

  const expLabel   = isEs ? 'Experiencia Profesional' : 'Professional Experience'
  const skillsLbl  = isEs ? 'Habilidades Técnicas'    : 'Technical Skills'
  const projsLbl   = isEs ? 'Proyectos Destacados'    : 'Key Projects'
  const eduLbl     = isEs ? 'Formación Académica'     : 'Education'
  const certsLbl   = isEs ? 'Certificaciones'         : 'Certifications'
  const langsLbl   = isEs ? 'Idiomas'                 : 'Languages'
  const profileLbl = isEs ? 'Perfil Profesional'      : 'Professional Profile'

  return (
    <Document title={`CV – Sebastián Ramiro Entrerrios García`} author="Sebastián Ramiro Entrerrios García" subject={roleTitle} creator="Portfolio CV Generator" keywords={keywords.join(', ')}>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          {avatar && <Image style={s.photo} src={avatar} />}
          <View style={s.headerText}>
            <Text style={s.name}>Sebastián Ramiro Entrerrios García</Text>
            <Text style={s.title}>{roleTitle}</Text>
            <View style={s.contactRow}>
              <Link src={`mailto:${personal.email}`} style={s.inlineLink}>{personal.email}</Link>
              <Text style={s.contactSep}>  |  </Text>
              {personal.social?.linkedin && (
                <>
                  <Link src={personal.social.linkedin} style={s.inlineLink}>linkedin.com/in/sebastián-ramiro-entrerrios-garcía-b1a713217</Link>
                  <Text style={s.contactSep}>  |  </Text>
                </>
              )}
              {personal.social?.github && (
                <>
                  <Link src={personal.social.github} style={s.inlineLink}>github.com/Sebas1705</Link>
                  <Text style={s.contactSep}>  |  </Text>
                </>
              )}
              <Text>{loc(personal.location)}</Text>
            </View>
            <View style={s.kwRow}>
              {keywords.map(k => <Text key={k} style={s.kw}>{k}</Text>)}
            </View>
          </View>
        </View>

        {/* ── Profile ── */}
        <Text style={s.h2}>{profileLbl}</Text>
        <Text style={s.summary}>{summary}</Text>

        {/* ── Experience ── */}
        <Text style={s.h2}>{expLabel}</Text>
        {jobs.map(j => (
          <View key={j.id} style={s.job}>
            <View style={s.jobRow}>
              <Text style={s.jobTitle}>{loc(j.role)}</Text>
              <Text style={s.jobMeta}>{loc(j.period)} · {loc(j.type)}</Text>
            </View>
            <Text style={s.jobCompany}>{j.company}</Text>
            <Text style={s.jobDesc}>{loc(j.desc)}</Text>
            {(j.achievements ?? []).map((a, i) => (
              <Text key={i} style={s.bullet}>• {loc(a)}</Text>
            ))}
            {(j.projects ?? []).length > 0 && (
              <Text style={s.jobProjs}>
                {isEs ? 'Productos' : 'Products'}: {(j.projects ?? []).map(p => loc(p)).join(', ')}
              </Text>
            )}
          </View>
        ))}

        {/* ── Skills ── */}
        <Text style={s.h2}>{skillsLbl}</Text>
        {skillRows.map(row => (
          <View key={row.key} style={s.skillRow}>
            <Text style={s.skillCat}>{row.label[lang]}:</Text>
            <Text style={s.skillList}>{row.names.join(', ')}</Text>
          </View>
        ))}

        {/* ── Projects ── */}
        <Text style={s.h2}>{projsLbl}</Text>
        {cvProjects.slice(0, 5).map(p => (
          <View key={p.id} style={s.proj}>
            <View style={s.projRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Text style={s.projName}>{p.name}</Text>
                {p.github && <Link src={p.github} style={s.inlineLink}>GitHub ↗</Link>}
                {p.demo   && <Link src={p.demo}   style={s.inlineLink}>Demo ↗</Link>}
              </View>
              <Text style={s.projCtx}>{p.context}</Text>
            </View>
            <Text style={s.projDesc}>{loc(p.desc)}</Text>
            {(p.tags ?? []).length > 0 && (
              <Text style={s.projTags}>{(p.tags ?? []).slice(0, 7).join(', ')}</Text>
            )}
          </View>
        ))}

        {/* ── Education ── */}
        <Text style={s.h2}>{eduLbl}</Text>
        {(education.items ?? []).map((e, i) => (
          <View key={i} style={s.edu}>
            <View style={s.eduRow}>
              <Text style={s.eduDeg}>{loc(e.degree)}</Text>
              <Text style={s.eduPeriod}>{loc(e.period)}</Text>
            </View>
            <Text style={s.eduSchool}>{e.school}</Text>
            <Text style={s.eduDetail}>{loc(e.detail)}</Text>
          </View>
        ))}

        {/* ── Certifications ── */}
        {cvCerts.length > 0 && (
          <>
            <Text style={s.h2}>{certsLbl}</Text>
            {cvCerts.map((c, i) => (
              <View key={i} style={s.certRow}>
                {c.url
                  ? <Link src={c.url} style={s.certName}>{loc(c.name)}</Link>
                  : <Text style={s.certName}>{loc(c.name)}</Text>}
                <Text style={s.certMeta}>{c.issuer} · {c.date}</Text>
              </View>
            ))}
          </>
        )}

        {/* ── Languages ── */}
        <Text style={s.h2}>{langsLbl}</Text>
        <View style={s.langRow}>
          {spokenLangs.map(l => (
            <Text key={l.lang} style={s.langItem}>
              <Text style={s.langBold}>{l.lang}: </Text>{l.level}
            </Text>
          ))}
        </View>

      </Page>
    </Document>
  )
}

// ── ATS / AI variant ──────────────────────────────────────────────────────────
// Single column, standard section headings, plain black text, normalized
// YYYY-MM dates, full URLs as text, ASCII bullets. No colors, chips, columns
// or icons — everything a parser (ATS or an LLM screening agent) reads clean.
const a = StyleSheet.create({
  page:    { fontFamily: 'Helvetica', fontSize: 10, color: '#000000', paddingTop: 42, paddingBottom: 42, paddingHorizontal: 48, lineHeight: 1.45 },
  name:    { fontSize: 17, fontWeight: 700 },
  role:    { fontSize: 11, fontWeight: 700, marginTop: 2 },
  contact: { fontSize: 9, marginTop: 5 },
  h2:      { fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginTop: 14, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 2 },
  p:       { fontSize: 9.5, marginBottom: 2 },
  bold:    { fontWeight: 700 },
  item:    { marginBottom: 7 },
  bullet:  { fontSize: 9.5, marginTop: 1.5, paddingLeft: 10 },
})


const ATS_ROW_ORDER = [
  { key: 'languages',     cats: ['languages'],          label: { en: 'Programming Languages', es: 'Lenguajes' } },
  { key: 'frameworks',    cats: ['frameworks'],         label: { en: 'Frameworks & Libraries', es: 'Frameworks' } },
  { key: 'tools',         cats: ['tools'],              label: { en: 'Tools & DevOps',         es: 'Herramientas & DevOps' } },
  { key: 'clouddb',       cats: ['databases', 'cloud'], label: { en: 'Cloud & Databases',      es: 'Cloud & Bases de datos' } },
  { key: 'architecture',  cats: ['architecture'],       label: { en: 'Architecture',            es: 'Arquitectura' } },
  { key: 'methodologies', cats: ['methodologies'],      label: { en: 'Methodologies',           es: 'Metodologías' } },
  { key: 'ai',            cats: ['ai', 'ides', 'os'],   label: { en: 'AI & Tools',              es: 'IA y Herramientas' } },
] as const

export function AtsCVDocument({ lang, role, personal, skills, jobs, projects, education }: CVDocProps) {
  const profile = ROLES[role]
  const isEs = lang === 'es'
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)

  const cvSkills = profile.prioritySkillIds
    .map(id => skills.find(s => s.id === id))
    .filter(Boolean) as typeof skills
  const skillGroups: Record<string, string[]> = {}
  cvSkills.forEach(s => {
    if (!skillGroups[s.category]) skillGroups[s.category] = []
    skillGroups[s.category].push(s.name)
  })
  const skillRows = ATS_ROW_ORDER
    .map(row => ({ ...row, names: row.cats.flatMap(c => skillGroups[c] ?? []) }))
    .filter(row => row.names.length > 0)

  const allProjects = [...(projects.work ?? []), ...(projects.featured ?? [])]
  const cvProjects = profile.projectIds
    .map(id => allProjects.find(p => p.id === id))
    .filter(Boolean) as typeof allProjects
  const cvCerts = (education.certs ?? []).slice(0, profile.maxCerts)
  const spokenLangs = SPOKEN_LANGS[isEs ? 'es' : 'en']
  const keywords = isEs ? profile.keywordsEs : profile.keywordsEn
  const summary = isEs ? profile.summaryEs : profile.summaryEn
  const roleTitle = isEs ? profile.labelEs : profile.labelEn

  const L = {
    summary: isEs ? 'Resumen Profesional' : 'Professional Summary',
    skills:  isEs ? 'Habilidades Técnicas' : 'Technical Skills',
    exp:     isEs ? 'Experiencia Profesional' : 'Professional Experience',
    projs:   isEs ? 'Proyectos' : 'Projects',
    edu:     isEs ? 'Formación' : 'Education',
    certs:   isEs ? 'Certificaciones' : 'Certifications',
    langs:   isEs ? 'Idiomas' : 'Languages',
    keywordsLbl: isEs ? 'Palabras clave' : 'Keywords',
    tech:    isEs ? 'Tecnologías' : 'Technologies',
  }

  return (
    <Document title="CV - Sebastian Ramiro Entrerrios Garcia (ATS)" author="Sebastián Ramiro Entrerrios García" subject={roleTitle} creator="Portfolio CV Generator" keywords={keywords.join(', ')}>
      <Page size="A4" style={a.page}>
        <Text style={a.name}>Sebastián Ramiro Entrerrios García</Text>
        <Text style={a.role}>{roleTitle}</Text>
        <Text style={a.contact}>{personal.email} | {loc(personal.location)}</Text>
        {personal.social?.github   && <Text style={a.contact}>GitHub: {personal.social.github}</Text>}
        {personal.social?.linkedin && <Text style={a.contact}>LinkedIn: {personal.social.linkedin}</Text>}

        <Text style={a.h2}>{L.summary}</Text>
        <Text style={a.p}>{summary}</Text>
        <Text style={a.p}><Text style={a.bold}>{L.keywordsLbl}:</Text> {keywords.join(', ')}</Text>

        <Text style={a.h2}>{L.skills}</Text>
        {skillRows.map(row => (
          <Text key={row.key} style={a.p}>
            <Text style={a.bold}>{row.label[lang]}: </Text>{row.names.join(', ')}
          </Text>
        ))}

        <Text style={a.h2}>{L.exp}</Text>
        {jobs.map(j => (
          <View key={j.id} style={a.item}>
            <Text style={a.p}><Text style={a.bold}>{loc(j.role)}</Text> | {j.company} | {atsDates(j, lang, loc)}</Text>
            <Text style={a.p}>{loc(j.desc)}</Text>
            {(j.achievements ?? []).map((ach, i) => (
              <Text key={i} style={a.bullet}>- {loc(ach)}</Text>
            ))}
            {(j.projects ?? []).length > 0 && (
              <Text style={a.p}>{isEs ? 'Productos' : 'Products'}: {(j.projects ?? []).map(p => loc(p)).join(', ')}</Text>
            )}
          </View>
        ))}

        <Text style={a.h2}>{L.projs}</Text>
        {cvProjects.slice(0, 5).map(p => (
          <View key={p.id} style={a.item}>
            <Text style={a.p}><Text style={a.bold}>{p.name}</Text> ({p.context})</Text>
            <Text style={a.p}>{loc(p.desc)}</Text>
            {(p.tags ?? []).length > 0 && <Text style={a.p}>{L.tech}: {(p.tags ?? []).slice(0, 8).join(', ')}</Text>}
            {p.github && <Text style={a.p}>{p.github}</Text>}
            {p.demo && <Text style={a.p}>{p.demo}</Text>}
          </View>
        ))}

        <Text style={a.h2}>{L.edu}</Text>
        {(education.items ?? []).map((e, i) => (
          <View key={i} style={a.item}>
            <Text style={a.p}><Text style={a.bold}>{loc(e.degree)}</Text> | {e.school} | {loc(e.period)}</Text>
            <Text style={a.p}>{loc(e.detail)}</Text>
          </View>
        ))}

        {cvCerts.length > 0 && (
          <>
            <Text style={a.h2}>{L.certs}</Text>
            {cvCerts.map((c, i) => (
              <Text key={i} style={a.p}>- {loc(c.name)} | {c.issuer} | {c.date}{c.url ? ` | ${c.url}` : ''}</Text>
            ))}
          </>
        )}

        <Text style={a.h2}>{L.langs}</Text>
        {spokenLangs.map(l => (
          <Text key={l.lang} style={a.p}>- {l.lang}: {l.level}</Text>
        ))}
      </Page>
    </Document>
  )
}
