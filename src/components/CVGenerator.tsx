import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePortfolioData } from '../context/PortfolioDataContext'
import { localize } from '../lib/localize'
import { useLang } from '../hooks/useLang'
import { pdf, type DocumentProps } from '@react-pdf/renderer'
import { CVDocument, AtsCVDocument } from './cv/CVDocument'
import { CV_FULL_NAME, ROLES, ROLE_IDS, atsDates, type RoleId } from './cv/profiles'
import { buildCvContent } from './cv/cvContent'

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

  const loc = (v: unknown) => localize(v as Parameters<typeof localize>[0], lang)
  const isEs = lang === 'es'

  // Same mapping the PDF documents use, so the preview matches the download
  const cv = buildCvContent({ lang, role, personal, skills, projects, education })
  const { roleTitle, tagline, summary, keywords, skillRows, spokenLangs } = cv
  const cvProjects = cv.projects
  const cvCerts = cv.certs

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
                {ROLES[r].tab[lang]}
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
                <p className="text-base font-bold">{CV_FULL_NAME}</p>
                <p className="font-bold">{roleTitle}</p>
                {tagline && <p className="text-slate-700">{tagline}</p>}
                <p className="mt-1 text-slate-700">{personal.email} | {loc(personal.location)}</p>
                {personal.social?.github && <p className="text-slate-700">GitHub: {personal.social.github}</p>}
                {personal.social?.linkedin && <p className="text-slate-700 break-all">LinkedIn: {personal.social.linkedin}</p>}
                <p className="text-slate-700 break-all">Portfolio: {cv.portfolio.url}</p>

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Resumen Profesional' : 'Professional Summary'}</p>
                <p className="mt-1">{summary}</p>
                <p className="mt-1"><span className="font-bold">{isEs ? 'Palabras clave' : 'Keywords'}:</span> {keywords.join(', ')}</p>

                <p className="mt-4 font-bold uppercase border-b border-slate-900 pb-0.5">{isEs ? 'Habilidades Técnicas' : 'Technical Skills'}</p>
                {skillRows.map(row => (
                  <p key={row.key} className="mt-0.5"><span className="font-bold">{row.label}:</span> {row.names.join(', ')}</p>
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
                {cvProjects.map(p => (
                  <div key={p.id} className="mt-1.5">
                    <p><span className="font-bold">{p.name}</span> ({p.context}) - {p.desc}</p>
                    {p.tags.length > 0 && <p className="text-slate-700">{isEs ? 'Tecnologías' : 'Technologies'}: {p.tags.slice(0, 8).join(', ')}</p>}
                    {p.links.map(l => <p key={l.url} className="text-slate-700 break-all">{l.url}</p>)}
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
                      {CV_FULL_NAME}
                    </h1>
                    <p className="text-sm font-semibold text-violet-700 mt-0.5">{roleTitle}</p>
                    {tagline && <p className="text-[11px] italic text-slate-500 mt-0.5">{tagline}</p>}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[10px] text-slate-500">
                      <a href={`mailto:${personal.email}`} className="hover:text-violet-600">{personal.email}</a>
                      {cv.contact.links.map(l => (
                        <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="hover:text-violet-600 break-all">{l.label}</a>
                      ))}
                      <span>📍 {cv.contact.location}</span>
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
                  <p className="text-[10px] text-slate-500 mt-1">
                    {isEs ? 'Portfolio y casos de estudio: ' : 'Portfolio and case studies: '}
                    <a href={cv.portfolio.url} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">{cv.portfolio.label}</a>
                  </p>
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
                          {row.label}:
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
                    {cvProjects.map(p => (
                      <div key={p.id}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-900">
                            {p.name}
                            {p.links.map(l => (
                              <a key={l.url} href={l.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-violet-500 font-normal text-[9px] hover:underline">{l.label}</a>
                            ))}
                          </span>
                          <span className="text-[9px] text-slate-400 whitespace-nowrap flex-shrink-0">{p.context}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.desc}</p>
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
