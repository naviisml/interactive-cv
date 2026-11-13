import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import sharp from 'sharp'
import { renderWindow, parallaxTiles, parallaxOffset } from '../app/game/core/worldProjection.ts'
import { storyParagraphs, type TimelineEvent } from '../app/content/timeline.ts'

test('render bounds remain local even at the far end of a long journey', () => {
  for (const viewport of [400, 1000, 1600])
    for (const camera of [0, 7000, 17000]) {
      const window = renderWindow(camera, viewport, 19000)
      assert.ok(window.width <= viewport + 720)
      assert.ok(window.start >= 0 && window.end <= 19000)
      assert.ok(window.start <= camera && window.end >= Math.min(19000, camera + viewport))
      const tiles = parallaxTiles(viewport)
      assert.ok(tiles.width <= viewport + 2400)
      for (const speed of [0.06, 0.13, 0.28, 0.5]) {
        const offset = parallaxOffset(camera, speed)
        assert.ok(offset <= 0 && offset > -1200)
        assert.ok(tiles.width + offset >= viewport)
      }
    }
})
test('exported scene sprites have explicit bounds and no external resources', () => {
  const directory = new URL('../public/world/scenes/', import.meta.url)
  for (const file of fs.readdirSync(directory)) {
    const source = fs.readFileSync(new URL(file, directory), 'utf8')
    assert.match(source, /<svg[^>]+width="600"[^>]+height="310"/)
    assert.ok(!source.includes('figma.com'))
  }
})
test('detail copy omits repeated summary paragraphs', () => {
  const event = {
    summary: 'Laravel and Vue.',
    body: ['Laravel and Vue.', 'Additional detail.', 'Additional detail.'],
  } as TimelineEvent
  assert.deepEqual(storyParagraphs(event), ['Additional detail.'])
})

test('every exported scene decodes as a real image texture', async () => {
  const directory = new URL('../public/world/scenes/', import.meta.url)
  for (const file of fs.readdirSync(directory)) {
    const decoded = await sharp(fs.readFileSync(new URL(file, directory)))
      .png()
      .toBuffer({ resolveWithObject: true })
    assert.equal(decoded.info.width, 600, file)
    assert.equal(decoded.info.height, 310, file)
    assert.ok(decoded.data.length > 200, file)
  }
})
