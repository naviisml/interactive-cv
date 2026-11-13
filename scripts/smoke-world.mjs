import assert from 'node:assert/strict'
import { chromium } from 'playwright'
const base = process.env.SMOKE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({
  channel: 'chrome',
  headless: true,
  args: ['--no-sandbox', '--enable-unsafe-swiftshader'],
})
let failures = 0
async function scenario(label, width, height, mobile) {
  const page = await browser.newPage({
    viewport: { width, height },
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
  })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 })
    const canvas = page.locator('canvas[data-renderer="pixi"]')
    await canvas.waitFor({ state: 'visible', timeout: 30000 })
    await page.waitForFunction(() => !!document.querySelector('canvas')?.dataset.playerX)
    const header = await page.locator('.portfolio-header').boundingBox(),
      stage = await page.locator('.world').boundingBox(),
      footer = await page.locator('.journey-footer').boundingBox()
    assert.ok(header && stage && footer)
    assert.ok(stage.height > 220)
    assert.ok(Math.abs(header.y + header.height - stage.y) < 3)
    assert.ok(Math.abs(stage.y + stage.height - footer.y) < 3)
    assert.ok(footer.y + footer.height < height + 3)
    if (!mobile) {
      const before = Number(await canvas.getAttribute('data-player-x'))
      await page.keyboard.down('ArrowRight')
      await page.waitForTimeout(650)
      await page.keyboard.up('ArrowRight')
      await page.waitForTimeout(100)
      assert.ok(
        Number(await canvas.getAttribute('data-player-x')) > before + 25,
        'keyboard works without a first click',
      )
      await page.getByRole('button', { name: 'Skills', exact: true }).click()
      await page.locator('.caption-travel').waitFor({ state: 'visible' })
      await page.keyboard.press('Space')
      await page.waitForTimeout(100)
      assert.equal(
        await page.locator('.caption-travel').count(),
        0,
        'Space must not reactivate focused navigation',
      )
    } else {
      assert.ok(await page.getByRole('button', { name: 'Jump', exact: true }).isVisible())
      await page.locator('.menu-toggle').click()
      await page.locator('.view-toggle').click()
      await page.locator('.timeline-list').waitFor({ state: 'visible' })
      const sticky = await page.locator('.portfolio-header').boundingBox()
      assert.ok(Math.abs(sticky.y) < 3)
      await page.locator('.menu-toggle').click()
      await page.locator('.view-toggle').click()
      await canvas.waitFor({ state: 'visible' })
    }
    if (!mobile) {
      await page.getByRole('button', { name: 'Skills', exact: true }).click()
      await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
      await page.keyboard.press('Space')
      await page.waitForFunction(
        () => Number(document.querySelector('canvas')?.dataset.skillCount) > 0,
      )
      assert.equal(
        await page.locator('.activity-controls').count(),
        0,
        'no duplicate interaction menu',
      )
      await page.getByRole('button', { name: 'Work', exact: true }).click()
      await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
      await page.getByRole('button', { name: 'Enter building', exact: true }).click()
      await page.getByRole('dialog').waitFor({ state: 'visible' })
      await page.getByRole('button', { name: 'Skills & tools', exact: true }).click()
      assert.ok(await page.locator('.room-board.is-stack').isVisible())
      await page.locator('.room-exit').click()
      await page.waitForFunction(
        () => document.querySelector('canvas')?.dataset.visit === 'outside',
      )
      const doorX = Number(await canvas.getAttribute('data-player-x'))
      await page.keyboard.down('ArrowLeft')
      await page.waitForTimeout(400)
      await page.keyboard.up('ArrowLeft')
      assert.ok(
        Number(await canvas.getAttribute('data-player-x')) < doorX - 10,
        'exit restores movement',
      )
      await page.getByRole('button', { name: 'Company & projects', exact: true }).click()
      await page.locator('.company-controls').waitFor({ state: 'visible', timeout: 20000 })
      assert.equal(
        await page.locator('.company-controls button[aria-pressed]').count(),
        7,
        'all original projects remain inside the computer',
      )
      await page.getByRole('button', { name: 'Next slide', exact: true }).click()
      await page.waitForTimeout(150)
      const p = Number(await canvas.getAttribute('data-presentation')),
        x = Number(await canvas.getAttribute('data-player-x'))
      await page.keyboard.down('ArrowRight')
      await page.waitForTimeout(600)
      await page.keyboard.up('ArrowRight')
      assert.ok(
        Number(await canvas.getAttribute('data-presentation')) > p,
        'walking after a button click advances the slideshow',
      )
      assert.ok(
        Math.abs(Number(await canvas.getAttribute('data-player-x')) - x) < 1,
        'watch point holds the actor',
      )
      assert.equal(
        await page
          .locator('.journey-footer')
          .getByRole('button', { name: /GmodStore/ })
          .count(),
        0,
        'no duplicate project chapters',
      )
    }
    await page.locator('.language-switch select').selectOption('nl')
    await page.waitForFunction(() => document.documentElement.lang === 'nl')
    await page
      .getByRole('button', { name: 'Over mij', exact: true })
      .waitFor({ state: mobile ? 'hidden' : 'visible' })
    assert.equal(await page.locator('html').getAttribute('lang'), 'nl')
    await page.locator('.language-switch select').selectOption('en')
    await page.waitForTimeout(250)
    assert.deepEqual(errors, [])
    console.log(`PASS_${label}: PixiJS, layout, input, navigation and i18n`)
  } catch (error) {
    failures++
    console.error(`FAIL_${label}: ${error.stack || error}`)
  } finally {
    await page.close()
  }
}
try {
  await scenario('desktop', 1440, 900, false)
  await scenario('mobile', 390, 844, true)
  await scenario('compact', 375, 667, true)
} finally {
  await browser.close()
}
if (failures) process.exitCode = 1
