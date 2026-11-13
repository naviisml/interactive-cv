import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  advanceVisit,
  actorEntry,
  doorOpenness,
  type BuildingVisit,
} from '../app/game/core/buildingVisit.ts'
test('door opens before the actor enters, stays open inside, then closes after returning', () => {
  let state: BuildingVisit = { index: 5, phase: 'opening', progress: 0 }
  state = advanceVisit(state, 0.175)
  assert.equal(doorOpenness(state), 0.5)
  assert.equal(actorEntry(state), 0)
  state = advanceVisit(state, 0.175)
  assert.equal(state.phase, 'entering')
  state = advanceVisit(state, 0.35)
  assert.equal(actorEntry(state), 0.5)
  assert.equal(doorOpenness(state), 1)
  state = advanceVisit(state, 0.35)
  assert.equal(state.phase, 'inside')
  assert.equal(actorEntry(state), 1)
  state = { ...state, phase: 'leaving', progress: 0 }
  state = advanceVisit(state, 0.35)
  assert.equal(actorEntry(state), 0.5)
  state = advanceVisit(state, 0.35)
  assert.equal(state.phase, 'closing')
  assert.equal(actorEntry(state), 0)
  state = advanceVisit(state, 0.35)
  assert.equal(state.phase, 'outside')
  assert.equal(state.index, null)
  assert.equal(doorOpenness(state), 0)
})
test('waiting or browsing inside never silently advances or traps the player', () => {
  for (const phase of ['outside', 'approaching', 'inside'] as const) {
    const state = { index: 2, phase, progress: 0 }
    assert.deepEqual(advanceVisit(state, 100), state)
  }
})
