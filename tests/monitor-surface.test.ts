import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  approachSurface,
  surfaceDistance,
  projectScreen,
  firstCodeScreen,
} from '../app/game/core/monitorSurface.ts'
import { canEnterBuilding } from '../app/content/buildings.ts'
import { cuesForScene } from '../app/game/core/worldCues.ts'
import { cameraCarPose } from '../app/game/core/sceneActivities.ts'

test('monitor expands from its world screen and returns to precisely the same bezel', () => {
  const expanded = { x: -500, y: -700, width: 1000, height: 550 }
  for (const initial of [projectScreen, firstCodeScreen]) {
    for (const fps of [10, 30, 120]) {
      let area = { ...initial }
      area = approachSurface(area, expanded, 1 / fps)
      assert.ok(area.width > initial.width && area.width < expanded.width)
      for (let i = 0; i < fps * 3; i++) area = approachSurface(area, expanded, 1 / fps)
      assert.equal(surfaceDistance(area, expanded), 0)
      for (let i = 0; i < fps * 3; i++) area = approachSurface(area, initial, 1 / fps)
      assert.deepEqual(area, initial)
    }
  }
  assert.deepEqual(approachSurface(firstCodeScreen, expanded, 0.016, true), expanded)
})
test('schools have activities and facade information, without entry interactions', () => {
  for (const id of ['panta-rhei', 'roc-hilversum', 'coding-college']) {
    assert.equal(canEnterBuilding(id), false)
    assert.ok(cuesForScene(id).every((cue) => cue.action !== 'enter'))
  }
  assert.ok(canEnterBuilding('appjection'))
})
test('the parked car and its hold target clear the office doorway', () => {
  const car = cameraCarPose(0)
  assert.ok(car.x - 86 > 43)
  assert.equal(cuesForScene('appjection').find((cue) => cue.key === 'car')?.x, car.x)
})
