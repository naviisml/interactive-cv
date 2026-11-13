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
async function tapWorld(page, canvas, id, x, y, touch) {
  await page.waitForTimeout(120)
  const point = await canvas.evaluate(
    (el, { id, x, y }) => {
      const entry = JSON.parse(el.dataset.entryPositions)[id],
        scale = Number(el.dataset.viewScale),
        camera = Number(el.dataset.viewCamera)
      return { x: (entry.x + x - camera) * scale, y: entry.ground + y * scale }
    },
    { id, x, y },
  )
  const bounds = await canvas.boundingBox()
  assert.ok(
    bounds && point.x > 0 && point.x < bounds.width && point.y > 0 && point.y < bounds.height,
    `${id} interaction is reachable in the viewport: ${JSON.stringify(point)}`,
  )
  if (touch) await canvas.tap({ position: point })
  else await canvas.click({ position: point })
}
async function chargeWorld(page, canvas, id, x, y, ms) {
  const point = await canvas.evaluate(
    (el, { id, x, y }) => {
      const entry = JSON.parse(el.dataset.entryPositions)[id],
        scale = Number(el.dataset.viewScale)
      return {
        x: (entry.x + x - Number(el.dataset.viewCamera)) * scale,
        y: entry.ground + y * scale,
      }
    },
    { id, x, y },
  )
  const bounds = await canvas.boundingBox()
  assert.ok(
    bounds && point.x > 0 && point.x < bounds.width && point.y > 0 && point.y < bounds.height,
    'charged object is visible and reachable',
  )
  await page.mouse.move(bounds.x + point.x, bounds.y + point.y)
  await page.mouse.down()
  await page.waitForTimeout(ms)
  await page.mouse.up()
}
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
    await page
      .locator('.journey-footer')
      .getByRole('button', { name: /My first code/ })
      .click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    const openFirst = page.getByRole('button', { name: /Open the first computer/i })
    await tapWorld(page, canvas, 'first-lines', 150, -140, mobile)
    const firstCode = page.getByRole('dialog', { name: 'Explore the code' })
    await firstCode.waitFor({ state: 'visible' })
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), true)
    assert.equal(await page.locator('.portfolio-header').evaluate((element) => element.inert), true)
    assert.equal(await page.locator('.journey-footer').evaluate((element) => element.inert), true)
    await firstCode.getByRole('button', { name: 'style.css' }).click()
    await firstCode
      .getByRole('textbox', { name: 'CSS editor' })
      .fill('body { background: lavender; }')
    await page.waitForFunction(() =>
      document.querySelector('.first-code-lab iframe')?.srcdoc.includes('background: lavender'),
    )
    assert.ok(
      (await firstCode.locator('iframe').getAttribute('srcdoc')).includes("default-src 'none'"),
    )
    await page.frameLocator('iframe[title="Editable HTML preview"]').locator('body').waitFor()
    assert.equal(
      await page
        .frameLocator('iframe[title="Editable HTML preview"]')
        .locator('body')
        .evaluate((el) => getComputedStyle(el).backgroundColor),
      'rgb(230, 230, 250)',
      'inline CSS still renders inside the restricted preview',
    )
    await page.waitForTimeout(250)
    const retainedFrame = await canvas.getAttribute('data-rendered-at')
    await page.waitForTimeout(200)
    assert.equal(
      await canvas.getAttribute('data-rendered-at'),
      retainedFrame,
      'stationary dialogs retain the GPU frame',
    )
    let remotePreviewRequests = 0
    await page.route('https://preview-test.invalid/**', (route) => {
      remotePreviewRequests++
      return route.abort()
    })
    await firstCode.getByRole('button', { name: 'index.html' }).click()
    await firstCode
      .getByRole('textbox', { name: 'HTML editor' })
      .fill(
        '<h1>Sandbox check</h1><img src="https://preview-test.invalid/asset.png"><script>parent.document.body.dataset.previewEscaped="yes"</script>',
      )
    await page
      .frameLocator('iframe[title="Editable HTML preview"]')
      .getByRole('heading', { name: 'Sandbox check' })
      .waitFor()
    assert.equal(await page.locator('body').getAttribute('data-preview-escaped'), null)
    assert.equal(remotePreviewRequests, 0, 'preview may not fetch remote resources')
    await firstCode.getByRole('button', { name: 'Reset', exact: true }).click()
    await page
      .frameLocator('iframe[title="Editable HTML preview"]')
      .getByRole('heading', { name: 'RetroNet', exact: true })
      .waitFor()
    const editorLayout = await firstCode.evaluate((dialog) => {
      const preview = dialog.querySelector('.lab-workbench').getBoundingClientRect()
      const footer = dialog.querySelector('footer').getBoundingClientRect()
      return { previewBottom: preview.bottom, footerTop: footer.top }
    })
    assert.ok(
      editorLayout.footerTop >= editorLayout.previewBottom - 2,
      'code editor footer must remain below live preview instead of overlapping it',
    )
    await page.screenshot({ path: `test-results/world/${label}-first-code.png` })
    await page.evaluate(() => {
      window.__closeTrace = []
      for (const type of ['pointerdown', 'pointerup', 'click', 'focusin']) {
        document.addEventListener(
          type,
          (event) => {
            window.__closeTrace.push({
              type,
              target: event.target.outerHTML?.slice(0, 170),
              prevented: event.defaultPrevented,
              time: performance.now(),
            })
          },
          true,
        )
      }
    })
    await firstCode.getByRole('button', { name: 'Back to the journey' }).click()
    await firstCode.waitFor({ state: 'hidden' })
    await page.waitForFunction(
      () =>
        document.activeElement?.matches('.world') ||
        document.activeElement?.textContent?.includes('Open the first computer'),
    )
    assert.equal(await page.locator('.world-scene').evaluate((element) => element.inert), false)
    await openFirst.focus()
    await page.keyboard.press('Enter')
    await firstCode.getByRole('button', { name: 'style.css' }).click()
    await firstCode
      .getByRole('textbox', { name: 'CSS editor' })
      .fill('body { background: lavender; }')
    await firstCode.getByRole('button', { name: 'Back to the journey' }).click()
    await openFirst.focus()
    await page.keyboard.press('Enter')
    await firstCode.getByRole('button', { name: 'style.css' }).click()
    assert.equal(
      await firstCode.getByRole('textbox', { name: 'CSS editor' }).inputValue(),
      'body { background: lavender; }',
      'closing and reopening retains editor work',
    )
    await firstCode.getByRole('button', { name: 'Reset', exact: true }).click()
    await page.keyboard.press('Escape')
    await firstCode.waitFor({ state: 'hidden' })

    if (mobile) {
      await page.locator('.menu-toggle').click()
      await page
        .locator('.journey-footer')
        .getByRole('button', { name: /Panta Rhei/ })
        .click()
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false')
      assert.equal(
        await page.locator('.caption-travel').count(),
        0,
        'outside dismissal must not also start a journey',
      )
      assert.equal(await page.getByRole('dialog').count(), 0)
      await page.locator('.menu-toggle').click()
      await page.getByRole('button', { name: 'Skills', exact: true }).focus()
      await page.keyboard.press('Escape')
      assert.ok(
        await page.locator('.menu-toggle').evaluate((el) => document.activeElement === el),
        'Escape returns focus to the menu toggle',
      )
    }

    // The machines are part of the road, with no detached skills modal.
    if (mobile) await page.locator('.menu-toggle').click()
    await page.getByRole('button', { name: 'Skills', exact: true }).click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    for (const name of [
      'Activate Tooling',
      'Activate Web development',
      'Activate Systems & cloud',
    ]) {
      const action = page.getByRole('button', { name, exact: true })
      await action.focus()
      await action.click()
      await page.waitForTimeout(300)
    }
    await page.waitForFunction(
      () => Number(document.querySelector('canvas')?.dataset.skillCount) === 18,
    )
    assert.equal(await page.getByRole('dialog').count(), 0, 'skills remain in the world')
    await page.waitForTimeout(2700)
    await page.screenshot({ path: `test-results/world/${label}-skills-road.png` })

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
    // Real in-world circuit rotations and an executed rover program.
    await page
      .locator('.journey-footer')
      .getByRole('button', { name: /ROC Hilversum/ })
      .click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    await page.waitForTimeout(500)
    for (const [index, turns] of [
      [0, 3],
      [2, 1],
      [3, 3],
      [5, 3],
    ]) {
      for (let n = 0; n < turns; n++)
        await tapWorld(
          page,
          canvas,
          'roc-hilversum',
          100 + (index % 3) * 60,
          -145 + Math.floor(index / 3) * 47,
          mobile,
        )
    }
    await page.waitForFunction(
      () => document.querySelector('canvas')?.dataset.circuit === '[0,0,0,0,0,1]',
    )
    await page.screenshot({ path: `test-results/world/${label}-circuit-powered.png` })
    await page
      .locator('.journey-footer')
      .getByRole('button', { name: /Codam Coding College/ })
      .click()
    await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
    await page.waitForTimeout(500)
    for (const x of [87, 147, 87, 147, 87, 265])
      await tapWorld(page, canvas, 'coding-college', x, -96, mobile)
    await page.waitForFunction(
      () =>
        JSON.parse(document.querySelector('canvas')?.dataset.rover || '{}').status === 'success',
      {},
      { timeout: 8000 },
    )
    await page.screenshot({ path: `test-results/world/${label}-rover-arrived.png` })

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
    console.error(
      'DIAGNOSTICS',
      await page.evaluate(() => ({ url: location.href, trace: window.__closeTrace?.slice(-25) })),
    )
  } finally {
    await page.screenshot({ path: `test-results/world/${label}-final.png` }).catch(() => {})
    await page.close()
  }
}
async function visualAuditScenario() {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  try {
    await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 })
    const canvas = page.locator('canvas[data-renderer="pixi"]')
    await canvas.waitFor({ state: 'visible' })
    await page.waitForTimeout(700)
    await page.screenshot({ path: 'test-results/world/audit-00-entrance.png' })
    for (const [name, title] of [
      ['01-first-code', /My first code/],
      ['02-basket', /Panta Rhei/],
      ['03-circuit', /ROC Hilversum/],
      ['04-rover', /Codam Coding College/],
      ['05-skills', /The tools I build with/],
      ['06-hotel', /Fletcher Holdings/],
      ['07-airport', /Get-E/],
      ['08-office', /Appjection/],
      ['09-company', /Navel Development/],
      ['10-camp', /write the next chapter/i],
    ]) {
      const button = page.locator('.journey-footer').getByRole('button', { name: title })
      await button.click()
      await page.locator('.caption-travel').waitFor({ state: 'hidden', timeout: 20000 })
      await page.waitForTimeout(500)
      await page.screenshot({ path: `test-results/world/audit-${name}.png` })
      if (name === '02-basket') {
        await chargeWorld(page, canvas, 'panta-rhei', 65, -10, 1130)
        await page.waitForTimeout(1200)
        await page.screenshot({ path: 'test-results/world/audit-basket-through-net.png' })
        await page.waitForFunction(
          () =>
            JSON.parse(document.querySelector('canvas')?.dataset.actions || '{}')['panta-rhei']
              ?.successes === 1,
        )
      }
      if (name === '07-airport') {
        await chargeWorld(page, canvas, 'get-e', 130, -22, 1500)
        await page.waitForTimeout(2200)
        await page.screenshot({ path: 'test-results/world/audit-aircraft-airborne.png' })
      }
      if (name === '08-office') {
        await chargeWorld(page, canvas, 'appjection', 70, -30, 650)
        await page.waitForTimeout(1100)
        await page.screenshot({ path: 'test-results/world/audit-car-passing-camera.png' })
      }
    }
    console.log('PASS_visual_audit: all mobile scenes rendered for inspection')
  } catch (error) {
    failures++
    console.error('FAIL_visual_audit', error.stack || error)
    await page.screenshot({ path: 'test-results/world/audit-failure.png' }).catch(() => {})
  } finally {
    await page.close()
  }
}
async function readingModeScenario() {
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.addInitScript(() => {
      window.__entryUrl = location.href
      window.__historyTrace = []
      for (const method of ['pushState', 'replaceState']) {
        const original = history[method]
        history[method] = function (...args) {
          window.__historyTrace.push({ method, url: args[2], time: performance.now() })
          return original.apply(this, args)
        }
      }
      window.__webglContexts = 0
      const getContext = HTMLCanvasElement.prototype.getContext
      HTMLCanvasElement.prototype.getContext = function (type, ...args) {
        if (type === 'webgl' || type === 'webgl2') window.__webglContexts++
        return getContext.call(this, type, ...args)
      }
    })
    await page.goto(base + '/?view=list', { waitUntil: 'networkidle', timeout: 60000 })
    await page.locator('.timeline-list').waitFor({ state: 'visible' })
    assert.equal(
      await page.locator('canvas[data-renderer="pixi"]').count(),
      0,
      'direct reading mode must not initialize the WebGL game',
    )
    assert.equal(
      await page.evaluate(() => window.__webglContexts),
      0,
      'direct reading mode never allocates a WebGL context',
    )
    assert.ok(
      await page.getByRole('button', { name: 'World view' }).isVisible(),
      'reading mode keeps navigation back to the world',
    )
    console.log('PASS_reading_mode: direct accessible reading view without a WebGL renderer')
  } catch (error) {
    failures++
    console.error(`FAIL_reading_mode: ${error.stack || error}`)
    console.error('READING_ERRORS', errors)
    console.error(
      'READING_DIAGNOSTICS',
      await page.evaluate(() => ({
        url: location.href,
        entry: window.__entryUrl,
        history: window.__historyTrace,
        text: document.body.innerText.slice(0, 1200),
      })),
    )
    await page.screenshot({ path: 'test-results/world/reading-mode-failure.png' })
  } finally {
    await page.close()
  }
}
async function graphicsFailureScenario() {
  const errors = []
  const page = await browser.newPage({ viewport: { width: 1100, height: 700 } })
  try {
    page.on('pageerror', (error) => errors.push(error.message))
    await page.route('**/world/textures/earth.png', (route) => route.abort())
    await page.route('**/skills/docker.png', (route) => route.abort())
    await page.goto(base, { waitUntil: 'networkidle', timeout: 60000 })
    await page.locator('canvas[data-renderer="pixi"]').waitFor()
    await page.waitForFunction(() => !!document.querySelector('canvas')?.dataset.playerX)
    assert.deepEqual(errors, [], 'optional scenery failures keep a working renderer')
    const supported = await page.evaluate(() => {
      const canvas = document.querySelector('canvas[data-renderer="pixi"]')
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
      const lose = gl?.getExtension('WEBGL_lose_context')
      if (!lose) return false
      lose.loseContext()
      return true
    })
    assert.ok(supported, 'the test browser supports real WebGL context loss')
    await page
      .getByRole('button', { name: 'Read my CV', exact: true })
      .waitFor({ state: 'visible' })
    assert.equal(
      await page.locator('.world-chrome').evaluate((el) => el.inert),
      true,
      'failed world controls are inert while the reading fallback stays usable',
    )
    await page.getByRole('button', { name: 'Read my CV', exact: true }).click()
    await page.locator('.timeline-list').waitFor()
    assert.equal(await page.locator('canvas').count(), 0)
    console.log('PASS_graphics_failure: context loss releases the renderer and offers reading mode')
  } catch (error) {
    failures++
    console.error(`FAIL_graphics_failure: ${error.stack || error}`)
  } finally {
    await page.close()
  }
}
try {
  await readingModeScenario()
  await scenario('desktop', 1440, 900, false)
  await scenario('mobile', 390, 844, true)
  await scenario('compact', 375, 667, true)
  await visualAuditScenario()
  await graphicsFailureScenario()
} finally {
  await browser.close()
}
if (failures) process.exitCode = 1
