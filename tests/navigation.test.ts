import {test} from 'node:test'
import assert from 'node:assert/strict'
import {advanceDestination,navigationDuration} from '../app/composables/navigation.ts'
import {terrainHeight} from '../app/composables/physics.ts'
const world={terrain:[{x:0,height:0},{x:500,height:90},{x:1500,height:30}],platforms:[],ladders:[],slides:[]}
for(const [fromX,toX] of [[100,1400],[1400,100]])test(`destination travel is continuous from ${fromX} to ${toX}`,()=>{
 const nav={index:0,fromX,fromY:-terrainHeight(fromX,world.terrain),toX,elapsed:0,duration:navigationDuration(toX-fromX)}
 let previous=fromX,done=false
 for(let n=0;n<10000&&!done;n++){
  const next=advanceDestination(nav,1/60,world)
  assert.ok(Math.abs(next.motion.x-previous)<16)
  assert.ok((next.motion.x-previous)*Math.sign(toX-fromX)>=0)
  if(nav.elapsed>.25)assert.ok(Math.abs(next.motion.y+terrainHeight(next.motion.x,world.terrain))<.001)
  previous=next.motion.x;done=next.done
 }
 assert.ok(done);assert.equal(previous,toX)
})
test('long journeys retain a bounded running speed instead of accelerating with distance',()=>{
 assert.ok(navigationDuration(15000)>20)
 assert.equal(navigationDuration(1200),1200/360)
})

test('long runs reach a steady pace after the brief start ramp',()=>{
 const nav={index:0,fromX:100,fromY:0,toX:15100,elapsed:0,duration:navigationDuration(15000)}
 for(let n=0;n<30;n++)advanceDestination(nav,1/60,world)
 const early=advanceDestination(nav,1/60,world).motion.vx
 assert.ok(early>350&&early<400)
 for(let n=0;n<300;n++)advanceDestination(nav,1/60,world)
 assert.equal(advanceDestination(nav,1/60,world).motion.vx,early)
})
