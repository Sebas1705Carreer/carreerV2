import { readFileSync } from 'node:fs'
import type { Plugin } from 'vite'

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

export function buildSnapshot(base: string): string {
  const personal = read('personal')
  const jobs = read('jobs') as Array<{ role: ML; company: string; companyUrl?: string; period: ML; desc: ML }>
  const projects = read('projects') as { work: Project[]; featured: Project[] }
  const education = read('education') as { items: Array<{ degree: ML; school: string; period: ML }>; certs: Array<{ name: ML; issuer: string; date: string; url: string | null }> }
  type Project = { name: string; context: string; desc: ML; tags: string[]; github: string | null; demo: string | null }

  const link = (href: string, text: string) => `<a href="${esc(href)}">${esc(text)}</a>`
  const projectItem = (p: Project) => {
    const links = [p.github && link(p.github, 'GitHub'), p.demo && link(p.demo, 'Demo')].filter(Boolean).join(' · ')
    return `<li><strong>${esc(p.name)}</strong> — ${esc(loc(p.desc))} <em>(${esc((p.tags ?? []).slice(0, 6).join(', '))})</em>${links ? ` ${links}` : ''}</li>`
  }

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
