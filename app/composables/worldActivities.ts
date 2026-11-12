export interface Football {x:number;y:number;vx:number;vy:number;scored:boolean;settled:boolean}
export const newFootball=():Football=>({x:266,y:299,vx:0,vy:0,scored:false,settled:true})
export function kickFootball(ball:Football,speed=205):Football {
 if(!ball.settled||ball.scored)return ball
 return {...ball,vx:Math.max(175,Math.min(235,speed)),vy:-175,settled:false}
}
function integrateFootball(ball:Football,delta:number):Football {
 if(ball.settled)return ball
 const dt=delta,next={...ball}
 next.vy+=470*dt;next.x+=next.vx*dt;next.y+=next.vy*dt
 if(!next.scored&&next.x>=426&&next.x<=480&&next.y>236&&next.y<=300){next.scored=true;next.vx=24}
 if(next.scored&&next.x>463){next.x=463;next.vx=0}
 if(next.y>=299){next.y=299;if(Math.abs(next.vy)>65){next.vy=-Math.abs(next.vy)*.35;next.vx*=.7}else{next.vy=0;next.vx*=Math.exp(-8*dt)}}
 if(next.y===299&&Math.abs(next.vx)<3){next.vx=0;next.vy=0;next.settled=true}
 return next
}
// Corner connectors rotate clockwise: north/east, east/south, south/west, west/north.
export function traceCircuit(turns:number[]):{lit:number[];complete:boolean} {
 const lit:number[]=[],seen=new Set<number>();let cell=0,incoming=3
 for(let count=0;count<8;count++){
  if(cell<0||cell>=6||seen.has(cell))break
  const rotation=((turns[cell]??0)%4+4)%4,ports=[rotation,(rotation+1)%4]
  if(!ports.includes(incoming))break
  seen.add(cell);lit.push(cell)
  const outgoing=ports.find(port=>port!==incoming)!
  if(cell===5&&outgoing===1)return {lit,complete:true}
  const col=cell%3,row=Math.floor(cell/3)
  if(outgoing===0){if(!row)break;cell-=3}
  else if(outgoing===1){if(col===2)break;cell++}
  else if(outgoing===2){if(row===1)break;cell+=3}
  else{if(!col)break;cell--}
  incoming=(outgoing+2)%4
 }
 return {lit,complete:false}
}
export const codeSequence=['{',';','{','}'] as const
export function stepCode(progress:number,token:string){if(progress===codeSequence.length)return progress;return token===codeSequence[progress]?progress+1:token===codeSequence[0]?1:0}

export function portalPlatforms(center:number,ground:number){return [{id:'portal-step-1',x:center-130,width:75,height:ground+50},{id:'portal-step-2',x:center-35,width:75,height:ground+100},{id:'portal-step-3',x:center+60,width:100,height:ground+150}]}

export function stepFootball(ball:Football,delta:number):Football {
 let result=ball,remaining=Math.min(.1,Math.max(0,delta))
 while(remaining>0){const dt=Math.min(remaining,1/120);result=integrateFootball(result,dt);remaining-=dt}
 return result
}
