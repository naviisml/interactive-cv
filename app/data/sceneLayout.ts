// All artwork, interaction targets and collisions use these world-pixel coordinates.
export const sceneLayout={width:600,height:310,originX:300,actorWidth:48,actorHeight:96} as const
export const circuitLayout={x:216,y:86,columns:3,rows:2,cell:56} as const
export const schoolLayout={
 scoreboard:{x:160,y:118,width:122,height:70},
 codeScreen:{x:160,y:78,width:280,height:126},
 pads:[184,300,416],
} as const
export interface ScenePoint {x:number;y:number}
export function circuitPorts(turn:number){const rotation=((turn%4)+4)%4;return [rotation,(rotation+1)%4]}
export function circuitCell(index:number){return {x:circuitLayout.x+index%circuitLayout.columns*circuitLayout.cell,y:circuitLayout.y+Math.floor(index/circuitLayout.columns)*circuitLayout.cell,size:circuitLayout.cell}}
export function circuitPort(index:number,direction:number):ScenePoint {
 const cell=circuitCell(index),half=cell.size/2
 return [{x:cell.x+half,y:cell.y},{x:cell.x+cell.size,y:cell.y+half},{x:cell.x+half,y:cell.y+cell.size},{x:cell.x,y:cell.y+half}][direction]!
}
export function circuitWire(index:number,turn:number){const [a,b]=circuitPorts(turn),start=circuitPort(index,a!),end=circuitPort(index,b!),cell=circuitCell(index);return `M${start.x} ${start.y}L${cell.x+cell.size/2} ${cell.y+cell.size/2}L${end.x} ${end.y}`}
export const circuitInput=circuitPort(0,3),circuitOutput=circuitPort(5,1)

export const circuitBattery={x:circuitInput.x-35,y:circuitInput.y}
export const circuitLamp={x:circuitOutput.x+39,y:circuitOutput.y-24}
export const circuitInputLead=`M${circuitBattery.x} ${circuitBattery.y}H${circuitInput.x}`
export const circuitOutputLead=`M${circuitOutput.x} ${circuitOutput.y}H${circuitLamp.x}V${circuitLamp.y}`
