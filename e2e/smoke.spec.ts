import AxeBuilder from '@axe-core/playwright'
import { expect, test, type ConsoleMessage, type Page } from '@playwright/test'

const API_HOST = 'api.sebas1705.dev'

/**
 * Hermetic data: the live API is blocked so every run exercises the bundled
 * public/data/*.json fallback (same content the static snapshot is built from).
 * The blocked request itself logs a resource error in Chromium; that one is expected.
 */
async function blockApi(page: Page) {
  await page.route(`https://${API_HOST}/**`, route => route.abort('failed'))
}

function collectErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', err => errors.push(`pageerror: ${err.message}`))
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return
    if (msg.location().url.includes(API_HOST)) return // the deliberately blocked API call
    errors.push(`console.error: ${msg.text()}`)
  })
  return errors
}

async function runAxe(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()
  const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
  const summary = blocking.map(v => `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes.map(n => n.target.join(' ')).join('\n  ')}`).join('\n')
  expect(blocking, `axe serious/critical violations:\n${summary}`).toEqual([])
  return results
}

test.describe('portfolio smoke', () => {
  test.beforeEach(async ({ page }) => {
    await blockApi(page)
  })

  test('loads, shows the hero with the name and the CV link, no console errors', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('./')

    await expect(page).toHaveTitle(/Sebastián Entrerrios García/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sebastián Entrerrios García')
    await expect(page.getByRole('main')).toBeVisible()

    const cv = page.getByRole('link', { name: 'Download CV (PDF)' })
    await expect(cv).toBeVisible()
    expect(await cv.getAttribute('href')).toMatch(/cv\/cv-en\.pdf$/)
    expect(await cv.getAttribute('download')).toBe('CV_Sebastian_Entrerrios_EN.pdf')

    // The fallback data must have landed (hero role comes from personal.json)
    await expect(page.getByText('Full Stack & Mobile Developer').first()).toBeVisible()

    expect(errors).toEqual([])
  })

  test('nav dots switch sections, update the hash, aria-current and the live region', async ({ page }) => {
    await page.goto('./')
    const nav = page.getByRole('navigation', { name: 'Sections' })
    const home = nav.getByRole('button', { name: 'Home' })
    const projects = nav.getByRole('button', { name: 'Projects' })
    const announcer = page.getByTestId('section-announcer')

    await expect(home).toHaveAttribute('aria-current', 'true')
    await expect(announcer).toHaveText('Home (1/7)')

    await projects.click()
    await expect(page).toHaveURL(/#projects$/)
    await expect(projects).toHaveAttribute('aria-current', 'true')
    await expect(home).not.toHaveAttribute('aria-current', 'true')
    await expect(announcer).toHaveText('Projects (5/7)')
    await expect(page.getByRole('heading', { level: 2, name: /projects/i })).toBeVisible()

    // Browser back walks the deck
    await page.goBack()
    await expect(page).not.toHaveURL(/#/)
    await expect(home).toHaveAttribute('aria-current', 'true')
  })

  test('a hash deep link opens that section directly; arrow keys move the deck', async ({ page }) => {
    await page.goto('./#skills')
    await expect(page.getByRole('heading', { level: 2, name: /skills/i })).toBeVisible()
    await expect(page.getByTestId('section-announcer')).toHaveText('Skills (3/7)')

    await page.keyboard.press('ArrowRight')
    await expect(page).toHaveURL(/#experience$/)
    await expect(page.getByTestId('section-announcer')).toHaveText('Experience (4/7)')
  })

  test('skip link focuses the main landmark without hijacking the hash router', async ({ page }) => {
    await page.goto('./#about')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await skip.press('Enter')
    await expect(page.getByRole('main')).toBeFocused()
    await expect(page).toHaveURL(/#about$/) // still on About, not reset to the hero
  })

  test('respects prefers-reduced-motion: sections still swap', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce', locale: 'en-US' })
    const page = await context.newPage()
    await blockApi(page)
    await page.goto('./')
    const nav = page.getByRole('navigation', { name: 'Sections' })
    await nav.getByRole('button', { name: 'Contact' }).click()
    await expect(page.getByRole('heading', { level: 2, name: /let's talk|contact/i })).toBeVisible()
    await expect(page).toHaveURL(/#contact$/)
    await page.waitForTimeout(800) // the deck throttles navigation for 700ms after each move
    await nav.getByRole('button', { name: 'About' }).click()
    await expect(page.getByRole('heading', { level: 2, name: /about/i })).toBeVisible()
    await expect(page).toHaveURL(/#about$/)
    await context.close()
  })

  test('single-page view stacks every section and can be reached from the toggle', async ({ page }) => {
    const errors = collectErrors(page)
    await page.goto('./')
    const toggle = page.getByTestId('view-toggle')
    await expect(toggle).toHaveAccessibleName('View as a single page')
    await toggle.click()
    await expect(page).toHaveURL(/\?view=all$/)

    const main = page.getByRole('main')
    for (const id of ['hero', 'about', 'skills', 'experience', 'projects', 'education', 'contact']) {
      await expect(main.locator(`#${id}`)).toHaveCount(1)
    }
    // All seven h2 are in the document at once (Ctrl+F / screen reader reading order)
    expect(await page.getByRole('heading', { level: 2 }).count()).toBeGreaterThanOrEqual(6)
    await expect(page.getByTestId('view-toggle')).toHaveAccessibleName('View as slides')
    // Deck-only chrome is gone
    await expect(page.getByRole('button', { name: 'Next section' })).toHaveCount(0)

    expect(errors).toEqual([])
  })

  test('axe: hero (deck view) has no serious/critical violations', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForTimeout(1200) // let the hero entrance animations settle (opacity → 1)
    await runAxe(page)
  })

  test('axe: single-page view has no serious/critical violations', async ({ page }) => {
    await page.goto('./?view=all')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await page.waitForTimeout(1200)
    await runAxe(page)
  })

  test('axe: a project with a cover image (card and detail) has no serious/critical violations', async ({ page }) => {
    const errors = collectErrors(page)
    await withProjectImage(page)
    await page.goto('./#projects')
    await expect(page.getByRole('heading', { level: 2, name: /projects/i })).toBeVisible()

    // Card: lazy, size-reserved, alt from image_alt in the current language, actually loaded
    const cardImage = page.getByTestId('project-image').first()
    await expect(cardImage).toBeVisible()
    await expect(cardImage).toHaveAttribute('alt', IMAGE_ALT_EN)
    await expect(cardImage).toHaveAttribute('loading', 'lazy')
    await expect(cardImage).toHaveAttribute('width', /\d+/)
    await expect(cardImage).toHaveAttribute('height', /\d+/)
    await expect.poll(() => cardImage.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0)
    // Only the project that has an image gets one (no empty frames on the others)
    await expect(page.getByTestId('project-image')).toHaveCount(1)

    await page.waitForTimeout(1200) // let the card entrance animations settle (opacity → 1)
    await runAxe(page)

    // Detail modal shows the same cover
    await cardImage.click()
    const modal = page.getByRole('dialog')
    await expect(modal).toBeVisible()
    await expect(modal.getByRole('button', { name: 'Close' })).toBeVisible()
    await expect(modal.getByTestId('project-image')).toHaveAttribute('alt', IMAGE_ALT_EN)
    await page.waitForTimeout(600)
    await runAxe(page)

    expect(errors).toEqual([])
  })
})

const IMAGE_ALT_EN = 'Screenshot of the project dashboard'
// 1×1 PNG: the image host is mocked too, so the test never depends on the real file existing
const PIXEL_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

/** Gives the first work project a cover image (as the adapters would produce from image_url / image_alt) */
async function withProjectImage(page: Page) {
  await page.route('https://sebas1705carreer.github.io/**', route =>
    route.fulfill({ status: 200, contentType: 'image/png', body: PIXEL_PNG }))
  await page.route('**/data/projects.json', async route => {
    const response = await route.fetch()
    const projects = await response.json()
    projects.work[0] = {
      ...projects.work[0],
      imageUrl: `https://sebas1705carreer.github.io/carreerV2/projects/${projects.work[0].id}.webp`,
      imageAlt: { en: IMAGE_ALT_EN, es: 'Captura del panel del proyecto' },
    }
    await route.fulfill({ response, json: projects })
  })
}
