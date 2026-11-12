export type CharacterAction='idle'|'walk'|'run'|'climb'|'jump'|'fall'|'slide'
export const SPRITE_WIDTH=32,SPRITE_HEIGHT=64,SPRITE_FRAMES=24
export function spriteFrame(action:CharacterAction,phase:number):number {
 const frame=Math.max(0,Math.floor(phase))
 switch(action){case 'walk':return 1+frame%8;case 'run':return 16+frame%8;case 'climb':return 11+frame%4;case 'jump':return 9;case 'fall':return 10;case 'slide':return 15;default:return 0}
}
