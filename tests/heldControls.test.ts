import { test } from 'node:test'
import assert from 'node:assert/strict'
import { heldControls, type HeldControl } from '../app/game/core/heldControls.ts'
test('independent touch pointers retain walking when another finger is released', () => {
  const held = new Map<number, HeldControl>([
    [1, 'right'],
    [2, 'sprint'],
  ])
  assert.deepEqual(heldControls(held), { direction: 1, vertical: 0, sprint: true })
  held.delete(2)
  assert.deepEqual(heldControls(held), { direction: 1, vertical: 0, sprint: false })
  held.set(3, 'left')
  assert.equal(heldControls(held).direction, -1)
  held.delete(3)
  assert.equal(heldControls(held).direction, 1)
  held.clear()
  assert.equal(heldControls(held).direction, 0)
})
