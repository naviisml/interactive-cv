import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceAction,
  taxiPose,
  basketballPose,
  cameraCarPose,
  skillTerrain,
  skillDecks,
} from '../app/game/core/sceneActivities.ts'
import { ActivitySystem } from '../app/game/engine/ActivitySystem.ts'
import { terrainHeight, stepMotion, type Motion } from '../app/game/core/physics.ts'
test('actions complete once at different frame rates and remain replayable', () => {
  for (const fps of [10, 30, 120]) {
    let state = { action: 'departure' as const, age: 0, running: true, completed: 0 }
    for (let i = 0; i < fps * 8; i++) state = advanceAction(state, 1 / fps)
    assert.equal(state.completed, 1)
    assert.equal(state.running, false)
  }
  const system = new ActivitySystem()
  assert.ok(system.trigger('get-e', 'departure'))
  assert.equal(system.trigger('get-e', 'departure'), false)
  system.tick(10, true)
  assert.equal(system.actions['get-e']?.age, 0)
  system.tick(10, false)
  assert.equal(system.actions['get-e']?.completed, 1)
  assert.ok(system.trigger('get-e', 'departure'))
})
test('airport taxi waits for boarding, drives away and fades out', () => {
  assert.equal(taxiPose(0).x, taxiPose(2).x)
  assert.ok(taxiPose(1).passengerAlpha > taxiPose(2.2).passengerAlpha)
  assert.equal(taxiPose(2.5).passengerAlpha, 0)
  assert.ok(taxiPose(6).x > taxiPose(4).x)
  assert.ok(taxiPose(6).alpha < taxiPose(4).alpha)
  assert.equal(taxiPose(7).alpha, 0)
})
test('basketball clears the rim and falls through the hoop before the return bounce', () => {
  assert.deepEqual(basketballPose(0), { x: 14, y: -40 })
  assert.deepEqual(basketballPose(1.1), { x: 200, y: -130 })
  assert.ok(basketballPose(0.55).y < -130)
  assert.ok(basketballPose(1.4).y > -130)
})
test('car passes the camera once and flash belongs to the capture position', () => {
  assert.ok(cameraCarPose(0).x < 125)
  assert.ok(cameraCarPose(4).x > 300)
  assert.equal(cameraCarPose(0.7).flash, true)
  assert.equal(cameraCarPose(1.1).flash, false)
})
test('skill decks use actual terrain and can be crossed in either direction', () => {
  const terrain = skillTerrain(
    [
      { x: 0, height: 0 },
      { x: 3000, height: 0 },
    ],
    1500,
    0,
  )
  assert.equal(terrainHeight(1500, terrain), 66)
  for (const direction of [-1, 1]) {
    let motion: Motion = {
      x: 1500 + direction * -640,
      y: 0,
      vx: 0,
      vy: 0,
      grounded: true,
      mode: 'walking',
    }
    for (let i = 0; i < 1200; i++)
      motion = stepMotion(motion, direction, false, 1 / 120, 3000, {
        terrain,
        platforms: [],
        slides: [],
        ladders: [],
      })
    assert.ok(direction * (motion.x - 1500) > 600)
    assert.ok(motion.grounded)
  }
})

test('holding then releasing a ball or vehicle affects success instead of auto-playing', () => {
  const game = new ActivitySystem()
  assert.equal(game.beginCharge('panta-rhei'), true)
  game.tick(0.5, true)
  assert.equal(game.charges['panta-rhei']?.power, 0, 'paused world does not charge')
  assert.equal(
    game.releaseCharge('panta-rhei', 'basketball'),
    false,
    'a paused hold is cancelled rather than fired on resume',
  )
  assert.equal(game.beginCharge('panta-rhei'), true)
  game.tick(1.1, false)
  assert.equal(game.releaseCharge('panta-rhei', 'basketball'), true)
  assert.equal(game.actions['panta-rhei']?.outcome, 'success')
  assert.ok((game.actions['panta-rhei']?.power ?? 0) > 0.52)
  game.tick(5, false)
  assert.equal(game.actions['panta-rhei']?.successes, 1)

  assert.equal(game.beginCharge('get-e'), true)
  game.tick(0.2, false)
  game.releaseCharge('get-e', 'departure')
  assert.equal(game.actions['get-e']?.outcome, 'success')
  game.tick(10, false)
  assert.equal(game.actions['get-e']?.successes, 1)

  assert.equal(game.beginCharge('appjection'), true)
  game.tick(1.5, false)
  game.releaseCharge('appjection', 'camera')
  assert.equal(game.actions['appjection']?.outcome, 'ticket')
  assert.equal(cameraCarPose(2.8, 40).flash, false)
  assert.equal(cameraCarPose(0.7, 100).flash, true)
  assert.equal(cameraCarPose(2.8, 100).flash, false)
  assert.ok(cameraCarPose(2, 100).x > cameraCarPose(2, 40).x)
})

test('every workbench post stands on its flat physics deck, including the outer feet', () => {
  const terrain = skillTerrain(
    [
      { x: 0, height: 0 },
      { x: 3000, height: 0 },
    ],
    1500,
    0,
  )
  for (const deck of skillDecks)
    for (const foot of [-147, 150]) {
      assert.equal(
        terrainHeight(1500 + deck.center + foot, terrain),
        deck.height,
        `${deck.id}: foot ${foot} must not float above a ramp`,
      )
    }
})

test('automatic pickup and ticket sequences run once, then allow manual replay', () => {
  for (const [id, action] of [
    ['get-e', 'departure'],
    ['appjection', 'camera'],
  ] as const) {
    const game = new ActivitySystem()
    assert.equal(game.autoPlayOnce(id, action), true)
    assert.equal(game.autoPlayOnce(id, action), false)
    game.tick(10, true)
    assert.equal(game.actions[id]?.age, 0)
    game.tick(10, false)
    assert.equal(game.actions[id]?.completed, 1)
    assert.equal(game.actions[id]?.outcome, id === 'appjection' ? 'ticket' : 'success')
    assert.equal(game.autoPlayOnce(id, action), false)
    assert.equal(game.trigger(id, action, 0.7), true)
  }
})
test('aiming changes the shot arc without charging over time', () => {
  const game = new ActivitySystem()
  game.beginCharge('court', 'arc')
  game.tick(1.5, false)
  assert.equal(game.charges.court?.power, 0.65)
  const low = basketballPose(0.55, 0.2),
    high = basketballPose(0.55, 0.9)
  assert.ok(high.y < low.y - 40)
  game.charges.court!.power = 0.7
  game.releaseCharge('court', 'basketball')
  assert.equal(game.actions.court?.power, 0.7)
})
