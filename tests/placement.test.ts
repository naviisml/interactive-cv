import { test } from 'node:test'
import assert from 'node:assert/strict'
import { terrainPose, awayFromTerrainCorners } from '../app/game/core/terrainPlacement.ts'
test('surface props match the slope angle in either direction', () => {
  const up = terrainPose(50, 10, [
    { x: 0, height: 0 },
    { x: 100, height: 40 },
  ])
  assert.equal(up.height, 20)
  assert.ok(Math.abs(Math.tan((up.angle * Math.PI) / 180) + 0.4) < 0.0001)
  const down = terrainPose(50, 10, [
    { x: 0, height: 40 },
    { x: 100, height: 0 },
  ])
  assert.equal(down.height, 20)
  assert.ok(down.angle > 0)
})
test('rocks spanning a terrain corner are excluded from placement', () => {
  const terrain = [
    { x: 0, height: 0 },
    { x: 100, height: 20 },
    { x: 200, height: 20 },
  ]
  assert.equal(awayFromTerrainCorners(99, 12, terrain), false)
  assert.equal(awayFromTerrainCorners(150, 12, terrain), true)
  assert.equal(terrainPose(150, 10, terrain).angle, 0)
})
