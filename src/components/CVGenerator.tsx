import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { localize } from '../lib/localize'
import { useLang } from '../hooks/useLang'
import {
  Document, Page, Text, View, Link, Image, StyleSheet,
  pdf, type DocumentProps,
} from '@react-pdf/renderer'

// ── Role profiles ─────────────────────────────────────────────────────────────
type RoleId = 'fullstack' | 'mobile' | 'backend' | 'frontend'

interface RoleProfile {
  labelEn: string
  labelEs: string
  tabEn: string
  tabEs: string
  keywordsEn: string[]
  keywordsEs: string[]
  summaryEn: string
  summaryEs: string
  prioritySkillIds: string[]
  projectIds: string[]
  maxCerts: number
}

const ROLES: Record<RoleId, RoleProfile> = {
  fullstack: {
    labelEn: 'Full Stack & Mobile Developer',
    labelEs: 'Desarrollador Full Stack & Móvil',
    tabEn: 'Full Stack',
    tabEs: 'Full Stack',
    keywordsEn: ['Kotlin', 'TypeScript', 'C#', 'Go', 'React', '.NET', 'Jetpack Compose', 'Cloudflare Workers', 'Docker', 'Kubernetes', 'CI/CD'],
    keywordsEs: ['Kotlin', 'TypeScript', 'C#', 'Go', 'React', '.NET', 'Jetpack Compose', 'Cloudflare Workers', 'Docker', 'Kubernetes', 'CI/CD'],
    summaryEn:
      'Full Stack & Mobile Developer with 2+ years of production experience at Solusoft (Madrid, Hybrid). Promoted from Junior to Senior in recognition of technical ownership and leadership. Delivered two native Android apps to Google Play Store — EPDM Music Portal (built from scratch) and Iberext (migrated from legacy Windows). Proficient across the full stack: Kotlin/Jetpack Compose, .NET/C#, React/TypeScript, SQL Server and Azure. Master\'s TFM: AxiomNode — a 16-repository microservices platform with AI engine (Python/LLM), mobile client (Kotlin/Compose) and DevSecOps pipeline (Docker, Kubernetes, 90% test coverage, CodeQL SAST, Trivy SCA). Author of Templetry: a project scaffolding engine in pure Go with a Wails desktop app and a CI-verified template catalog.',
    summaryEs:
      'Desarrollador Full Stack & Móvil con más de 2 años de experiencia en producción en Solusoft (Madrid, Híbrido). Promocionado de Junior a Senior por liderazgo técnico y ownership demostrado. Publicadas dos apps Android nativas en Google Play Store — EPDM Portal Musical (desde cero) e Iberext (migración desde Windows legacy). Dominio completo de la pila: Kotlin/Jetpack Compose, .NET/C#, React/TypeScript, SQL Server y Azure. TFM del Máster: AxiomNode — plataforma de 16 repositorios con motor de IA (Python/LLM), cliente móvil (Kotlin/Compose) y pipeline DevSecOps (Docker, Kubernetes, 90% cobertura, CodeQL SAST, Trivy SCA). Autor de Templetry: un motor de scaffolding de proyectos en Go puro con app de escritorio Wails y catálogo de plantillas verificado por CI.',
    prioritySkillIds: ['kotlin','typescript','csharp','go','javascript','java','jetpack-compose','compose-multiplatform','react','dotnet','spring-boot','ktor','tailwindcss','wails','vite','docker','docker-compose','kubernetes','git','github-actions','gradle','npm','sqlserver','sql','postgresql','mongodb','sqlite','firebase','azure','cloudflare','clean-architecture','mvvm','mvc','hexagonal','event-driven','multimodular-mixed','mvp','test-driven','spec-driven','scrum','agile','github-copilot','chatgpt','claude','llm-integration','rag','mcp'],
    projectIds: ['axiomnode','templetry','career-ecosystem','epdm','vpsorchestrator'],
    maxCerts: 5,
  },
  mobile: {
    labelEn: 'Mobile Developer (Android & iOS)',
    labelEs: 'Desarrollador Móvil (Android & iOS)',
    tabEn: 'Mobile',
    tabEs: 'Móvil',
    keywordsEn: ['Kotlin', 'Jetpack Compose', 'Swift', 'SwiftUI', 'Kotlin Multiplatform', 'MVVM', 'Clean Architecture', 'Firebase', 'Google Play Store', 'Coroutines'],
    keywordsEs: ['Kotlin', 'Jetpack Compose', 'Swift', 'SwiftUI', 'Kotlin Multiplatform', 'MVVM', 'Arquitectura Limpia', 'Firebase', 'Google Play Store', 'Coroutines'],
    summaryEn:
      'Mobile Developer with 2+ years of production experience at Solusoft (Madrid, Hybrid). Full ownership of two Google Play Store apps: EPDM Music Portal (built from scratch in Kotlin/Jetpack Compose) and Iberext fire-prevention app (migrated from legacy Windows tablet). Currently shipping native Android (Kotlin/Compose) and native iOS (Swift/SwiftUI) apps for Transportes Chinchón, backed by a .NET API. Expert in multimodular clean architecture (MVVM/MVI), Kotlin Multiplatform, Firebase (Auth, Firestore, Storage) and the full mobile development lifecycle. Promoted to Senior in January 2026.',
    summaryEs:
      'Desarrollador Móvil con más de 2 años de experiencia en producción en Solusoft (Madrid, Híbrido). Ownership completo de dos apps en Google Play Store: EPDM Portal Musical (construida desde cero en Kotlin/Jetpack Compose) e Iberext (migración desde tablet Windows legacy). Actualmente desarrollo apps nativas Android (Kotlin/Compose) e iOS (Swift/SwiftUI) para Transportes Chinchón, sobre una API .NET. Experto en arquitectura limpia multimodular (MVVM/MVI), Kotlin Multiplatform, Firebase (Auth, Firestore, Storage) y el ciclo completo de desarrollo móvil. Promocionado a Senior en enero 2026.',
    prioritySkillIds: ['kotlin','swift','java','jetpack-compose','compose-multiplatform','kmp','swiftui','hilt','ktor','firebase','admob','mvvm','mvi','clean-architecture','multimodular-mixed','multimodular-feature','mvp','test-driven','android-studio','xcode','gradle','git','sqlite','sql','figma','scrum','agile','github-copilot','chatgpt'],
    projectIds: ['epdm','iberext','chinchon-android','chinchon-ios','impostor'],
    maxCerts: 4,
  },
  backend: {
    labelEn: 'Backend Developer',
    labelEs: 'Desarrollador Backend',
    tabEn: 'Backend',
    tabEs: 'Backend',
    keywordsEn: ['C#', '.NET', 'REST API', 'SQL Server', 'Docker', 'Azure', 'Spring Boot', 'Node.js', 'Microservices', 'RBAC'],
    keywordsEs: ['C#', '.NET', 'API REST', 'SQL Server', 'Docker', 'Azure', 'Spring Boot', 'Node.js', 'Microservicios', 'RBAC'],
    summaryEn:
      'Backend Developer with 2+ years building and maintaining production enterprise APIs at Solusoft (Madrid, Hybrid). Core technologies: C# / .NET (MVC, Web API), SQL Server and Azure. Experience with Spring Boot, Node.js/TypeScript and Python (FastAPI). Master\'s TFM: AxiomNode — microservices platform (TypeScript/Node.js) with API Gateway, BFF pattern, RBAC, AES encryption, audit logging, distributed tracing, 555 automated tests across 23 suites, CodeQL SAST and Trivy SCA. Docker and Kubernetes deployments managed via centralised CI/CD (GitHub Actions), with Prometheus + Grafana observability. At Solusoft: internal .NET REST APIs (ApiMovil, Wemob) powering client mobile apps, plus a serverless Cloudflare Workers API side project.',
    summaryEs:
      'Desarrollador Backend con más de 2 años construyendo y manteniendo APIs empresariales en producción en Solusoft (Madrid, Híbrido). Tecnologías principales: C# / .NET (MVC, Web API), SQL Server y Azure. Experiencia con Spring Boot, Node.js/TypeScript y Python (FastAPI). TFM del Máster: AxiomNode — plataforma de microservicios (TypeScript/Node.js) con API Gateway, patrón BFF, RBAC, cifrado AES, auditoría, trazabilidad distribuida, 555 tests en 23 suites, CodeQL SAST y Trivy SCA. Despliegues Docker y Kubernetes gestionados mediante CI/CD centralizado (GitHub Actions), con observabilidad Prometheus + Grafana. En Solusoft: APIs REST .NET internas (ApiMovil, Wemob) para apps móviles de cliente, y una API serverless en Cloudflare Workers como proyecto propio.',
    prioritySkillIds: ['csharp','java','kotlin','typescript','python','go','dotnet','spring-boot','spring','nodejs','fastapi','express','ktor','sqlserver','sql','mysql','postgresql','mongodb','sqlite','docker','docker-compose','kubernetes','prometheus','grafana','codeql','trivy','rabbitmq','nginx','azure','firebase','cloudflare','mvc','clean-architecture','hexagonal','event-driven','test-driven','spec-driven','git','github-actions','postman','scrum','agile'],
    projectIds: ['axiomnode','vpsorchestrator','apimovil','wemob','agedi'],
    maxCerts: 4,
  },
  frontend: {
    labelEn: 'Frontend Developer',
    labelEs: 'Desarrollador Frontend',
    tabEn: 'Frontend',
    tabEs: 'Frontend',
    keywordsEn: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Astro', 'Next.js', 'Accessibility', 'Playwright', 'Vitest', 'CI/CD'],
    keywordsEs: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'Astro', 'Next.js', 'Accesibilidad', 'Playwright', 'Vitest', 'CI/CD'],
    summaryEn:
      'Frontend Developer with experience building enterprise web interfaces (C# / .NET + JavaScript) and modern SPAs. Portfolio site built with Astro/TypeScript and Clean Architecture, achieving 100% Vitest unit test coverage, 91.66% branch coverage, Playwright E2E tests and automated CI/CD deployment. Master\'s TFM: React/TypeScript backoffice for AxiomNode platform with role-based access control (SuperAdmin, Admin, Inspector, Viewer, Gamer), Playwright E2E smoke tests and API integration via BFF pattern.',
    summaryEs:
      'Desarrollador Frontend con experiencia construyendo interfaces web empresariales (C# / .NET + JavaScript) y SPAs modernas. Portfolio construido con Astro/TypeScript y Arquitectura Limpia, con 100% de cobertura unitaria Vitest, 91.66% de ramas, tests e2e Playwright y despliegue CI/CD automatizado. TFM del Máster: backoffice React/TypeScript para la plataforma AxiomNode con control de acceso basado en roles (SuperAdmin, Admin, Inspector, Viewer, Gamer), tests E2E Playwright y integración de API mediante patrón BFF.',
    prioritySkillIds: ['typescript','javascript','html','css','react','tailwindcss','astro','vite','nextjs','vue','reactnative','wails','figma','playwright','vitest','git','github-actions','npm','docker','github','gitlab','cloudflare','test-driven','scrum','github-copilot'],
    projectIds: ['career-ecosystem','axiomnode','templetry','portfolio','sisley'],
    maxCerts: 3,
  },
}

const ROLE_IDS: RoleId[] = ['fullstack', 'mobile', 'backend', 'frontend']

const SPOKEN_LANGS = {
  en: [
    { lang: 'Spanish', level: 'Native (C2)' },
    { lang: 'English',  level: 'Professional working proficiency (B2)' },
  ],
  es: [
    { lang: 'Español', level: 'Nativo (C2)' },
    { lang: 'Inglés',  level: 'Competencia profesional (B2)' },
  ],
}

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
interface CVDocProps {
  lang: 'en' | 'es'
  role: RoleId
  personal: ReturnType<typeof usePortfolioData>['personal']
  skills: ReturnType<typeof usePortfolioData>['skills']
  jobs: ReturnType<typeof usePortfolioData>['jobs']
  projects: ReturnType<typeof usePortfolioData>['projects']
  education: ReturnType<typeof usePortfolioData>['education']
  /** Data-URL of the profile photo (HR variant only; ATS stays photo-free on purpose) */
  avatar?: string
}

function CVDocument({ lang, role, personal, skills, jobs, projects, education, avatar }: CVDocProps) {
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

/** YYYY-MM range for ATS parsers, falling back to the localized period text */
function atsDates(j: { startDate?: string; endDate?: string | null; period: unknown }, lang: 'en' | 'es', loc: (v: unknown) => string): string {
  if (!j.startDate) return loc(j.period)
  const end = j.endDate ?? (lang === 'es' ? 'Actualidad' : 'Present')
  return `${j.startDate} - ${end}`
}

const ATS_ROW_ORDER = [
  { key: 'languages',     cats: ['languages'],          label: { en: 'Programming Languages', es: 'Lenguajes' } },
  { key: 'frameworks',    cats: ['frameworks'],         label: { en: 'Frameworks & Libraries', es: 'Frameworks' } },
  { key: 'tools',         cats: ['tools'],              label: { en: 'Tools & DevOps',         es: 'Herramientas & DevOps' } },
  { key: 'clouddb',       cats: ['databases', 'cloud'], label: { en: 'Cloud & Databases',      es: 'Cloud & Bases de datos' } },
  { key: 'architecture',  cats: ['architecture'],       label: { en: 'Architecture',            es: 'Arquitectura' } },
  { key: 'methodologies', cats: ['methodologies'],      label: { en: 'Methodologies',           es: 'Metodologías' } },
  { key: 'ai',            cats: ['ai', 'ides', 'os'],   label: { en: 'AI & Tools',              es: 'IA y Herramientas' } },
] as const

function AtsCVDocument({ lang, role, personal, skills, jobs, projects, education }: CVDocProps) {
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

// ── Download helper ───────────────────────────────────────────────────────────
async function downloadPDF(doc: React.ReactElement<DocumentProps>, filename: string) {
  const blob = await pdf(doc).toBlob()
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Main component ────────────────────────────────────────────────────────────
interface Props { onClose: () => void }

export default function CVGenerator({ onClose }: Props) {
  const lang = useLang()
  const { personal, skills, jobs, projects, education, loading } = usePortfolioData()
  const [role, setRole]       = useState<RoleId>('fullstack')
  const [variant, setVariant] = useState<'hr' | 'ats'>('hr')
  const [generating, setGenerating] = useState(false)

  const profile = ROLES[role]
  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)
  const isEs = lang === 'es'

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

  const cvCerts       = (education.certs ?? []).slice(0, profile.maxCerts)
  const spokenLangs   = SPOKEN_LANGS[isEs ? 'es' : 'en']
  const keywords      = isEs ? profile.keywordsEs : profile.keywordsEn
  const summary       = isEs ? profile.summaryEs  : profile.summaryEn
  const roleTitle     = isEs ? profile.labelEs    : profile.labelEn

  const handleDownload = async () => {
    setGenerating(true)
    try {
      // HR variant embeds the GitHub avatar as a data-URL; if the fetch fails
      // the PDF still generates, just without photo. ATS stays photo-free.
      let avatar: string | undefined
      if (variant === 'hr' && personal.social?.github) {
        const user = personal.social.github.split('/').pop()
        if (user) {
          try {
            const blob = await fetch(`https://avatars.githubusercontent.com/${user}?size=240`).then(r => {
              if (!r.ok) throw new Error(`avatar HTTP ${r.status}`)
              return r.blob()
            })
            avatar = await new Promise<string>((resolve, reject) => {
              const fr = new FileReader()
              fr.onload = () => resolve(fr.result as string)
              fr.onerror = reject
              fr.readAsDataURL(blob)
            })
          } catch (e) {
            console.warn('[CV] avatar no disponible, se genera sin foto', e)
          }
        }
      }

      const Doc = variant === 'ats' ? AtsCVDocument : CVDocument
      const doc = (
        <Doc
          lang={lang}
          role={role}
          personal={personal}
          skills={skills}
          jobs={jobs}
          projects={projects}
          education={education}
          avatar={avatar}
        />
      )
      const slug = role === 'fullstack' ? 'fullstack-mobile'
        : role === 'mobile'   ? 'mobile'
        : role === 'backend'  ? 'backend'
        : 'frontend'
      const vslug = variant === 'ats' ? '_ATS' : ''
      await downloadPDF(doc, `CV_Sebastian_Entrerrios_${slug}${vslug}_${lang.toUpperCase()}.pdf`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        data-modal
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm"
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                {isEs ? 'Generador de CV' : 'CV Generator'}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {isEs ? 'PDF con texto seleccionable · Optimizado para ATS' : 'Selectable-text PDF · ATS-optimised'}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          {/* Role tabs + variant toggle */}
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-slate-800 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {ROLE_IDS.map(r => (
              <button key={r} onClick={() => setRole(r)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap border ${role === r ? 'bg-violet-100 text-violet-800 border-violet-400 shadow-sm dark:bg-violet-600 dark:text-white dark:border-violet-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                {isEs ? ROLES[r].tabEs : ROLES[r].tabEn}
              </button>
            ))}
            <div className="ml-auto flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-700 p-0.5">
              {(['hr', 'ats'] as const).map(v => (
                <button key={v} onClick={() => setVariant(v)}
                  title={v === 'hr'
                    ? (isEs ? 'Versión visual, pensada para que la lea una persona' : 'Visual version, made for human readers')
                    : (isEs ? 'Columna única y texto plano: óptima para ATS y filtros con IA' : 'Single column, plain text: optimal for ATS and AI screening')}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 cursor-pointer ${variant === v ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}>
                  {v === 'hr' ? (isEs ? 'RRHH' : 'HR') : 'ATS · IA'}
                </button>
              ))}
            </div>
          </div>

          {/* CV Preview */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6" style={{ scrollbarWidth: 'thin' }}>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
                {isEs ? 'Cargando datos…' : 'Loading data…'}
              </div>
            ) : variant === 'ats' ? (
              /* ── ATS/AI preview: exactly the plain structure the parser will read ── */
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm text-slate-900 text-[11px] leading-relaxed">
                <p className="text-base font-bold">Sebastián Ramiro Entrerrios García</p>
                <p className="font-bold">{roleTitle}</p>
                <p className="mt-1 text-slate-700">{personal.email} | {loc(personal.location)}</p>
                {personal.social?.github && <p className="text-slate-700">GitHub: {personal.social.github}</p>}
                {personal.social?.linkedin && <p className="text-slate-700 break-all">LinkedIn: {personal.social.linkedin}</p>}

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Resumen Profesional' : 'Professional Summary'}</p>
                <p className="mt-1">{summary}</p>
                <p className="mt-1"><span className="font-bold">{isEs ? 'Palabras clave' : 'Keywords'}:</span> {keywords.join(', ')}</p>

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Habilidades Técnicas' : 'Technical Skills'}</p>
                {skillRows.map(row => (
                  <p key={row.key} className="mt-0.5"><span className="font-bold">{row.label[lang]}:</span> {row.names.join(', ')}</p>
                ))}

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Experiencia Profesional' : 'Professional Experience'}</p>
                {jobs.map(j => (
                  <div key={j.id} className="mt-1.5">
                    <p><span className="font-bold">{loc(j.role)}</span> | {j.company} | {atsDates(j, lang, loc)}</p>
                    <p>{loc(j.desc)}</p>
                    {(j.achievements ?? []).map((ach, i) => <p key={i} className="pl-3">- {loc(ach)}</p>)}
                  </div>
                ))}

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Proyectos' : 'Projects'}</p>
                {cvProjects.slice(0, 5).map(p => (
                  <div key={p.id} className="mt-1.5">
                    <p><span className="font-bold">{p.name}</span> ({p.context}) - {loc(p.desc)}</p>
                    {(p.tags ?? []).length > 0 && <p className="text-slate-700">{isEs ? 'Tecnologías' : 'Technologies'}: {(p.tags ?? []).slice(0, 8).join(', ')}</p>}
                    {p.github && <p className="text-slate-700 break-all">{p.github}</p>}
                  </div>
                ))}

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Formación' : 'Education'}</p>
                {(education.items ?? []).map((e, i) => (
                  <p key={i} className="mt-0.5"><span className="font-bold">{loc(e.degree)}</span> | {e.school} | {loc(e.period)}</p>
                ))}

                {cvCerts.length > 0 && (
                  <>
                    <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Certificaciones' : 'Certifications'}</p>
                    {cvCerts.map((c, i) => (
                      <p key={i} className="mt-0.5">- {loc(c.name)} | {c.issuer} | {c.date}</p>
                    ))}
                  </>
                )}

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Idiomas' : 'Languages'}</p>
                {spokenLangs.map(l => <p key={l.lang} className="mt-0.5">- {l.lang}: {l.level}</p>)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm font-['Segoe_UI',sans-serif]">

                {/* Name + title */}
                <div className="pb-4 border-b-2 border-violet-600 flex gap-4 items-start">
                  {personal.social?.github && (() => {
                    const user = personal.social.github.split('/').pop()
                    return user ? (
                      <img
                        src={`https://avatars.githubusercontent.com/${user}`}
                        alt="photo"
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-violet-500 flex-shrink-0"
                      />
                    ) : null
                  })()}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Sebastián Ramiro Entrerrios García
                    </h1>
                    <p className="text-sm font-semibold text-violet-700 mt-0.5">{roleTitle}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[10px] text-slate-500">
                      <a href={`mailto:${personal.email}`} className="hover:text-violet-600">{personal.email}</a>
                      {personal.social?.linkedin && (
                        <a href={personal.social.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600">LinkedIn ↗</a>
                      )}
                      {personal.social?.github && (
                        <a href={personal.social.github} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600">github.com/Sebas1705</a>
                      )}
                      <span>📍 {loc(personal.location)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {keywords.map(k => (
                        <span key={k} className="text-[9px] font-semibold px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-200 rounded">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile */}
                <section className="mt-4 mb-4">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-2">
                    {isEs ? 'Perfil Profesional' : 'Professional Profile'}
                  </h2>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{summary}</p>
                </section>

                {/* Experience */}
                <section className="mb-4">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-3">
                    {isEs ? 'Experiencia Profesional' : 'Professional Experience'}
                  </h2>
                  <div className="space-y-4">
                    {jobs.map(j => (
                      <div key={j.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-900">{loc(j.role)}</span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{loc(j.period)} · {loc(j.type)}</span>
                        </div>
                        <a href={j.companyUrl} target="_blank" rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-violet-600 hover:underline">{j.company}</a>
                        <p className="text-[10px] text-slate-500 mt-0.5 italic">{loc(j.desc)}</p>
                        {j.achievements?.length > 0 && (
                          <ul className="mt-1.5 space-y-0.5 list-disc list-inside">
                            {j.achievements.map((a, i) => (
                              <li key={i} className="text-[10px] text-slate-700">{loc(a)}</li>
                            ))}
                          </ul>
                        )}
                        {j.projects?.length > 0 && (
                          <p className="text-[9px] text-slate-400 mt-1">
                            <strong className="text-slate-500">{isEs ? 'Productos' : 'Products'}:</strong>{' '}
                            {j.projects.map(p => loc(p)).join(', ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills */}
                <section className="mb-4">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-2">
                    {isEs ? 'Habilidades Técnicas' : 'Technical Skills'}
                  </h2>
                  <div className="space-y-1">
                    {skillRows.map(row => (
                      <div key={row.key} className="flex gap-2 items-baseline">
                        <span className="text-[9px] font-bold text-slate-500 w-36 flex-shrink-0">
                          {row.label[lang]}:
                        </span>
                        <span className="text-[10px] text-slate-700">{row.names.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Projects */}
                <section className="mb-4">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-3">
                    {isEs ? 'Proyectos Destacados' : 'Key Projects'}
                  </h2>
                  <div className="space-y-3">
                    {cvProjects.slice(0, 5).map(p => (
                      <div key={p.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-900">
                            {p.name}
                            {p.github && <a href={p.github} target="_blank" rel="noopener noreferrer" className="ml-2 text-violet-500 font-normal text-[9px] hover:underline">GitHub ↗</a>}
                            {p.demo   && <a href={p.demo}   target="_blank" rel="noopener noreferrer" className="ml-1 text-violet-500 font-normal text-[9px] hover:underline">Demo ↗</a>}
                          </span>
                          <span className="text-[9px] text-slate-400 capitalize whitespace-nowrap flex-shrink-0">{p.context}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{loc(p.desc)}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">{(p.tags ?? []).slice(0, 7).join(', ')}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Education */}
                <section className="mb-4">
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-3">
                    {isEs ? 'Formación Académica' : 'Education'}
                  </h2>
                  <div className="space-y-2.5">
                    {(education.items ?? []).map((e, i) => (
                      <div key={i}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-900">{loc(e.degree)}</span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{loc(e.period)}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium">{e.school}</p>
                        <p className="text-[9px] text-slate-400">{loc(e.detail)}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Certifications */}
                {cvCerts.length > 0 && (
                  <section className="mb-4">
                    <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-2">
                      {isEs ? 'Certificaciones' : 'Certifications'}
                    </h2>
                    <div className="space-y-1.5">
                      {cvCerts.map((c, i) => (
                        <div key={i} className="flex items-baseline justify-between gap-2">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-violet-600 hover:underline font-medium">{loc(c.name)}</a>
                          ) : (
                            <span className="text-[10px] text-violet-600 font-medium">{loc(c.name)}</span>
                          )}
                          <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{c.issuer} · {c.date}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Languages */}
                <section>
                  <h2 className="text-[9px] font-bold uppercase tracking-[0.12em] text-violet-700 border-b border-violet-100 pb-1 mb-2">
                    {isEs ? 'Idiomas' : 'Languages'}
                  </h2>
                  <div className="flex flex-wrap gap-x-8 gap-y-1">
                    {spokenLangs.map(l => (
                      <div key={l.lang} className="text-[10px] text-slate-700">
                        <strong>{l.lang}:</strong> {l.level}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {isEs
                ? '✓ Texto seleccionable · Compatible con ATS · Descarga directa'
                : '✓ Selectable text · ATS-compatible · Direct download'}
            </p>
            <div className="flex gap-2">
              <button onClick={onClose}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                {isEs ? 'Cerrar' : 'Close'}
              </button>
              <button onClick={handleDownload} disabled={loading || generating}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-2">
                {generating
                  ? <><span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />{isEs ? 'Generando…' : 'Generating…'}</>
                  : <>{isEs ? '⬇ Descargar PDF' : '⬇ Download PDF'}</>
                }
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
