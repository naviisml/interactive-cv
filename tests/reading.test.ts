import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readingProgress } from '../app/game/core/readingProgress.ts'
test('scroll progress follows the reading position in both directions', () => {
  assert.deepEqual(readingProgress([300, 800, 1300], 270, false), { active: 0, progress: 0 })
  assert.deepEqual(readingProgress([-230, 270, 770], 270, false), { active: 1, progress: 50 })
  assert.deepEqual(readingProgress([-480, 20, 520], 270, false), { active: 1, progress: 75 })
  assert.deepEqual(readingProgress([20, 520, 1020], 270, false), { active: 0, progress: 25 })
})
test('the bottom of the document completes the final chapter', () => {
  assert.deepEqual(readingProgress([-400, 100, 600], 270, true), { active: 2, progress: 100 })
  assert.deepEqual(readingProgress([], 270, false), { active: 0, progress: 0 })
})
