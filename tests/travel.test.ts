import { test } from 'node:test'
import assert from 'node:assert/strict'
import { addSwipeDistance, consumeSwipeDistance, SWIPE_BUFFER } from '../app/composables/swipeTravel.ts'
import { stepMotion, motionConfig, type Motion } from '../app/composables/physics.ts'
test('fast swipes cannot teleport or build a long movement backlog',()=>{
  let budget=0
  let motion:Motion={x:200,y:0,vx:0,vy:0,grounded:true}
  for(let i=0;i<60;i++) {
    budget=addSwipeDistance(budget,1500)
    assert.ok(budget<=SWIPE_BUFFER)
    const previous=motion.x
    motion=stepMotion(motion,Math.sign(budget)*.85,false,1/60,5000)
    assert.ok(motion.x-previous<=motionConfig.speed*.85/60+.001)
    budget=consumeSwipeDistance(budget,motion.x-previous)
  }
  assert.ok(motion.x-200<=motionConfig.speed*.85)
})
test('swipe direction changes discard the previous queued direction',()=>{
  assert.equal(addSwipeDistance(72,-12),-12)
  assert.equal(addSwipeDistance(-72,12),12)
  assert.equal(consumeSwipeDistance(4,12),0)
  assert.equal(consumeSwipeDistance(-4,-12),0)
})
