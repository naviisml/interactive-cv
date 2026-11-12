import{test}from'node:test'
import assert from'node:assert/strict'
import{advanceDestination,navigationDuration,type JourneyDestination}from'../app/composables/navigation.ts'
const geometry={terrain:[{x:0,height:0},{x:1000,height:100},{x:2000,height:100}],platforms:[],ladders:[],slides:[]}
test('timeline navigation travels through intermediate positions and arrives exactly',()=>{
 const nav:JourneyDestination={index:1,fromX:100,fromY:-10,toX:1800,elapsed:0,duration:navigationDuration(1700)}
 let previous=100,done=false
 for(let i=0;i<400;i++){
  const next=advanceDestination(nav,1/60,geometry)
  assert.ok(next.motion.x>=previous);assert.ok(next.motion.x-previous<50)
  previous=next.motion.x
  if(next.done){done=true;assert.equal(next.motion.x,1800);assert.equal(next.motion.y,-100);break}
 }
 assert.equal(done,true)
})
test('running backward remains continuous and bypasses obstacles',()=>{
 const nav:JourneyDestination={index:0,fromX:1800,fromY:-100,toX:100,elapsed:0,duration:navigationDuration(1700)}
 const next=advanceDestination(nav,1/60,geometry)
 assert.ok(next.motion.x<1800&&next.motion.x>100)
 assert.equal(next.motion.returning,true)
})
