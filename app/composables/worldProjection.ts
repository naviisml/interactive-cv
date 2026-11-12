import {sceneLayout} from '../data/sceneLayout.ts'
export function worldProjection(width:number,height:number){
 const scale=Math.max(.8,Math.min(1,(height-190)/sceneLayout.height))
 return {scale,viewport:Math.max(1,width)/scale,groundInset:height<440?56:76}
}
