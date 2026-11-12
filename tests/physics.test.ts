import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stepMotion, cameraTarget, shadowSurface, type Motion } from '../app/composables/physics.ts'
const initial: Motion = { x: 200, y: 0, vx: 0, vy: 0, grounded: true }
test('motion is consistent at 30 and 120 fps', () => {
  const run = (fps: number) => { let s = { ...initial }; for(let i=0;i<fps*2;i++) s=stepMotion(s,1,false,1/fps,5000); return s }
  assert.ok(Math.abs(run(30).x-run(120).x)<5)
})
test('a jump returns to the ground and cannot retrigger in the air', () => {
  let s=stepMotion(initial,0,true,1/60,5000)
  assert.ok(s.y<0)
  const next=stepMotion(s,0,true,1/60,5000)
  assert.ok(next.vy>s.vy)
  for(let i=0;i<120;i++) s=stepMotion(s,0,false,1/60,5000)
  assert.equal(s.y,0); assert.equal(s.grounded,true)
})
test('world and camera remain bounded, including a narrow world', () => {
  assert.equal(stepMotion({...initial,x:45,vx:-265},-1,false,.05,1000).x,45)
  assert.equal(stepMotion({...initial,x:955,vx:265},1,false,.05,1000).x,955)
  assert.equal(cameraTarget(10,1200,500),0)
  assert.equal(cameraTarget(4900,1200,5000),3800)
})

const route = {
  platforms: [{ id: 'deck', x: 300, width: 240, height: 120 }],
  ladders: [{ id: 'ladder', x: 330, bottom: 0, top: 120 }],
  slides: [{ id: 'slide', x: 540, width: 240, from: 120, to: 0 }],
}
test('platforms catch falling feet but allow passage underneath', () => {
  const below = stepMotion({ ...initial, x: 400 }, 0, false, .02, 2000, route)
  assert.equal(below.y, 0)
  let falling: Motion = { ...initial, x: 400, y: -160, grounded: false }
  for (let i=0; i<60; i++) falling = stepMotion(falling, 0, false, 1/60, 2000, route)
  assert.equal(falling.y, -120); assert.equal(falling.grounded, true)
  let walking = falling
  for (let i=0; i<70; i++) walking = stepMotion(walking, -1, false, 1/60, 2000, route)
  assert.equal(walking.y, 0)
})
test('ladders climb, hold position, descend and release sideways', () => {
  let s: Motion = { ...initial, x: 330 }
  for(let i=0;i<30;i++) s=stepMotion(s,0,false,1/60,2000,route,-1)
  assert.ok(s.y < -60); assert.equal(s.mode,'climbing')
  const held=stepMotion(s,0,false,.05,2000,route,0)
  assert.equal(held.y,s.y)
  const exit=stepMotion(s,1,false,.05,2000,route,0)
  assert.equal(exit.mode,'walking'); assert.ok(exit.x>s.x)
  for(let i=0;i<60;i++) s=stepMotion(s,0,false,1/60,2000,route,-1)
  assert.equal(s.y,-120); assert.equal(s.grounded,true)
  for(let i=0;i<60;i++) s=stepMotion(s,0,false,1/60,2000,route,1)
  assert.equal(s.y,0)
})
test('slides carry the character down to the same ground plane', () => {
  let s: Motion = {...initial,x:540,y:-120}
  const first=stepMotion(s,1,false,1/60,2000,route)
  assert.equal(first.mode,'sliding'); assert.ok(first.x>s.x); assert.ok(first.y>s.y)
  s=first
  for(let i=0;i<70;i++) s=stepMotion(s,0,false,1/60,2000,route)
  assert.ok(s.x>=780); assert.equal(s.y,0)
})
test('jumping can leave a slide and a ladder', () => {
  const s=stepMotion({...initial,x:550,y:-115,mode:'sliding'},0,true,1/60,2000,route)
  assert.ok(s.vy<0); assert.equal(s.grounded,false)
  const l=stepMotion({...initial,x:330,y:-60,grounded:false,mode:'climbing'},1,true,1/60,2000,route)
  assert.ok(l.vy<0); assert.equal(l.mode,'walking')
})

test('walking follows uphill and downhill terrain without hovering or falling through', () => {
  const world = { ...route, platforms: [], ladders: [], slides: [], terrain: [{x:0,height:0},{x:300,height:0},{x:500,height:120},{x:800,height:120},{x:1000,height:20},{x:1800,height:20}] }
  let s: Motion = { ...initial, x:290 }
  for(let i=0;i<100;i++) s=stepMotion(s,1,false,1/60,2000,world)
  assert.equal(s.y,-120); assert.equal(s.grounded,true)
  for(let i=0;i<110;i++) s=stepMotion(s,1,false,1/60,2000,world)
  assert.equal(s.y,-20); assert.equal(s.grounded,true)
  s=stepMotion(s,0,true,1/60,2000,world)
  assert.ok(s.y < -20)
  for(let i=0;i<100;i++) s=stepMotion(s,0,false,1/60,2000,world)
  assert.equal(s.y,-20)
})


test('reverse input immediately cancels slide velocity and bypasses all obstacles', () => {
  let s: Motion = {...initial,x:650,y:-65,vx:340,mode:'sliding'}
  const reversed=stepMotion(s,-1,false,1/60,2000,route)
  assert.ok(reversed.x<s.x); assert.ok(reversed.vx<0)
  assert.equal(reversed.returning,true); assert.notEqual(reversed.mode,'sliding')
  s=reversed
  for(let i=0;i<150;i++) s=stepMotion(s,-1,false,1/60,2000,route)
  assert.ok(s.x<300); assert.equal(s.y,0)
  // Releasing Left cannot reactivate a slide.
  const stopped=stepMotion({...initial,x:650,y:-65,returning:true},0,false,.05,2000,route)
  assert.notEqual(stopped.mode,'sliding'); assert.ok(stopped.vx<=0)
})
test('forward input re-enables obstacles after a return journey', () => {
  const s=stepMotion({...initial,x:540,y:-120,returning:true},1,false,.02,2000,route)
  assert.equal(s.mode,'sliding'); assert.equal(s.returning,false)
})
test('jump shadow stays on its support surface instead of following the character', () => {
  assert.equal(shadowSurface({...initial,x:200,y:-70,grounded:false},route),0)
  assert.equal(shadowSurface({...initial,x:200,y:-150,grounded:false},route),0)
  assert.equal(shadowSurface({...initial,x:400,y:-180,grounded:false},route),-120)
  assert.equal(shadowSurface({...initial,x:400,y:-180,grounded:false,returning:true},route),0)
})
