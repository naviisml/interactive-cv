import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import sharp from 'sharp'
import {
  spriteFrame,
  characterClips,
  SPRITE_WIDTH,
  SPRITE_HEIGHT,
  SPRITE_FRAMES,
  type CharacterAction,
} from '../app/game/core/characterSprite.ts'
test('each animation selects its own frames inside the shipped atlas', async () => {
  const metadata = await sharp('public/sprites/navi.png').metadata()
  assert.equal(metadata.width, SPRITE_WIDTH * SPRITE_FRAMES)
  assert.equal(metadata.height, SPRITE_HEIGHT)
  const sets = new Set<number>()
  for (const [action, clip] of Object.entries(characterClips) as [
    CharacterAction,
    { frames: number },
  ][]) {
    const length = clip.frames
    for (let i = 0; i < length; i++) {
      const frame = spriteFrame(action, i)
      assert.ok(frame >= 0 && frame < SPRITE_FRAMES)
      assert.ok(!sets.has(frame))
      sets.add(frame)
    }
    assert.equal(spriteFrame(action, 0), spriteFrame(action, length))
  }
  assert.equal(sets.size, SPRITE_FRAMES)
})
test('all grounded gait frames have visible feet on the same baseline', async () => {
  const { data, info } = await sharp(fs.readFileSync('public/sprites/navi.png'))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  for (const action of ['idle', 'walk'] as CharacterAction[])
    for (let phase = 0; phase < 12; phase++) {
      const offset = spriteFrame(action, phase) * SPRITE_WIDTH
      let bottom = -1
      for (let y = 0; y < SPRITE_HEIGHT; y++)
        for (let x = 0; x < SPRITE_WIDTH; x++)
          if (data[(y * info.width + x + offset) * 4 + 3]) bottom = y
      assert.equal(bottom, 95, `${action} ${phase} feet baseline`)
    }
})

test('running includes flight poses instead of pinning both feet to the ground', async () => {
  const { data, info } = await sharp('public/sprites/navi.png')
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  let flight = 0
  for (let phase = 0; phase < 12; phase++) {
    const offset = spriteFrame('run', phase) * SPRITE_WIDTH
    let grounded = false
    for (let x = 0; x < SPRITE_WIDTH; x++)
      if (data[(95 * info.width + x + offset) * 4 + 3]) grounded = true
    if (!grounded) flight++
  }
  assert.ok(flight >= 2)
})
