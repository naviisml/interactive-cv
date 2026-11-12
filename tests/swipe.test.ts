import { test } from 'node:test'
import assert from 'node:assert/strict'
import { lockSwipeAxis } from '../app/composables/swipeDirection.ts'
test('horizontal swipes stay horizontal when the finger later drifts vertically', () => {
  const axis=lockSwipeAxis('pending',-12,3)
  assert.equal(axis,'horizontal')
  assert.equal(lockSwipeAxis(axis,-14,80),'horizontal')
  assert.equal(lockSwipeAxis(axis,40,-140),'horizontal')
})
test('vertical starts remain native page gestures even if they drift sideways', () => {
  const axis=lockSwipeAxis('pending',2,12)
  assert.equal(axis,'vertical')
  assert.equal(lockSwipeAxis(axis,90,15),'vertical')
})
test('tiny tap jitter is not a swipe and both horizontal directions are supported', () => {
  assert.equal(lockSwipeAxis('pending',1,2),'pending')
  assert.equal(lockSwipeAxis('pending',-8,-2),'horizontal')
  assert.equal(lockSwipeAxis('pending',8,2),'horizontal')
})
