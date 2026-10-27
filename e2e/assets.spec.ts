import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'
import { assetRepo } from '../src/lib/projectAssets'

/*
 * Portfolio assets standard (.github/portfolio/ in each project repo). The repos have no assets
 * yet, so every asset response is mocked and the build-time manifest inlined in index.html is
 * replaced per test.
 */

const RAW = 'https://raw.githubusercontent.com'
const OWL_DIR = `${RAW}/Sebas1705/Owlsplit/HEAD/.github/portfolio`
const FEATURED = ['Owlsplit', 'Haltera', 'Templetry', 'WinForge', 'Career Ecosystem (Folio)']
const PIXEL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

type Project = { id: string; name: string; context: string; github: string | null; demo: string | null }
const data = JSON.parse(readFileSync('public/data/projects.json', 'utf8')) as { work: Project[]; featured: Project[] }
const allProjects = [...data.work, ...data.featured]
/** What a build produces today: every repo checked, no files found */
const NOTHING_YET = Object.fromEntries(allProjects.map(p => assetRepo(p.github)).filter(Boolean).map(r => [r, []]))

async function blockApi(page: Page) {
  await page.route('https://api.sebas1705.dev/**', route => route.abort('failed'))
}

/**
 * Serves index.html as if the build had found `manifest`: the inlined manifest is replaced and the
 * repo images the real build baked into the static snapshot are dropped, so tests don't depend on
 * which assets the project repos have today.
 */
async function withManifest(page: Page, manifest: Record<string, string[]>) {
  await page.route(url => url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'), async route => {
    if (route.request().resourceType() !== 'document') return route.fallback()
    const response = await route.fetch()
    const html = (await response.text())
      .replace(
        /(<script type="application\/json" id="portfolio-assets">)[\s\S]*?(<\/script>)/,
        `$1${JSON.stringify(manifest)}$2`,
      )
      .replace(/<img\b[^>]*\bsrc="https:\/\/raw\.githubusercontent\.com\/[^"]*"[^>]*>/g, '')
    await route.fulfill({ response, body: html, headers: { ...response.headers(), 'content-type': 'text/html' } })
  })
}

/** Records every request to raw.githubusercontent.com and answers from `files` (404 otherwise) */
async function mockRepoAssets(page: Page, files: Record<string, { type: string; body: string | Buffer }>) {
  const requested: string[] = []
  await page.route(`${RAW}/**`, route => {
    const url = route.request().url()
    requested.push(url)
    const file = files[url]
    return file
      ? route.fulfill({ status: 200, contentType: file.type, body: file.body })
      : route.fulfill({ status: 404, contentType: 'text/plain', body: '404: Not Found' })
  })
  return requested
}

async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice']).analyze()
  const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
  expect(blocking.map(v => `${v.id}: ${v.nodes.map(n => n.target.join(' ')).join(', ')}`)).toEqual([])
}

function pageErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(err.message))
  return errors
}

const CASE_STUDY_MD = [
  '# How Owlsplit settles debts',
  '',
  'The ledger keeps **integer cents** and simplifies debts greedily.',
  '',
  '![Settle-up screen](shots/settle.png)',
  '',
  '<script>window.__pwned = true</script>',
  '<img src="x" onerror="window.__pwned = true">',
  '',
  '[Architecture decisions](../../docs/adr/README.md)',
].join('\n')

test.describe('project assets', () => {
  test.beforeEach(async ({ page }) => { await blockApi(page) })

  test('degrades gracefully today: generated plates, NDA notes, links, and no asset requests', async ({ page }) => {
    const errors = pageErrors(page)
    await withManifest(page, NOTHING_YET)
    const requested = await mockRepoAssets(page, {})
    await page.goto('./#projects')
    await expect(page.getByRole('heading', { level: 2, name: 'Projects' })).toBeVisible()

    // Featured row first, in the agreed order
    const featured = page.getByTestId('featured-projects').getByTestId('project-card')
    await expect(featured).toHaveCount(FEATURED.length)
    for (const [i, name] of FEATURED.entries()) {
      await expect(featured.nth(i).getByRole('heading', { level: 4 })).toHaveText(name)
      await expect(featured.nth(i).getByTestId('project-banner')).toHaveAttribute('data-source', 'fallback')
    }

    // Then groups: client work (all NDA, generated icon tile), personal, academic
    const groups = page.locator('[data-testid^="project-group-"]')
    await expect(groups).toHaveCount(3)
    expect(await groups.evaluateAll(els => els.map(e => e.getAttribute('data-testid')))).toEqual(
      ['project-group-work', 'project-group-personal', 'project-group-academic'])
    const work = page.getByTestId('project-group-work')
    await expect(work).toContainText('the code is private')
    const workCards = work.getByTestId('project-card')
    await expect(workCards).toHaveCount(data.work.length)
    await expect(work.locator('[data-nda="true"]')).toHaveCount(data.work.filter(p => !p.github).length)
    await expect(work.getByTestId('project-icon').first()).toHaveAttribute('data-source', 'fallback')

    // Every public project links to its code, and to its demo when it has one
    for (const p of allProjects) {
      const card = page.getByTestId('project-card').filter({ has: page.getByRole('button', { name: `Details of ${p.name}`, exact: true }) })
      if (p.github) await expect(card.getByRole('link', { name: new RegExp(`^Code: ${escapeRe(p.name)}`) })).toHaveAttribute('href', p.github)
      if (p.demo) await expect(card.locator(`a[href="${p.demo}"]`)).toHaveCount(1)
    }

    // NDA detail dialog: no case study, an explicit note instead of a code link
    await work.getByRole('button', { name: 'Details of AGEDI System' }).click()
    const modal = page.getByRole('dialog', { name: 'AGEDI System' })
    await expect(modal).toContainText('source code is private')
    await expect(modal.getByTestId('case-study-open')).toHaveCount(0)
    await expect(modal.getByTestId('project-banner')).toHaveCount(0) // no empty plate in the dialog

    expect(requested).toEqual([]) // the manifest said nothing exists → nothing is requested
    expect(errors).toEqual([])
  })

  test('unchecked repos are tried optimistically and fall back on 404', async ({ page }) => {
    const errors = pageErrors(page)
    await withManifest(page, {})
    const requested = await mockRepoAssets(page, {})
    await page.goto('./#projects')
    const owl = page.getByTestId('featured-projects').getByTestId('project-card').first()
    await expect(owl.getByTestId('project-banner')).toHaveAttribute('data-source', 'fallback')
    await expect(owl.getByTestId('project-banner-fallback')).toBeVisible()
    await expect.poll(() => requested.some(u => u === `${OWL_DIR}/banner.png`)).toBe(true)
    // portfolio.json is fetched once per repo even though several components ask for it
    expect(requested.filter(u => u === `${OWL_DIR}/portfolio.json`)).toHaveLength(1)
    expect(errors).toEqual([])
  })

  test('repo banner, icon accent and case study (sanitised, with language fallback)', async ({ page }) => {
    const errors = pageErrors(page)
    await withManifest(page, { ...NOTHING_YET, 'Sebas1705/Owlsplit': ['icon.png', 'banner.png', 'portfolio.json', 'case-study.en.md'] })
    const requested = await mockRepoAssets(page, {
      [`${OWL_DIR}/banner.png`]: { type: 'image/png', body: PIXEL_PNG },
      [`${OWL_DIR}/icon.png`]: { type: 'image/png', body: PIXEL_PNG },
      [`${OWL_DIR}/portfolio.json`]: { type: 'application/json', body: JSON.stringify({ accent: '#0F766E', banner_alt: { en: 'Owlsplit: shared expenses for Android and iOS', es: 'Owlsplit: gastos compartidos' } }) },
      [`${OWL_DIR}/case-study.en.md`]: { type: 'text/plain', body: CASE_STUDY_MD },
      [`${OWL_DIR}/shots/settle.png`]: { type: 'image/png', body: PIXEL_PNG },
    })
    await page.goto('./#projects')

    // Card with banner (repo) next to cards without (fallback)
    const cards = page.getByTestId('featured-projects').getByTestId('project-card')
    const owlBanner = cards.first().getByTestId('project-banner')
    await expect(owlBanner).toHaveAttribute('data-source', 'repo')
    const img = owlBanner.getByRole('img')
    await expect(img).toHaveAttribute('alt', 'Owlsplit: shared expenses for Android and iOS')
    await expect(img).toHaveAttribute('loading', 'lazy')
    await expect.poll(() => img.evaluate(el => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    const box = await owlBanner.boundingBox()
    expect(Math.round(box!.width / box!.height)).toBe(2) // fixed 2:1 box
    await expect(cards.nth(1).getByTestId('project-banner')).toHaveAttribute('data-source', 'fallback')

    await page.waitForTimeout(1000)
    await runAxe(page)

    // Detail → case study: only the English file exists, so Spanish readers get it with a note
    await page.getByRole('button', { name: /Cambiar a español/ }).click()
    await cards.first().getByRole('button', { name: 'Detalles de Owlsplit' }).click()
    const modal = page.getByRole('dialog', { name: 'Owlsplit' })
    await expect(modal.getByTestId('project-icon')).toHaveAttribute('data-source', 'repo')
    await modal.getByRole('button', { name: 'Leer caso de estudio' }).click()
    await expect(modal.getByText('Solo disponible en inglés.')).toBeVisible()
    const body = modal.getByTestId('case-study-body')
    await expect(body.getByRole('heading', { name: 'How Owlsplit settles debts' })).toBeVisible()
    await expect(body.locator('strong')).toHaveText('integer cents')
    await expect(body.getByRole('img', { name: 'Settle-up screen' })).toHaveAttribute('src', `${OWL_DIR}/shots/settle.png`)
    await expect(body.getByRole('link', { name: 'Architecture decisions' })).toHaveAttribute('href', `${RAW}/Sebas1705/Owlsplit/HEAD/docs/adr/README.md`)
    await expect(body.getByRole('link', { name: 'Architecture decisions' })).toHaveAttribute('rel', 'noopener noreferrer')
    await expect(body.locator('script, [onerror]')).toHaveCount(0)
    expect(await page.evaluate(() => (window as unknown as { __pwned?: boolean }).__pwned)).toBeUndefined()
    await expect(modal.getByRole('button', { name: 'Volver al proyecto' })).toBeFocused()
    await page.waitForTimeout(400)
    await runAxe(page)

    // Escape steps back to the project, then closes the dialog
    await page.keyboard.press('Escape')
    await expect(modal.getByTestId('case-study-body')).toHaveCount(0)
    await expect(modal.getByRole('button', { name: 'Leer caso de estudio' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).toHaveCount(0)

    expect(requested.filter(u => u.endsWith('case-study.es.md'))).toEqual([]) // manifest: no Spanish file
    expect(errors).toEqual([])
  })
})

test.describe('projects slide fits the viewport', () => {
  test.beforeEach(async ({ page }) => {
    await blockApi(page)
    await withManifest(page, NOTHING_YET)
  })

  for (const vp of [{ width: 1366, height: 768 }, { width: 390, height: 844 }]) {
    test(`${vp.width}×${vp.height}: no page overflow, the section scrolls inside`, async ({ page }) => {
      await page.setViewportSize(vp)
      await page.goto('./#projects')
      await expect(page.getByTestId('featured-projects')).toBeVisible()
      await page.waitForTimeout(900)

      // The document itself never scrolls (deck), horizontally or vertically
      const doc = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight,
        w: window.innerWidth, h: window.innerHeight,
      }))
      expect(doc.sw).toBeLessThanOrEqual(doc.w)
      expect(doc.sh).toBeLessThanOrEqual(doc.h)

      // Header and the first featured card are visible without scrolling
      await expect(page.getByRole('heading', { level: 2, name: 'Projects' })).toBeInViewport()
      await expect(page.getByTestId('featured-projects').getByTestId('project-card').first()).toBeInViewport()

      // The rest is reachable by scrolling the section itself
      const section = page.locator('[data-scrollable]').first()
      const sizes = await section.evaluate(el => ({ sh: el.scrollHeight, ch: el.clientHeight, sw: el.scrollWidth, cw: el.clientWidth }))
      expect(sizes.sw).toBeLessThanOrEqual(sizes.cw)
      const last = page.getByTestId('project-group-academic').getByTestId('project-card').last()
      await last.scrollIntoViewIfNeeded()
      await expect(last).toBeInViewport()

      if (vp.width < 768) await runAxe(page)
    })
  }
})

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
