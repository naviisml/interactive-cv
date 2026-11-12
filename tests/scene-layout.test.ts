import {test} from 'node:test'
import assert from 'node:assert/strict'
import {sceneLayout,schoolLayout,circuitLayout,circuitPorts,circuitPort,circuitCell,circuitInput,circuitOutput,circuitWire,circuitBattery,circuitLamp,circuitInputLead,circuitOutputLead} from '../app/data/sceneLayout.ts'
import {worldProjection} from '../app/composables/worldProjection.ts'
import {traceCircuit} from '../app/composables/worldActivities.ts'

test('solved circuit geometry reaches both terminals and every neighbouring tile exactly',()=>{
 const turns=[2,1,2,0,3,0],trace=traceCircuit(turns)
 assert.ok(trace.complete)
 let incoming=3,previous=circuitInput
 for(const index of trace.lit){
  assert.deepEqual(circuitPort(index,incoming),previous)
  const outgoing=circuitPorts(turns[index]!).find(direction=>direction!==incoming)!
  const endpoint=circuitPort(index,outgoing)
  assert.ok(circuitWire(index,turns[index]!).includes(`${endpoint.x} ${endpoint.y}`))
  previous=endpoint;incoming=(outgoing+2)%4
 }
 assert.deepEqual(previous,circuitOutput)
 assert.equal(circuitInputLead,`M${circuitBattery.x} ${circuitBattery.y}H${circuitInput.x}`)
 assert.equal(circuitOutputLead,`M${circuitOutput.x} ${circuitOutput.y}H${circuitLamp.x}V${circuitLamp.y}`)
 assert.equal(circuitOutput.x,circuitLayout.x+circuitLayout.columns*circuitLayout.cell)
 assert.equal(circuitOutput.y,circuitCell(5).y+circuitLayout.cell/2)
})
test('essential scene information stays above the actor on the walking lane',()=>{
 const head=sceneLayout.height-sceneLayout.actorHeight
 assert.ok(schoolLayout.scoreboard.y+schoolLayout.scoreboard.height<head)
 assert.ok(schoolLayout.codeScreen.y+schoolLayout.codeScreen.height<head)
 assert.ok(circuitLayout.y+circuitLayout.rows*circuitLayout.cell<head)
})
test('portrait viewport projection retains usable touch targets and scene clearance',()=>{
 for(const width of [320,375,390,428,768,1200])for(const height of [400,440,480,560,700]){
  const view=worldProjection(width,height)
  assert.ok(circuitLayout.cell*view.scale>=44)
  assert.ok(56*view.scale>=44)
  assert.equal(view.viewport*view.scale,width)
  const sceneTop=height-view.groundInset-30*view.scale-sceneLayout.height*view.scale
  const boardTop=sceneTop+(circuitLayout.y-18)*view.scale
  assert.ok(boardTop>=110,`caption collision at ${width} × ${height}`)
 }
})
