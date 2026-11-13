import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  newFootball,
  kickFootball,
  stepFootball,
  traceCircuit,
  stepCode,
  portalPlatforms,
} from '../app/game/core/worldActivities.ts'
import { stepMotion, type Motion } from '../app/game/core/physics.ts'

test('a kicked football flies, bounces and scores inside the net, then settles', () => {
  let ball = kickFootball(newFootball()),
    airborne = false
  for (let i = 0; i < 1200 && !ball.settled; i++) {
    ball = stepFootball(ball, 1 / 120)
    if (ball.y < 290) airborne = true
  }
  assert.ok(airborne)
  assert.ok(ball.scored)
  assert.ok(ball.settled)
  assert.ok(ball.x >= 426 && ball.x <= 463)
  assert.equal(ball.y, 299)
  assert.deepEqual(kickFootball(ball), ball)
})
test('football playback is consistent at 30 and 120 fps', () => {
  const play = (fps: number) => {
    let ball = kickFootball(newFootball())
    for (let i = 0; i < fps * 2; i++) ball = stepFootball(ball, 1 / fps)
    return ball
  }
  const slow = play(30),
    fast = play(120)
  assert.equal(slow.scored, fast.scored)
  assert.ok(Math.abs(slow.x - fast.x) < 0.5)
  assert.ok(Math.abs(slow.y - fast.y) < 0.5)
})
test('six rotated wires must form a continuous reciprocal circuit to light the lamp', () => {
  assert.deepEqual(traceCircuit([2, 1, 2, 0, 3, 0]), { lit: [0, 3, 4, 1, 2, 5], complete: true })
  assert.equal(traceCircuit([3, 0, 1, 2, 1, 3]).complete, false)
  for (let i = 0; i < 6; i++) {
    const turns = [2, 1, 2, 0, 3, 0]
    turns[i] = (turns[i]! + 1) % 4
    assert.equal(traceCircuit(turns).complete, false)
  }
})
test('code stones require the return visit, wrong commands reset, success stays complete', () => {
  let progress = 0
  for (const token of ['{', ';', '{', '}']) progress = stepCode(progress, token)
  assert.equal(progress, 4)
  assert.equal(stepCode(4, ';'), 4)
  assert.equal(stepCode(2, '}'), 0)
  assert.equal(stepCode(1, '{'), 1)
})
test('the unlocked portal steps are real collision surfaces at the drawn heights', () => {
  const platforms = portalPlatforms(2000, 100)
  for (const platform of platforms) {
    let motion: Motion = {
      x: platform.x + platform.width / 2,
      y: -platform.height - 12,
      vx: 0,
      vy: 50,
      grounded: false,
      mode: 'walking',
    }
    const world = {
      terrain: [
        { x: 0, height: 100 },
        { x: 4000, height: 100 },
      ],
      platforms,
      ladders: [],
      slides: [],
    }
    for (let i = 0; i < 60 && !motion.grounded; i++)
      motion = stepMotion(motion, 0, false, 1 / 120, 4000, world)
    assert.ok(motion.grounded)
    assert.equal(motion.y, -platform.height)
  }
})
