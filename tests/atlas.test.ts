import {test}from'node:test'
import assert from'node:assert/strict'
import fs from'node:fs'
import zlib from'node:zlib'
import{atlasPosition,spriteRows,type SpriteAction}from'../app/composables/characterAtlas.ts'
test('each character action selects only its own sprite row and valid frames',()=>{
 for(const action of Object.keys(spriteRows) as SpriteAction[])for(let phase=0;phase<32;phase++){
  const cell=atlasPosition(action,phase)
  assert.equal(cell.row,spriteRows[action]);assert.ok(cell.column>=0&&cell.column<8)
  assert.equal(atlasPosition(action,phase,true).column,0)
 }
})
test('walk/run frames are distinct full images with a planted foot at the same baseline',()=>{
 const png=fs.readFileSync(new URL('../public/sprites/navi.png',import.meta.url))
 const width=png.readUInt32BE(16),height=png.readUInt32BE(20)
 assert.equal(width,256);assert.equal(height,448)
 const chunks:Buffer[]=[]
 for(let pos=8;pos<png.length;){const length=png.readUInt32BE(pos);if(png.toString('ascii',pos+4,pos+8)==='IDAT')chunks.push(png.subarray(pos+8,pos+8+length));pos+=length+12}
 const raw=zlib.inflateSync(Buffer.concat(chunks)),stride=width*4+1
 for(const row of [1,2])for(let frame=0;frame<8;frame++){
  const y=row*64+63
  const pixels=Array.from({length:32},(_,x)=>raw[y*stride+1+(frame*32+x)*4+3]!)
  assert.ok(pixels.some(alpha=>alpha>0),`ground contact missing: row ${row} frame ${frame}`)
 }
 const a=raw.subarray(64*stride,128*stride),b=raw.subarray(128*stride,192*stride)
 assert.notDeepEqual(a,b)
})
