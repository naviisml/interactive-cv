import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Container } from 'pixi.js'
import { holdTarget, tapTarget } from '../app/game/rendering/interactions.ts'
import { ActivitySystem } from '../app/game/engine/ActivitySystem.ts'

const pointer = (pointerId: number, x = 0, y = 0) => ({
  pointerId,
  global: { x, y },
  nativeEvent: { stopPropagation() {} },
  stopPropagation() {},
})
test('another finger releasing a movement button cannot release the ball', () => {
  const state = new ActivitySystem(),
    node = new Container()
  holdTarget(
    node,
    () => state.beginCharge('court'),
    () => state.releaseCharge('court', 'basketball'),
    undefined,
    () => state.cancelCharge('court'),
  )
  node.emit('pointerdown', pointer(1))
  state.tick(1, false)
  node.emit('pointerupoutside', pointer(2))
  assert.equal(state.charging, true)
  assert.equal(state.actions.court, undefined)
  node.emit('pointerup', pointer(1))
  assert.equal(state.charging, false)
  assert.equal(state.actions.court?.running, true)
  node.destroy()
})
test('Safari cancellation, pause and scene disposal cancel a hold without firing it', () => {
  const state = new ActivitySystem(),
    node = new Container()
  holdTarget(
    node,
    () => state.beginCharge('court'),
    () => state.releaseCharge('court', 'basketball'),
    undefined,
    () => state.cancelCharge('court'),
  )
  node.emit('pointerdown', pointer(1))
  state.tick(0.8, false)
  node.emit('pointercancel', pointer(1))
  assert.equal(state.charging, false)
  assert.equal(state.actions.court, undefined)
  node.emit('pointerdown', pointer(2))
  state.tick(0.5, false)
  state.tick(0, true)
  assert.equal(state.charging, false)
  node.emit('pointerdown', pointer(3))
  assert.equal(
    state.charging,
    true,
    'a fresh hold works after interruption without the original pointerup',
  )
  node.destroy()
  assert.equal(state.charging, false)
  assert.equal(state.actions.court, undefined)
})
test('tap ownership ignores a second finger and a world swipe does not activate an object', () => {
  const node = new Container()
  let taps = 0
  tapTarget(node, () => taps++)
  node.emit('pointerdown', pointer(1))
  node.emit('pointerup', pointer(2))
  assert.equal(taps, 0)
  node.emit('pointerup', pointer(1))
  assert.equal(taps, 1)
  node.emit('pointerdown', pointer(3))
  node.emit('pointerup', pointer(3, 50))
  assert.equal(taps, 1)
  node.destroy()
})
