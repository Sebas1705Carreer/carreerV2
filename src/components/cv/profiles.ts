/*
 * CV role profiles and shared helpers (no React): consumed by the PDF
 * documents (CVDocument.tsx), the in-browser generator and scripts/build-cv.mjs.
 */

// ── Role profiles ─────────────────────────────────────────────────────────────
// Facts in the summaries must match the career API (jobs[].achievements, projects[].desc).
// The headline role and the tagline come from the API (personal.role / personal.tagline);
// only the role variants set their own `label`.
/** Full legal name printed on the CV (the API's personal.name is the short form) */
export const CV_FULL_NAME = 'Sebastián Ramiro Entrerrios García'

export type RoleId = 'fullstack' | 'mobile' | 'backend' | 'frontend'

type Bi<T> = { en: T; es: T }

interface RoleProfile {
  /** Headline override; omitted → personal.role from the API */
  label?: Bi<string>
  tab: Bi<string>
  keywords: Bi<string[]>
  summary: Bi<string>
  /** Core skills first, in this order; every other API skill follows by level */
  prioritySkillIds: string[]
  /** Key Projects, in print order (fullstack = the portfolio's featured order + work projects) */
  projectIds: string[]
  maxCerts: number
}

export const ROLES: Record<RoleId, RoleProfile> = {
  fullstack: {
    tab: { en: 'Full Stack', es: 'Full Stack' },
    keywords: {
      en: ['Kotlin', 'Swift', 'Kotlin Multiplatform', 'Jetpack Compose', 'SwiftUI', 'C#', '.NET', 'TypeScript', 'React', 'Cloudflare Workers', 'Clean Architecture'],
      es: ['Kotlin', 'Swift', 'Kotlin Multiplatform', 'Jetpack Compose', 'SwiftUI', 'C#', '.NET', 'TypeScript', 'React', 'Cloudflare Workers', 'Arquitectura limpia'],
    },
    summary: {
      en: 'Senior Full Stack & Mobile Developer at Solusoft (Madrid), promoted from Junior after 15 months and now the technical reference for 2–3 production apps and 2 internal APIs. I build native mobile apps — Android (Kotlin, Jetpack Compose) and iOS (Swift, SwiftUI), plus Kotlin Multiplatform in my own products — on top of .NET REST APIs, and TypeScript APIs on Cloudflare Workers. Shipped EPDM on Google Play (1,000+ installs), Iberext on 100+ field devices and the Transportes Chinchón Android and iOS apps.',
      es: 'Desarrollador Full Stack & Móvil Senior en Solusoft (Madrid), promocionado desde Junior tras 15 meses y hoy referente técnico de 2–3 apps en producción y 2 APIs internas. Construyo apps móviles nativas — Android (Kotlin, Jetpack Compose) e iOS (Swift, SwiftUI), además de Kotlin Multiplatform en mis propios productos — sobre APIs REST .NET, y APIs TypeScript en Cloudflare Workers. He publicado EPDM en Google Play (más de 1.000 instalaciones), Iberext en más de 100 dispositivos de campo y las apps Android e iOS de Transportes Chinchón.',
    },
    prioritySkillIds: ['kotlin', 'swift', 'typescript', 'csharp', 'go', 'java', 'javascript', 'python', 'jetpack-compose', 'android-sdk', 'kmp', 'compose-multiplatform', 'swiftui', 'dotnet', 'react', 'ktor', 'nodejs', 'hilt', 'spring-boot', 'cloudflare', 'firebase', 'sqlserver', 'postgresql', 'azure', 'git', 'github-actions', 'gradle', 'docker', 'clean-architecture', 'multimodular-feature', 'mvvm', 'mvi', 'test-driven', 'agile', 'iainteractive', 'llm-integration', 'mcp'],
    projectIds: ['owlsplit', 'haltera', 'templetry', 'winforge', 'career-ecosystem', 'epdm', 'iberext'],
    maxCerts: 5,
  },
  mobile: {
    label: { en: 'Senior Mobile Developer (Android & iOS)', es: 'Desarrollador Móvil Senior (Android & iOS)' },
    tab: { en: 'Mobile', es: 'Móvil' },
    keywords: {
      en: ['Kotlin', 'Jetpack Compose', 'Swift', 'SwiftUI', 'Kotlin Multiplatform', 'Compose Multiplatform', 'MVVM', 'MVI', 'Clean Architecture', 'Firebase', 'Google Play'],
      es: ['Kotlin', 'Jetpack Compose', 'Swift', 'SwiftUI', 'Kotlin Multiplatform', 'Compose Multiplatform', 'MVVM', 'MVI', 'Arquitectura limpia', 'Firebase', 'Google Play'],
    },
    summary: {
      en: 'Senior Mobile Developer at Solusoft (Madrid): technical reference for the mobile team and lead of the Transportes Chinchón programme, native Android (Kotlin, Jetpack Compose) and iOS (Swift, SwiftUI) apps in feature parity over a shared .NET API. Built and published EPDM on Google Play (1,000+ installs) and took Iberext from a legacy Windows tablet app to native Android on 100+ field devices. Multi-module clean architecture (MVVM/MVI) at work; Kotlin Multiplatform in Owlsplit and Haltera, my own Android and iOS apps.',
      es: 'Desarrollador Móvil Senior en Solusoft (Madrid): referente técnico del equipo móvil y responsable del programa de Transportes Chinchón, apps nativas Android (Kotlin, Jetpack Compose) e iOS (Swift, SwiftUI) con paridad de funcionalidades sobre una API .NET compartida. Construí y publiqué EPDM en Google Play (más de 1.000 instalaciones) y llevé Iberext de una app legacy de tablet Windows a Android nativo en más de 100 dispositivos de campo. Arquitectura limpia multimódulo (MVVM/MVI) en el trabajo; Kotlin Multiplatform en Owlsplit y Haltera, mis propias apps Android e iOS.',
    },
    prioritySkillIds: ['kotlin', 'swift', 'java', 'jetpack-compose', 'android-sdk', 'swiftui', 'kmp', 'compose-multiplatform', 'hilt', 'ktor', 'firebase', 'sqlite', 'sqldelight', 'gradle', 'detekt', 'junit', 'git', 'github-actions', 'mvvm', 'mvi', 'clean-architecture', 'multimodular-feature', 'test-driven', 'agile'],
    projectIds: ['owlsplit', 'haltera', 'epdm', 'iberext', 'chinchon-ios', 'impostor'],
    maxCerts: 5,
  },
  backend: {
    label: { en: 'Backend Developer (.NET & TypeScript)', es: 'Desarrollador Backend (.NET & TypeScript)' },
    tab: { en: 'Backend', es: 'Backend' },
    keywords: {
      en: ['C#', '.NET', 'REST API', 'SQL Server', 'TypeScript', 'Node.js', 'Cloudflare Workers', 'Azure', 'Docker', 'GitHub Actions', 'RBAC'],
      es: ['C#', '.NET', 'API REST', 'SQL Server', 'TypeScript', 'Node.js', 'Cloudflare Workers', 'Azure', 'Docker', 'GitHub Actions', 'RBAC'],
    },
    summary: {
      en: 'Senior Full Stack & Mobile Developer at Solusoft (Madrid) who designs and maintains ApiMovil and the Wemob API, the C#/.NET REST backends over SQL Server shared by web and native Android and iOS clients, alongside enterprise .NET work on AGEDI and Sisley (SQL Server, Azure). Outside client work: TypeScript APIs — the Cloudflare Workers API behind my portfolio and a self-hosted VPS orchestrator with RBAC, AES-256-GCM secrets and 628 Jest tests — and an AI master\'s project of 16 microservice repos on Kubernetes.',
      es: 'Desarrollador Full Stack & Móvil Senior en Solusoft (Madrid): diseño y mantengo ApiMovil y la API de Wemob, los backends REST en C#/.NET sobre SQL Server que comparten la web y los clientes nativos Android e iOS, junto al trabajo .NET empresarial en AGEDI y Sisley (SQL Server, Azure). Fuera del trabajo de cliente: APIs en TypeScript — la API en Cloudflare Workers que alimenta mi portfolio y un orquestador de VPS autoalojado con RBAC, secretos AES-256-GCM y 628 tests con Jest — y un TFM de 16 repositorios de microservicios sobre Kubernetes.',
    },
    prioritySkillIds: ['csharp', 'typescript', 'kotlin', 'java', 'go', 'python', 'javascript', 'dotnet', 'nodejs', 'spring-boot', 'ktor', 'sqlserver', 'postgresql', 'sqlite', 'cloudflare', 'azure', 'firebase', 'docker', 'github-actions', 'git', 'clean-architecture', 'multimodular-feature', 'test-driven', 'agile'],
    projectIds: ['career-ecosystem', 'apimovil', 'wemob', 'vpsorchestrator', 'axiomnode', 'templetry'],
    maxCerts: 4,
  },
  frontend: {
    label: { en: 'Frontend Developer (React & TypeScript)', es: 'Desarrollador Frontend (React & TypeScript)' },
    tab: { en: 'Frontend', es: 'Frontend' },
    keywords: {
      en: ['React', 'TypeScript', 'JavaScript', 'Vite', 'Tailwind CSS', 'Wails', 'Accessibility', 'Playwright', 'Vitest', 'CI/CD'],
      es: ['React', 'TypeScript', 'JavaScript', 'Vite', 'Tailwind CSS', 'Wails', 'Accesibilidad', 'Playwright', 'Vitest', 'CI/CD'],
    },
    summary: {
      en: 'Senior Full Stack & Mobile Developer at Solusoft (Madrid) with front-end work on the AGEDI and Sisley web platforms (C#/.NET MVC). Built my portfolio as a product: a React + TypeScript + Vite site fed by a Cloudflare Workers API, with Vitest unit tests and Playwright + axe accessibility checks in CI. React + TypeScript desktop UIs on Wails for Templetry and WinForge, and the React backoffice of the AxiomNode master\'s project.',
      es: 'Desarrollador Full Stack & Móvil Senior en Solusoft (Madrid) con trabajo front-end en las plataformas web de AGEDI y Sisley (C#/.NET MVC). Construí mi portfolio como un producto: una web React + TypeScript + Vite alimentada por una API en Cloudflare Workers, con tests unitarios Vitest y comprobaciones Playwright + axe de accesibilidad en CI. Interfaces de escritorio React + TypeScript sobre Wails para Templetry y WinForge, y el backoffice React del TFM AxiomNode.',
    },
    prioritySkillIds: ['typescript', 'javascript', 'react', 'nodejs', 'cloudflare', 'git', 'github-actions', 'docker', 'test-driven', 'clean-architecture', 'agile'],
    projectIds: ['career-ecosystem', 'templetry', 'winforge', 'axiomnode', 'sisley'],
    maxCerts: 3,
  },
}

export const ROLE_IDS: RoleId[] = ['fullstack', 'mobile', 'backend', 'frontend']

export const SPOKEN_LANGS = {
  en: [
    { lang: 'Spanish', level: 'Native (C2)' },
    { lang: 'English',  level: 'Professional working proficiency (B2)' },
  ],
  es: [
    { lang: 'Español', level: 'Nativo (C2)' },
    { lang: 'Inglés',  level: 'Competencia profesional (B2)' },
  ],
}

/** YYYY-MM range for ATS parsers, falling back to the localized period text */
export function atsDates(j: { startDate?: string; endDate?: string | null; period: unknown }, lang: 'en' | 'es', loc: (v: unknown) => string): string {
  if (!j.startDate) return loc(j.period)
  const end = j.endDate ?? (lang === 'es' ? 'Actualidad' : 'Present')
  return `${j.startDate} - ${end}`
}
