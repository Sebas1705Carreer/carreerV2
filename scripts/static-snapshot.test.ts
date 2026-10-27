import { describe, expect, it } from 'vitest'
import { buildSnapshot, projectItem, type SnapshotProject } from './static-snapshot'

describe('projectItem', () => {
  const base: SnapshotProject = { name: 'YouKnow', context: 'academic', desc: { en: 'Quiz app' }, tags: ['Kotlin'], github: null, demo: null }

  it('renders a lazy, size-reserved cover image with the localized alt', () => {
    const html = projectItem({
      ...base,
      imageUrl: 'https://sebas1705carreer.github.io/carreerV2/projects/youknow.webp',
      imageAlt: { en: 'Home "screen" & menu', es: 'Inicio' },
    })
    expect(html).toContain('src="https://sebas1705carreer.github.io/carreerV2/projects/youknow.webp"')
    expect(html).toContain('alt="Home &quot;screen&quot; &amp; menu"')
    expect(html).toContain('loading="lazy"')
    expect(html).toMatch(/width="\d+" height="\d+"/)
  })

  it('falls back to the project name for the alt', () => {
    expect(projectItem({ ...base, imageUrl: 'https://example.com/a.webp', imageAlt: null })).toContain('alt="YouKnow"')
  })

  it('renders no image when there is none or the URL is not https', () => {
    expect(projectItem(base)).not.toContain('<img')
    expect(projectItem({ ...base, imageUrl: null })).not.toContain('<img')
    expect(projectItem({ ...base, imageUrl: 'javascript:alert(1)' })).not.toContain('<img')
  })
})

describe('buildSnapshot', () => {
  const html = buildSnapshot('/carreerV2/')

  it('renders the name as the h1 and the section nav', () => {
    expect(html).toContain('<h1>Sebastián Ramiro Entrerrios García</h1>')
    expect(html).toContain('<nav aria-label="Sections">')
    expect(html).toContain('href="#projects"')
  })

  it('prefixes CV links with the configured base path', () => {
    expect(html).toContain('href="/carreerV2/cv/cv-en.pdf"')
    expect(html).toContain('href="/carreerV2/cv/cv-es.pdf"')
  })

  it('escapes HTML in the fallback data', () => {
    // Role contains "&" in the fallback JSON → must be escaped in the markup
    expect(html).toMatch(/Full Stack &amp; Mobile Developer/)
    expect(html).not.toMatch(/Full Stack & Mobile Developer/)
  })
})
