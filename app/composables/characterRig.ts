export interface Point {x:number;y:number}
export interface Limb {start:Point;joint:Point;end:Point}
export type CharacterAction='idle'|'walk'|'climb'|'jump'|'fall'|'slide'
export interface CharacterPose {bodyY:number;rearArm:Limb;frontArm:Limb;rearLeg:Limb;frontLeg:Limb}
const point=(x:number,y:number):Point=>({x,y})
// Two fixed-length segments. The end is clamped only if outside physical reach.
export function solveLimb(start:Point,target:Point,upper:number,lower:number,bend=1):Limb {
  const dx=target.x-start.x,dy=target.y-start.y
  const raw=Math.hypot(dx,dy)||.001,d=Math.min(upper+lower-.001,Math.max(Math.abs(upper-lower)+.001,raw))
  const ux=dx/raw,uy=dy/raw
  const along=(upper*upper-lower*lower+d*d)/(2*d)
  const side=Math.sqrt(Math.max(0,upper*upper-along*along))*bend
  return {start,joint:point(start.x+ux*along+uy*side,start.y+uy*along-ux*side),end:point(start.x+ux*d,start.y+uy*d)}
}
export const limbPath=(limb:Limb)=>`M${limb.start.x} ${limb.start.y} L${limb.joint.x} ${limb.joint.y} L${limb.end.x} ${limb.end.y}`
function stepFoot(phase:number,centre:number):Point {
  const t=((phase%1)+1)%1
  if(t<.5)return point(centre+6-24*t,52)
  const swing=(t-.5)*2
  return point(centre-6+12*swing,52-Math.sin(swing*Math.PI)*4)
}
export function characterPose(action:CharacterAction,frame:number):CharacterPose {
  const phase=(((frame%8)+8)%8)/8, wave=Math.sin(phase*2*Math.PI)
  const bodyY=action==='slide'?8:action==='walk'?1:0
  let frontFoot=point(11,52),rearFoot=point(14,52)
  let frontHand=point(7,35),rearHand=point(18,35)
  if(action==='walk') {
    frontFoot=stepFoot(phase,11);rearFoot=stepFoot(phase+.5,14)
    frontHand=point(8-wave*3.5,35-Math.abs(wave));rearHand=point(17+wave*3.5,35-Math.abs(wave))
  } else if(action==='climb') {
    frontFoot=point(8,49-wave*2);rearFoot=point(18,49+wave*2)
    frontHand=point(21,16+wave*3);rearHand=point(23,16-wave*3)
  } else if(action==='jump') {
    frontFoot=point(17,49);rearFoot=point(7,46)
    frontHand=point(5,31);rearHand=point(21,29)
  } else if(action==='fall') {
    frontFoot=point(12,52);rearFoot=point(17,49)
    frontHand=point(5,34);rearHand=point(22,32)
  } else if(action==='slide') {
    frontFoot=point(22,52);rearFoot=point(18,52)
    frontHand=point(14,42);rearHand=point(21,41)
  }
  return {
    bodyY,
    rearLeg:solveLimb(point(14,33+bodyY),rearFoot,10,9),
    frontLeg:solveLimb(point(11,33+bodyY),frontFoot,10,9),
    rearArm:solveLimb(point(17,22+bodyY),rearHand,7,7),
    frontArm:solveLimb(point(8,22+bodyY),frontHand,7,7),
  }
}
