/*
 * CV role profiles and shared helpers (no React): consumed by the PDF
 * documents (CVDocument.tsx), the in-browser generator and scripts/build-cv.mjs.
 */

// ── Role profiles ─────────────────────────────────────────────────────────────
export type RoleId = 'fullstack' | 'mobile' | 'backend' | 'frontend'

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

export const ROLES: Record<RoleId, RoleProfile> = {
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
