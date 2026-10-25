import { describe, expect, it } from 'vitest'
import { buildSnapshot } from './static-snapshot'

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
