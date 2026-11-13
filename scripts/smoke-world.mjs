import assert from 'node:assert/strict'
import { chromium } from 'playwright'
import sharp from 'sharp'

const base = process.env.SMOKE_URL || 'http://127.0.0.1:3000'
const browser = await chromium.launch({channel: 'chrome', headless: true, args: ['--no-sandbox']})
let failures = 0

async function capture(page, label) {
  if (process.env.VISUAL_LOG !== '1') return
  const image = await page.screenshot({type: 'jpeg', quality: 60, animations: 'disabled'})
  const small = await sharp(image).resize({width: 760, withoutEnlargement: true}).jpeg({quality: 45}).toBuffer()
  console.log(`SCREENSHOT_${label}=${small.toString('base64')}`)
}
async function scenario(label, width, height, mobile) {
  const page = await browser.newPage({ viewport: {width, height}, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', e => errors.push(e.message))
  try {
    await page.goto(base, {waitUntil: 'networkidle', timeout: 60000})
    await page.locator('.world').waitFor({state:'visible',timeout:15000})
    await page.waitForTimeout(450)
    const header = await page.locator('.portfolio-header').boundingBox()
    const stage = await page.locator('.world').boundingBox()
    const footer = await page.locator('.journey-footer').boundingBox()
    assert.ok(header && stage && footer, 'all three layout regions exist')
    assert.ok(stage.height >= (height < 550 ? 120 : 220), `world must have usable height (actual ${stage.height}px)`)
    assert.ok(Math.abs((header.y+header.height)-stage.y) <= 2, 'world must begin immediately below the header')
    assert.ok(Math.abs((stage.y+stage.height)-footer.y) <= 2, 'footer must follow the world')
    assert.ok(footer.y+footer.height <= height+3, 'footer must remain within the viewport')
    assert.ok(await page.locator('.player').isVisible(), 'character must render')
    console.log(`LAYOUT_${label}=${JSON.stringify({header:header.height,stage:stage.height,footer:footer.height})}`)
    await capture(page, label)

    if (!mobile) {
      const before = Number.parseFloat(await page.locator('.player').evaluate(el => el.style.left))
      await page.keyboard.down('ArrowRight')
      await page.waitForTimeout(650)
      await page.keyboard.up('ArrowRight')
      const after = Number.parseFloat(await page.locator('.player').evaluate(el => el.style.left))
      assert.ok(after > before + 25, `keyboard walking should move actor (before ${before}, after ${after})`)
      await page.locator('.portfolio-menu').getByRole('button',{name:'Skills',exact:true}).click()
      await page.locator('.caption-travel').waitFor({state:'visible',timeout:5000})
      await page.locator('.caption-travel').getByRole('button',{name:'Cancel'}).click()
      console.log('INTERACTION_DESKTOP=keyboard walking, navigation and cancellation passed')
    } else {
      const toggle = page.locator('.menu-toggle')
      await toggle.click()
      assert.equal(await toggle.getAttribute('aria-expanded'),'true')
      await capture(page, `${label}_menu`)
      await page.locator('.portfolio-menu').getByRole('button',{name:'Skills',exact:true}).click()
      assert.equal(await toggle.getAttribute('aria-expanded'),'false')
      await toggle.click()
      await page.locator('.view-toggle').click()
      assert.ok(await page.locator('.timeline-list').isVisible(), 'reading mode should open')
      const stickyHeader = await page.locator('.portfolio-header').boundingBox()
      const stickyFilters = await page.locator('.journey-filters').boundingBox()
      assert.ok(stickyHeader && Math.abs(stickyHeader.y) <= 2, 'header must remain sticky after scrolling to a list entry')
      assert.ok(stickyFilters && stickyFilters.y >= stickyHeader.height-2, 'category filters must stay below the header')
      await capture(page, `${label}_list`)
      await page.locator('.menu-toggle').click()
      await page.locator('.view-toggle').click()
      assert.ok(await page.locator('.world').isVisible(), 'world should reopen')
      console.log(`INTERACTION_${label}=menu, level navigation, list and world view passed`)
    }
    assert.deepEqual(errors, [], `no uncaught browser errors: ${errors.join(', ')}`)
    console.log(`PASS_${label}`)
  } catch(error) {
    failures++
    console.error(`FAIL_${label}: ${error.stack || error}`)
  } finally {
    await page.close()
  }
}
try {
 await scenario('desktop',1440,900,false)
 await scenario('mobile',390,844,true)
 await scenario('compact',375,667,true)
} finally {
 await browser.close()
}
if (failures) process.exitCode=1
