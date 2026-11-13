import { test } from 'node:test'
import assert from 'node:assert/strict'
import { frameSteps } from '../app/game/core/frameTiming.ts'
import { stepMotion, type Motion } from '../app/game/core/physics.ts'
test('ordinary 10 fps frames retain all elapsed time in safe substeps', () => {
  assert.deepEqual(frameSteps(0.1), [0.05, 0.05])
  assert.ok(frameSteps(0.15).every((dt) => dt <= 0.05))
  assert.ok(Math.abs(frameSteps(0.15).reduce((a, b) => a + b, 0) - 0.15) < 1e-9)
  assert.equal(
    frameSteps(3).reduce((a, b) => a + b, 0),
    0.2,
  )
  assert.deepEqual(frameSteps(-1), [])
})
test('holding walk at 10 fps covers the same distance as at 60 fps', () => {
  function run(fps: number) {
    let state: Motion = { x: 100, y: 0, vx: 0, vy: 0, grounded: true, mode: 'walking' }
    for (let frame = 0; frame < fps * 3; frame++)
      for (const dt of frameSteps(1 / fps)) state = stepMotion(state, 1, false, dt, 10000)
    return state.x
  }
  assert.ok(Math.abs(run(10) - run(60)) < 5)
})
