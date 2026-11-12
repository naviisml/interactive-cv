import {test} from 'node:test'
import assert from 'node:assert/strict'
import {characterPose,type CharacterAction} from '../app/composables/characterRig.ts'
test('limbs stay joined and retain segment length in every action and frame',()=>{
  for(const action of ['idle','walk','climb','jump','fall','slide'] as CharacterAction[])for(let frame=0;frame<8;frame++){
    const p=characterPose(action,frame)
    for(const [limb,upper,lower] of [[p.frontLeg,10,9],[p.rearLeg,10,9],[p.frontArm,7,7],[p.rearArm,7,7]] as const){
      assert.ok(Math.abs(Math.hypot(limb.start.x-limb.joint.x,limb.start.y-limb.joint.y)-upper)<.001)
      assert.ok(Math.abs(Math.hypot(limb.joint.x-limb.end.x,limb.joint.y-limb.end.y)-lower)<.001)
      for(const point of [limb.start,limb.joint,limb.end])assert.ok(Number.isFinite(point.x)&&Number.isFinite(point.y))
    }
    assert.equal(p.frontArm.start.y,22+p.bodyY)
    assert.equal(p.frontLeg.start.y,33+p.bodyY)
  }
})
test('walking keeps a foot planted and the body stable throughout the loop',()=>{
  for(let frame=0;frame<8;frame++){
    const p=characterPose('walk',frame)
    assert.ok(Math.abs(Math.max(p.frontLeg.end.y,p.rearLeg.end.y)-52)<.01)
    assert.equal(p.bodyY,1)
  }
  assert.deepEqual(characterPose('walk',0),characterPose('walk',8))
})
