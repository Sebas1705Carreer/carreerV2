import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'
import { PROJECT_IMAGE_HEIGHT, PROJECT_IMAGE_WIDTH, safeImageUrl } from '../src/lib/projectImage'

/*
 * Vite plugin: injects a static, crawlable HTML snapshot of the main sections
 * (built from the public/data/*.json fallback) inside <div id="root">.
 * Crawlers and no-JS clients see real content; React's createRoot() replaces
 * it on the first render, so the app itself is untouched.
 */

type ML = string | Record<string, string>
const loc = (v: ML | undefined, lang = 'en') => (typeof v === 'string' ? v : v?.[lang] ?? v?.en ?? '')
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string))
const read = (name: string) => JSON.parse(readFileSync(`public/data/${name}.json`, 'utf8'))

const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`

export type SnapshotProject = {
  name: string; context: string; desc: ML; tags: string[]; github: string | null; demo: string | null
  imageUrl?: string | null; imageAlt?: ML | null
}

/** Lazy, size-reserved cover image; empty when the project has none */
export const projectImage = (p: SnapshotProject) => {
  const src = safeImageUrl(p.imageUrl)
  if (!src) return ''
  const alt = loc(p.imageAlt ?? undefined).trim() || p.name
  return `<img src="${esc(src)}" alt="${esc(alt)}" width="${PROJECT_IMAGE_WIDTH}" height="${PROJECT_IMAGE_HEIGHT}" loading="lazy" decoding="async" style="display:block;max-width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;margin:.25rem 0">`
}

export const projectItem = (p: SnapshotProject) => {
  const links = [p.github && link(p.github, 'GitHub'), p.demo && link(p.demo, 'Demo')].filter(Boolean).join(' · ')
  return `<li>${projectImage(p)}<strong>${esc(p.name)}</strong> — ${esc(loc(p.desc))} <em>(${esc((p.tags ?? []).slice(0, 6).join(', '))})</em>${links ? ` ${links}` : ''}</li>`
}

export function buildSnapshot(base: string): string {
  const personal = read('personal')
  const jobs = read('jobs') as Array<{ role: ML; company: string; companyUrl?: string; period: ML; desc: ML }>
  const projects = read('projects') as { work: SnapshotProject[]; featured: SnapshotProject[] }
  const education = read('education') as { items: Array<{ degree: ML; school: string; period: ML }>; certs: Array<{ name: ML; issuer: string; date: string; url: string | null }> }

  const name = 'Sebastián Ramiro Entrerrios García'
  return `
<div id="static-shell" style="max-width:56rem;margin:0 auto;padding:2rem 1rem;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#1e293b">
  <header>
    <p>${esc(loc(personal.greeting))}</p>
    <h1>${esc(name)}</h1>
    <p><strong>${esc(loc(personal.role))}</strong></p>
    <p>${esc(loc(personal.tagline))}</p>
    <p>${esc(loc(personal.bio))}</p>
    <p>
      ${link(`${base}cv/cv-en.pdf`, 'Download CV (PDF, English)')} ·
      ${link(`${base}cv/cv-es.pdf`, 'Descargar CV (PDF, Español)')} ·
      ${link(personal.social.github, 'GitHub')} ·
      ${link(personal.social.linkedin, 'LinkedIn')} ·
      ${link(`mailto:${personal.email}`, personal.email)}
    </p>
    <nav aria-label="Sections">
      ${['about', 'skills', 'experience', 'projects', 'education', 'contact'].map(s => link(`#${s}`, s[0].toUpperCase() + s.slice(1))).join(' · ')}
    </nav>
  </header>
  <section id="experience-static">
    <h2>Experience</h2>
    <ul>
      ${jobs.map(j => `<li><strong>${esc(loc(j.role))}</strong> — ${j.companyUrl ? link(j.companyUrl, j.company) : esc(j.company)} (${esc(loc(j.period))}). ${esc(loc(j.desc))}</li>`).join('\n      ')}
    </ul>
  </section>
  <section id="projects-static">
    <h2>Projects</h2>
    <h3>Work</h3>
    <ul>
      ${projects.work.map(projectItem).join('\n      ')}
    </ul>
    <h3>Personal &amp; academic</h3>
    <ul>
      ${projects.featured.map(projectItem).join('\n      ')}
    </ul>
  </section>
  <section id="education-static">
    <h2>Education</h2>
    <ul>
      ${education.items.map(e => `<li><strong>${esc(loc(e.degree))}</strong> — ${esc(e.school)} (${esc(loc(e.period))})</li>`).join('\n      ')}
    </ul>
    <h3>Certifications</h3>
    <ul>
      ${education.certs.map(c => `<li>${c.url ? link(c.url, loc(c.name)) : esc(loc(c.name))} — ${esc(c.issuer)}, ${esc(c.date)}</li>`).join('\n      ')}
    </ul>
  </section>
</div>`
}

export function staticSnapshot(): Plugin {
  let base = '/'
  return {
    name: 'static-snapshot',
    configResolved(config) { base = config.base },
    transformIndexHtml(html) {
      return html.replace('<div id="root"></div>', `<div id="root">${buildSnapshot(base)}</div>`)
    },
  }
}
