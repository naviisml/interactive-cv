import {terrainHeight,type Motion,type WorldGeometry} from './physics.ts'
export interface JourneyDestination {index:number;fromX:number;fromY:number;toX:number;elapsed:number;duration:number}
export function navigationDuration(distance:number){return Math.max(1,Math.abs(distance)/600)}
export function advanceDestination(nav:JourneyDestination,dt:number,world:WorldGeometry):{motion:Motion;done:boolean} {
  nav.elapsed=Math.min(nav.duration,nav.elapsed+Math.max(0,Math.min(dt,.05)))
  const t=nav.elapsed/nav.duration,blend=t*t*(3-2*t)
  const x=nav.fromX+(nav.toX-nav.fromX)*blend
  const ground=-terrainHeight(x,world.terrain)||0
  const settle=Math.min(1,nav.elapsed/.25)
  const y=nav.fromY+(ground-nav.fromY)*settle
  return {motion:{x,y,vx:(nav.toX-nav.fromX)*6*t*(1-t)/nav.duration,vy:0,grounded:Math.abs(y-ground)<.1,mode:'walking',returning:nav.toX<nav.fromX},done:t>=1}
}
