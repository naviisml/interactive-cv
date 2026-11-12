import {test} from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import {renderWindow,parallaxTiles,parallaxOffset} from '../app/composables/worldProjection.ts'
import {storyParagraphs,type TimelineEvent} from '../app/data/timeline.ts'

test('render bounds remain local even at the far end of a long journey',()=>{
 for(const viewport of [400,1000,1600])for(const camera of [0,7000,17000]){
  const window=renderWindow(camera,viewport,19000)
  assert.ok(window.width<=viewport+720)
  assert.ok(window.start>=0&&window.end<=19000)
  assert.ok(window.start<=camera&&window.end>=Math.min(19000,camera+viewport))
  const tiles=parallaxTiles(viewport)
  assert.ok(tiles.width<=viewport+2400)
  for(const speed of [.06,.13,.28,.5]){const offset=parallaxOffset(camera,speed);assert.ok(offset<=0&&offset>-1200);assert.ok(tiles.width+offset>=viewport)}
 }
})
test('artwork defaults to unfilled outlines so an open path cannot create accidental surfaces',()=>{
 for(const file of ['SkillsWorldScene.vue','StoryWorldScene.vue']){
  const source=fs.readFileSync(new URL(`../app/components/${file}`,import.meta.url),'utf8')
  assert.match(source,/<svg[^>]+fill="none"/)
  for(const path of source.matchAll(/<path\b[^>]*>/g))assert.ok(!/\bfill="(?!none)[^"]+"/.test(path[0]))
 }
})
test('detail copy omits repeated summary paragraphs',()=>{
 const event={summary:'Laravel and Vue.',body:['Laravel and Vue.','Additional detail.','Additional detail.']} as TimelineEvent
 assert.deepEqual(storyParagraphs(event),['Additional detail.'])
})
