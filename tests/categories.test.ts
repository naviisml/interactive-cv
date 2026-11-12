import{test}from'node:test'
import assert from'node:assert/strict'
import{timeline,filteredIndexes}from'../app/data/timeline.ts'
import{createWorld}from'../app/data/world.ts'
test('Work, Projects and School are disjoint chronological routes with no missing chapters',()=>{
 const routes=['work','projects','school'].map(filter=>filteredIndexes(filter as 'work'|'projects'|'school'))
 const combined=routes.flat()
 assert.equal(new Set(combined).size,timeline.length)
 assert.equal(combined.length,timeline.length)
 for(const route of routes){assert.ok(route.length>0);assert.deepEqual(route,[...route].sort((a,b)=>a-b))}
 assert.equal(timeline.find(event=>event.id==='fletcher')?.category,'work')
 assert.equal(timeline.find(event=>event.id==='gmodstore')?.category,'projects')
 assert.equal(timeline.find(event=>event.id==='coding-college')?.category,'school')
 assert.ok(createWorld(routes[2]!.length).width<createWorld(timeline.length).width)
})
