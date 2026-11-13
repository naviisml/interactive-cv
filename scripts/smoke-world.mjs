import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
await mkdir('test-results/world', { recursive: true })
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
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      'the world must not introduce horizontal document overflow',
    )
    // The opening monitor is a genuine, accessible editable workstation.
    await page.locator('.journey-footer').getByRole('button', { name: /My first code/ }).click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    const openFirst = page.getByRole('button', { name: /Open the first computer/i })
    await openFirst.click()
    const firstCode = page.getByRole('dialog', { name: 'Explore the code' })
    await firstCode.waitFor({ state: 'visible' })
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), true)
    await firstCode.getByRole('button', { name: 'style.css' }).click()
    await firstCode.getByRole('textbox', { name: 'CSS editor' }).fill('body { background: lavender; }')
    assert.ok(
      (await firstCode.locator('iframe').getAttribute('srcdoc')).includes('background: lavender'),
      'HTML/CSS preview follows editor changes',
    )
    const editorLayout = await firstCode.evaluate((dialog) => {
      const preview = dialog.querySelector('iframe').getBoundingClientRect()
      const footer = dialog.querySelector('footer').getBoundingClientRect()
      return { previewBottom: preview.bottom, footerTop: footer.top }
    })
    assert.ok(
      editorLayout.footerTop >= editorLayout.previewBottom - 2,
      'code editor footer must remain below live preview instead of overlapping it',
    )
    await page.screenshot({ path: `test-results/world/${label}-first-code.png` })
    await firstCode.getByRole('button', { name: 'Back to the journey' }).click()
    await firstCode.waitFor({ state: 'hidden' })
    await page.waitForFunction(
      () => document.activeElement?.textContent?.includes('Open the first computer'),
    )
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), false)

    if (mobile) {
      await page.locator('.menu-toggle').click()
      // A click on header whitespace is outside the menu and cannot
      // accidentally trigger an interactive object in the world.
      await page.locator('.portfolio-header').click({ position: { x: 7, y: 7 } })
      assert.equal(
        await page.locator('.menu-toggle').getAttribute('aria-expanded'),
        'false',
        'mobile menu closes after tapping outside',
      )
      assert.equal(await page.getByRole('dialog').count(), 0, 'outside tap opens no scene objects')
    }

    // Skills are now task-driven, not simply collected logos.
    const skillsLaunch = page.getByRole('button', { name: 'Skills', exact: true })
    if (mobile) await page.locator('.menu-toggle').click()
    await skillsLaunch.click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    await page.getByRole('button', { name: 'Open the workstations' }).click()
    const workshop = page.getByRole('dialog', { name: 'Build something that works.' })
    await workshop.waitFor({ state: 'visible' })
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), true)
    for (const step of ['commit', 'test', 'build', 'deploy']) {
      await workshop.getByRole('button', { name: '+ ' + step }).click()
    }
    await workshop.getByRole('button', { name: 'Run pipeline' }).click()
    await workshop.getByText('Success. You completed this workstation.').waitFor()
    await page.screenshot({ path: `test-results/world/${label}-skills-workshop.png` })
    await workshop.getByRole('button', { name: 'Continue the journey' }).click()
    await workshop.waitFor({ state: 'hidden' })
    await page.waitForFunction(
      () => document.activeElement?.textContent?.includes('Open the workstations'),
    )
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), false)

    if (!mobile) {
      const before = Number(await canvas.getAttribute('data-player-x'))
      await page.keyboard.down('ArrowRight')
      try {
        await page.waitForFunction(
          (x) => Number(document.querySelector('canvas')?.dataset.playerX) > x + 25,
          before,
          { timeout: 5000 },
        )
      } finally {
        await page.keyboard.up('ArrowRight')
      }
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
      await page.screenshot({ path: `test-results/world/${label}-building-interior.png` })
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
      await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
      assert.equal(
        await page.locator('.computer-invitation').count(),
        0,
        'a second floating project CTA must not cover the interactive computer',
      )
      assert.equal(
        await page.locator('.company-controls').count(),
        0,
        'arriving does not silently start or capture walking',
      )
      // The in-world screen remains clickable, and keyboard users get an
      // unobtrusive focus-revealed action with the same behavior.
      const computerAction = page.locator('.canvas-accessibility').getByRole('button', {
        name: 'Explore my projects',
        exact: true,
      })
      await computerAction.focus()
      await computerAction.click()
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
    // Retain real responsive renders for visual review, not just layout assertions.
    for (const [name, title] of [
      ['school', /Panta Rhei/],
      ['codam', /Codam Coding College/],
      ['hotel', /Fletcher Holdings/],
      ['airport', /Get-E/],
      ['office', /Appjection/],
      ['computer', /Navel Development/],
      ['camp', /write the next chapter/i],
    ]) {
      const stop = page.locator('.journey-footer').getByRole('button', { name: title })
      if (!(await stop.count())) continue
      await stop.click()
      await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
      if (mobile) await canvas.tap({ position: { x: 180, y: 200 } })
      await page.waitForTimeout(350)
      await page.screenshot({ path: `test-results/world/${label}-${name}.png` })
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
    await page.screenshot({ path: `test-results/world/${label}-final.png` }).catch(() => {})
    await page.close()
  }
}
async function readingModeScenario() {
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } })
  try {
    await page.goto(base + '/?view=list', { waitUntil: 'networkidle', timeout: 60000 })
    await page.locator('.timeline-list').waitFor({ state: 'visible' })
    assert.equal(await page.locator('canvas[data-renderer="pixi"]').count(), 0,
      'direct reading mode must not initialize the WebGL game')
    assert.ok(await page.getByRole('button', { name: 'World view' }).isVisible(),
      'reading mode keeps navigation back to the world')
    console.log('PASS_reading_mode: direct accessible reading view without a WebGL renderer')
  } catch (error) {
    failures++
    console.error(`FAIL_reading_mode: ${error.stack || error}`)
  } finally {
    await page.close()
  }
}
try {
  await scenario('desktop', 1440, 900, false)
  await scenario('mobile', 390, 844, true)
  await scenario('compact', 375, 667, true)
  await readingModeScenario()
} finally {
  await browser.close()
}
if (failures) process.exitCode = 1
