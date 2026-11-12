export type SpriteAction='idle'|'walk'|'run'|'jump'|'fall'|'climb'|'slide'
export const spriteRows={idle:0,walk:1,run:2,jump:3,fall:4,climb:5,slide:6} as const
export function atlasPosition(action:SpriteAction,phase:number,reducedMotion=false){
 const count=action==='climb'?4:action==='walk'||action==='run'?8:1
 return {row:spriteRows[action],column:reducedMotion?0:Math.max(0,Math.floor(phase))%count}
}
