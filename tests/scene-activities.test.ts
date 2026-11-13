import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceAction,
  aircraftPose,
  basketballPose,
  cameraCarPose,
  skillTerrain,
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
test('aircraft taxis along the runway before climbing and leaving the scene', () => {
  const parked = aircraftPose(0),
    taxi = aircraftPose(1),
    flight = aircraftPose(5)
  assert.equal(parked.y, taxi.y)
  assert.ok(taxi.x > parked.x)
  assert.ok(flight.x > 800)
  assert.ok(flight.y < -200)
  assert.ok(flight.scale < taxi.scale)
})
test('basketball clears the rim and falls through the hoop before the return bounce', () => {
  assert.deepEqual(basketballPose(0), { x: -90, y: -10 })
  assert.deepEqual(basketballPose(1.1), { x: 200, y: -130 })
  assert.ok(basketballPose(0.55).y < -130)
  assert.ok(basketballPose(1.4).y > -130)
})
test('car passes the camera once and flash belongs to the capture position', () => {
  assert.ok(cameraCarPose(0).x < 0)
  assert.ok(cameraCarPose(4).x > 300)
  assert.equal(cameraCarPose(2.8).flash, true)
  assert.equal(cameraCarPose(3.3).flash, false)
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
