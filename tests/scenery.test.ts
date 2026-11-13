import {test} from 'node:test'
import assert from 'node:assert/strict'
import {sceneryTransition,smoothRange} from '../app/composables/sceneryTransition.ts'
const stops=[{x:0,urban:0,technical:0},{x:920,urban:0,technical:1},{x:1840,urban:1,technical:0},{x:2760,urban:1,technical:0},{x:3680,urban:0,technical:0}]
test('era transitions are continuous at chapter midpoints and stable at stops',()=>{
 assert.deepEqual(sceneryTransition(920,stops),{urban:0,technical:1})
 assert.deepEqual(sceneryTransition(2760,stops),{urban:1,technical:0})
 assert.deepEqual(sceneryTransition(-50,stops),{urban:0,technical:0})
 assert.deepEqual(sceneryTransition(4000,stops),{urban:0,technical:0})
 const before=sceneryTransition(1379.99,stops),after=sceneryTransition(1380.01,stops)
 assert.ok(Math.abs(after.urban-before.urban)<.0001)
})
test('backtracking retraces scenery and the trees clear before the skyline finishes rising',()=>{
 const forward=Array.from({length:21},(_,n)=>sceneryTransition(920+n*46,stops))
 const reverse=Array.from({length:21},(_,n)=>sceneryTransition(1840-n*46,stops)).reverse()
 assert.deepEqual(forward,reverse)
 assert.equal(smoothRange(.6,.04,.54),1)
 assert.ok(smoothRange(.6,.32,.82)<1)
 assert.equal(smoothRange(0,.32,.82),0)
})
