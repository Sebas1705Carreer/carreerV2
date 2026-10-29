import {
  Document, Page, Text, View, Link, Image, StyleSheet,
} from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { localize } from '../../lib/localize'
import type { PortfolioRawData } from '../../context/PortfolioDataContext'
import { CV_FULL_NAME, atsDates, type RoleId } from './profiles'
import { buildCvContent } from './cvContent'

/*
 * Pure @react-pdf CV documents (HR + ATS variants).
 * No hooks, no DOM: shared by the in-browser generator (CVGenerator.tsx) and
 * by scripts/build-cv.mjs, which renders the static /cv/cv-{en,es}.pdf in CI.
 * What gets printed (role, tagline, summary, skills, projects…) is decided in
 * cvContent.ts; this file only lays it out.
 */


// ── PDF styles ────────────────────────────────────────────────────────────────
// Sin Font.register: @react-pdf no soporta woff2 (el registro anterior con
// fonts.gstatic caía en silencio) — Helvetica es una de las 14 fuentes
// estándar de PDF y no necesita registro ni red. Solo cubre WinAnsi: nada de
// flechas u otros símbolos fuera de Latin-1 (se pintaban como «—»).

// Family ink palette — same brand as the site, the org and the Folio editor
const PURPLE = '#4A5AF0'
const DARK   = '#1e293b'
const MID    = '#475569'
const LIGHT  = '#94a3b8'
const BORDER = '#E0E4FD'

const s = StyleSheet.create({
  page:       { fontFamily: 'Helvetica', fontSize: 9, color: DARK, paddingTop: 28, paddingBottom: 30, paddingHorizontal: 32, lineHeight: 1.4 },
  // header
  header:     { flexDirection: 'row', gap: 14, marginBottom: 4, alignItems: 'flex-start' },
  headerText: { flex: 1 },
  photo:      { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: PURPLE, objectFit: 'cover' },
  name:       { fontSize: 18, fontFamily: 'Helvetica-Bold', color: DARK, lineHeight: 1.2 },
  title:      { fontSize: 10.5, fontFamily: 'Helvetica-Bold', color: PURPLE, lineHeight: 1.2, marginTop: 3 },
  tagline:    { fontSize: 8.5, fontFamily: 'Helvetica-Oblique', color: MID, lineHeight: 1.2, marginTop: 3 },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 12, rowGap: 1, marginTop: 6, borderTopWidth: 1.5, borderTopColor: PURPLE, paddingTop: 4 },
  contact:    { fontSize: 7.5, color: MID, lineHeight: 1.3 },
  contactLink:{ fontSize: 7.5, color: PURPLE, lineHeight: 1.3, textDecoration: 'none' },
  kwRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 3, marginTop: 6 },
  kw:         { fontSize: 7, fontFamily: 'Helvetica-Bold', color: PURPLE, borderWidth: 0.75, borderColor: '#C7CDFB', backgroundColor: '#EEF0FE', borderRadius: 2, paddingHorizontal: 4, paddingTop: 2, paddingBottom: 1.5, lineHeight: 1 },
  // section heading
  h2:         { fontSize: 7, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', letterSpacing: 1.2, color: PURPLE, borderBottomWidth: 1, borderBottomColor: BORDER, paddingBottom: 2, marginTop: 11, marginBottom: 5 },
  // summary
  summary:    { fontSize: 8.5, color: '#334155', lineHeight: 1.5 },
  portfolio:  { fontSize: 8, color: MID, marginTop: 3 },
  // job
  job:        { marginBottom: 7 },
  jobRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  jobTitle:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  jobMeta:    { fontSize: 7.5, color: LIGHT },
  jobCompany: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: PURPLE, marginTop: 1 },
  jobDesc:    { fontSize: 8, color: MID, marginTop: 1 },
  bulletRow:  { flexDirection: 'row', marginTop: 1.5, paddingLeft: 4 },
  bulletDot:  { fontSize: 8, color: PURPLE, width: 8 },
  bulletText: { flex: 1, fontSize: 8, color: '#334155' },
  jobProjs:   { fontSize: 7.5, color: LIGHT, marginTop: 2 },
  // skills
  // one Text per row (label + list inline) so text extraction keeps label → skills order
  skillRow:   { fontSize: 8.5, color: DARK, marginBottom: 2 },
  skillCat:   { fontFamily: 'Helvetica-Bold', color: MID },
  // projects
  proj:       { marginBottom: 5.5 },
  projHead:   { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', columnGap: 8 },
  projName:   { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  projLink:   { fontSize: 7.5, color: PURPLE, textDecoration: 'none', paddingBottom: 0.6 },
  projCtx:    { fontSize: 7.5, color: LIGHT, paddingBottom: 0.6 },
  projDesc:   { fontSize: 8, color: MID, marginTop: 1 },
  // edu
  edu:        { marginBottom: 6 },
  eduRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8 },
  eduDeg:     { fontSize: 9, fontFamily: 'Helvetica-Bold', color: DARK },
  eduPeriod:  { fontSize: 7.5, color: LIGHT },
  eduSchool:  { fontSize: 8, color: MID, fontFamily: 'Helvetica-Bold', marginTop: 1 },
  eduDetail:  { fontSize: 7.5, color: LIGHT, marginTop: 1 },
  // certs
  certRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, marginBottom: 3 },
  certName:   { fontSize: 8.5, color: PURPLE, fontFamily: 'Helvetica-Bold', textDecoration: 'none' },
  certMeta:   { fontSize: 7.5, color: LIGHT },
  // langs
  langRow:    { flexDirection: 'row', gap: 20, flexWrap: 'wrap' },
  langItem:   { fontSize: 8.5, color: DARK },
  langBold:   { fontFamily: 'Helvetica-Bold' },
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

/**
 * Section heading kept on the same page as its first item (minPresenceAhead alone
 * left "KEY PROJECTS" orphaned at the bottom of page 1, its rule on page 2).
 */
function Section({ title, items }: { title: string; items: ReactNode[] }) {
  const [first, ...rest] = items
  return (
    <>
      <View wrap={false}>
        <Text style={s.h2}>{title}</Text>
        {first}
      </View>
      {rest}
    </>
  )
}

export function CVDocument({ lang, role, personal, skills, jobs, projects, education, avatar }: CVDocProps) {
  const isEs = lang === 'es'
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)
  const cv = buildCvContent({ lang, role, personal, skills, projects, education })

  const L = {
    profile: isEs ? 'Perfil Profesional'      : 'Professional Profile',
    exp:     isEs ? 'Experiencia Profesional' : 'Professional Experience',
    skills:  isEs ? 'Habilidades Técnicas'    : 'Technical Skills',
    projs:   isEs ? 'Proyectos Destacados'    : 'Key Projects',
    edu:     isEs ? 'Formación Académica'     : 'Education',
    certs:   isEs ? 'Certificaciones'         : 'Certifications',
    langs:   isEs ? 'Idiomas'                 : 'Languages',
    portfolio: isEs ? 'Portfolio y casos de estudio: ' : 'Portfolio and case studies: ',
    products:  isEs ? 'Productos' : 'Products',
  }

  return (
    <Document title={`CV – ${CV_FULL_NAME}`} author={CV_FULL_NAME} subject={cv.roleTitle} creator="Portfolio CV Generator" keywords={cv.keywords.join(', ')}>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          {avatar && <Image style={s.photo} src={avatar} />}
          <View style={s.headerText}>
            <Text style={s.name}>{CV_FULL_NAME}</Text>
            <Text style={s.title}>{cv.roleTitle}</Text>
            {cv.tagline && <Text style={s.tagline}>{cv.tagline}</Text>}
            <View style={s.contactRow}>
              <Link src={`mailto:${cv.contact.email}`} style={s.contactLink}>{cv.contact.email}</Link>
              {cv.contact.links.map(l => (
                <Link key={l.url} src={l.url} style={s.contactLink}>{l.label}</Link>
              ))}
              <Text style={s.contact}>{cv.contact.location}</Text>
            </View>
          </View>
        </View>
        <View style={s.kwRow}>
          {cv.keywords.map(k => <Text key={k} style={s.kw}>{k}</Text>)}
        </View>

        {/* ── Profile ── */}
        <Section title={L.profile} items={[
          <View key="summary">
            <Text style={s.summary}>{cv.summary}</Text>
            <Text style={s.portfolio}>
              {L.portfolio}<Link src={cv.portfolio.url} style={s.contactLink}>{cv.portfolio.label}</Link>
            </Text>
          </View>,
        ]} />

        {/* ── Experience ── */}
        <Section title={L.exp} items={jobs.map(j => (
          <View key={j.id} style={s.job}>
            <View style={s.jobRow}>
              <Text style={s.jobTitle}>{loc(j.role)}</Text>
              <Text style={s.jobMeta}>{loc(j.period)} · {loc(j.type)}</Text>
            </View>
            <Text style={s.jobCompany}>{j.company}</Text>
            <Text style={s.jobDesc}>{loc(j.desc)}</Text>
            {(j.achievements ?? []).map((a, i) => (
              <View key={i} style={s.bulletRow} wrap={false}>
                <Text style={s.bulletDot}>•</Text>
                <Text style={s.bulletText}>{loc(a)}</Text>
              </View>
            ))}
            {(j.projects ?? []).length > 0 && (
              <Text style={s.jobProjs}>
                {L.products}: {(j.projects ?? []).map(p => loc(p)).join(', ')}
              </Text>
            )}
          </View>
        ))} />

        {/* ── Skills (one block: never split across pages) ── */}
        <Section title={L.skills} items={[
          <View key="skills">
            {cv.skillRows.map(row => (
              <Text key={row.key} style={s.skillRow}>
                <Text style={s.skillCat}>{row.label}: </Text>{row.names.join(', ')}
              </Text>
            ))}
          </View>,
        ]} />

        {/* ── Projects ── */}
        <Section title={L.projs} items={cv.projects.map(p => (
          <View key={p.id} style={s.proj} wrap={false}>
            {/* name · context · links on one line, in reading order (no right-aligned column) */}
            <View style={s.projHead}>
              <Text style={s.projName}>{p.name}</Text>
              <Text style={s.projCtx}>{p.context}</Text>
              {p.links.map(l => <Link key={l.url} src={l.url} style={s.projLink}>{l.label}</Link>)}
            </View>
            <Text style={s.projDesc}>{p.desc}</Text>
          </View>
        ))} />

        {/* ── Education ── */}
        <Section title={L.edu} items={(education.items ?? []).map((e, i) => (
          <View key={i} style={s.edu} wrap={false}>
            <View style={s.eduRow}>
              <Text style={s.eduDeg}>{loc(e.degree)}</Text>
              <Text style={s.eduPeriod}>{loc(e.period)}</Text>
            </View>
            <Text style={s.eduSchool}>{e.school}</Text>
            <Text style={s.eduDetail}>{loc(e.detail)}</Text>
          </View>
        ))} />

        {/* ── Certifications ── */}
        {cv.certs.length > 0 && (
          <Section title={L.certs} items={cv.certs.map((c, i) => (
            <View key={i} style={s.certRow} wrap={false}>
              {c.url
                ? <Link src={c.url} style={s.certName}>{loc(c.name)}</Link>
                : <Text style={s.certName}>{loc(c.name)}</Text>}
              <Text style={s.certMeta}>{c.issuer} · {c.date}</Text>
            </View>
          ))} />
        )}

        {/* ── Languages ── */}
        <Section title={L.langs} items={[
          <View key="langs" style={s.langRow}>
            {cv.spokenLangs.map(l => (
              <Text key={l.lang} style={s.langItem}>
                <Text style={s.langBold}>{l.lang}: </Text>{l.level}
              </Text>
            ))}
          </View>,
        ]} />

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
  name:    { fontSize: 17, fontFamily: 'Helvetica-Bold', lineHeight: 1.2 },
  role:    { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 2 },
  contact: { fontSize: 9, marginTop: 3 },
  h2:      { fontSize: 11, fontFamily: 'Helvetica-Bold', textTransform: 'uppercase', marginTop: 14, marginBottom: 5, borderBottomWidth: 1, borderBottomColor: '#000000', paddingBottom: 2 },
  p:       { fontSize: 9.5, marginBottom: 2 },
  bold:    { fontFamily: 'Helvetica-Bold' },
  item:    { marginBottom: 7 },
  bullet:  { fontSize: 9.5, marginTop: 1.5, paddingLeft: 10 },
})

export function AtsCVDocument({ lang, role, personal, skills, jobs, projects, education }: CVDocProps) {
  const isEs = lang === 'es'
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)
  const cv = buildCvContent({ lang, role, personal, skills, projects, education })

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
    <Document title="CV - Sebastian Ramiro Entrerrios Garcia (ATS)" author={CV_FULL_NAME} subject={cv.roleTitle} creator="Portfolio CV Generator" keywords={cv.keywords.join(', ')}>
      <Page size="A4" style={a.page}>
        <Text style={a.name}>{CV_FULL_NAME}</Text>
        <Text style={a.role}>{cv.roleTitle}</Text>
        {cv.tagline && <Text style={a.contact}>{cv.tagline}</Text>}
        <Text style={a.contact}>{cv.contact.email} | {cv.contact.location}</Text>
        {personal.social?.github   && <Text style={a.contact}>GitHub: {personal.social.github}</Text>}
        {personal.social?.linkedin && <Text style={a.contact}>LinkedIn: {personal.social.linkedin}</Text>}
        <Text style={a.contact}>Portfolio: {cv.portfolio.url}</Text>

        <Text style={a.h2}>{L.summary}</Text>
        <Text style={a.p}>{cv.summary}</Text>
        <Text style={a.p}><Text style={a.bold}>{L.keywordsLbl}:</Text> {cv.keywords.join(', ')}</Text>

        <Text style={a.h2}>{L.skills}</Text>
        {cv.skillRows.map(row => (
          <Text key={row.key} style={a.p}>
            <Text style={a.bold}>{row.label}: </Text>{row.names.join(', ')}
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
        {cv.projects.map(p => (
          <View key={p.id} style={a.item} wrap={false}>
            <Text style={a.p}><Text style={a.bold}>{p.name}</Text> ({p.context})</Text>
            <Text style={a.p}>{p.desc}</Text>
            {p.tags.length > 0 && <Text style={a.p}>{L.tech}: {p.tags.slice(0, 8).join(', ')}</Text>}
            {p.links.map(l => <Text key={l.url} style={a.p}>{l.url}</Text>)}
          </View>
        ))}

        <Text style={a.h2}>{L.edu}</Text>
        {(education.items ?? []).map((e, i) => (
          <View key={i} style={a.item}>
            <Text style={a.p}><Text style={a.bold}>{loc(e.degree)}</Text> | {e.school} | {loc(e.period)}</Text>
            <Text style={a.p}>{loc(e.detail)}</Text>
          </View>
        ))}

        {cv.certs.length > 0 && (
          <>
            <Text style={a.h2}>{L.certs}</Text>
            {cv.certs.map((c, i) => (
              <Text key={i} style={a.p}>- {loc(c.name)} | {c.issuer} | {c.date}{c.url ? ` | ${c.url}` : ''}</Text>
            ))}
          </>
        )}

        <Text style={a.h2}>{L.langs}</Text>
        {cv.spokenLangs.map(l => (
          <Text key={l.lang} style={a.p}>- {l.lang}: {l.level}</Text>
        ))}
      </Page>
    </Document>
  )
}
