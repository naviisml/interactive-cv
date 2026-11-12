import fs from 'node:fs'
import zlib from 'node:zlib'
const W=32,H=64,COLS=8,ROWS=7
const colors={hair:'#202126',shine:'#37383c',skin:'#c9977d',light:'#dbad8f',shade:'#ac7d68',jacket:'#273139',edge:'#3c4850',shirt:'#3e5266',pants:'#34444f',back:'#25343f',shoe:'#dedfd2',sole:'#83918d'}
const rgba=hex=>[parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16),255]
function sprite(action,frame){
 const pixels=Buffer.alloc(W*H*4)
 const pixel=(x,y,c)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<W&&y>=0&&y<H)pixels.set(rgba(colors[c]||c),(y*W+x)*4)}
 const rect=(x,y,w,h,c)=>{for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)pixel(i,j,c)}
 const poly=(points,c)=>{for(let y=Math.floor(Math.min(...points.map(p=>p[1])));y<=Math.ceil(Math.max(...points.map(p=>p[1])));y++)for(let x=Math.floor(Math.min(...points.map(p=>p[0])));x<=Math.ceil(Math.max(...points.map(p=>p[0])));x++){
  let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a[1]>y+.5)!==(b[1]>y+.5)&&(x+.5)<(b[0]-a[0])*(y+.5-a[1])/(b[1]-a[1])+a[0])inside=!inside}if(inside)pixel(x,y,c)
 }}
 const segment=(a,b,width,c)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*width/2,ny=dx/l*width/2;poly([[a[0]+nx,a[1]+ny],[b[0]+nx,b[1]+ny],[b[0]-nx,b[1]-ny],[a[0]-nx,a[1]-ny]],c);rect(Math.round(a[0]-width/2),Math.round(a[1]-width/2),width,width,c);rect(Math.round(b[0]-width/2),Math.round(b[1]-width/2),width,width,c)}
 const limb=(hip,knee,ankle,c,width=5)=>{segment(hip,knee,width,c);segment(knee,ankle,width,c)}
 // Contact, down, passing, up; then exchange the front and rear legs.
 const walk=[
  {f:[[17,48],[26,61]],b:[[12,48],[6,61]]},
  {f:[[20,49],[23,61]],b:[[11,46],[10,56]]},
  {f:[[17,49],[17,61]],b:[[22,44],[15,50]]},
  {f:[[13,49],[12,61]],b:[[24,45],[24,56]]},
  {f:[[12,48],[6,61]],b:[[17,48],[26,61]]},
  {f:[[11,46],[10,56]],b:[[20,49],[23,61]]},
  {f:[[22,44],[15,50]],b:[[17,49],[17,61]]},
  {f:[[24,45],[24,56]],b:[[13,49],[12,61]]},
 ]
 let legs={f:[[15,49],[15,61]],b:[[20,49],[20,61]]},arms={f:[[10,27],[9,35]],b:[[25,27],[25,35]]},bodyY=0,lean=0
 if(action==='walk'||action==='run'){
  legs=structuredClone(walk[frame%8]);const swing=[-3,-2,0,2,3,2,0,-2][frame%8]
  arms={f:[[10-swing,27],[10-swing*1.7,35]],b:[[24+swing,27],[24+swing*1.7,35]]}
  if(action==='run'){lean=1;arms={f:[[8-swing,25],[14-swing*1.8,26]],b:[[25+swing,26],[23+swing*1.8,30]]};legs.f[0][1]-=2;legs.b[0][1]-=2}
 } else if(action==='jump'){
  legs={f:[[23,43],[24,53]],b:[[11,45],[7,52]]};arms={f:[[8,25],[7,20]],b:[[27,25],[29,20]]}
 } else if(action==='fall'){
  legs={f:[[16,48],[18,61]],b:[[22,46],[25,57]]};arms={f:[[7,25],[5,30]],b:[[27,25],[29,31]]}
 } else if(action==='climb'){
  const swap=frame%4>=2
  legs=swap?{f:[[10,44],[10,59]],b:[[25,42],[25,53]]}:{f:[[10,42],[10,53]],b:[[25,44],[25,59]]}
  arms=swap?{f:[[7,22],[7,13]],b:[[27,26],[27,21]]}:{f:[[7,26],[7,21]],b:[[27,22],[27,13]]}
 } else if(action==='slide'){
  bodyY=10;legs={f:[[23,49],[27,61]],b:[[20,51],[24,61]]};arms={f:[[14,40],[20,45]],b:[[25,39],[27,44]]}
 }
 const rearHip=[20,36+bodyY],frontHip=[14,36+bodyY]
 limb(rearHip,legs.b[0],legs.b[1],'back');rect(legs.b[1][0]-2,legs.b[1][1],6,3,'sole')
 limb([24+lean,20+bodyY],arms.b[0],arms.b[1],'jacket',4);rect(arms.b[1][0]-1,arms.b[1][1],3,3,'shade')
 // Jacket, long torso, and a fixed waist shared by every frame.
 poly([[11+lean,17+bodyY],[23+lean,17+bodyY],[25+lean,22+bodyY],[23,38+bodyY],[11,38+bodyY],[10+lean,22+bodyY]],'jacket')
 if(action!=='climb'){rect(15+lean,18+bodyY,6,18,'shirt');poly([[12+lean,17+bodyY],[16+lean,19+bodyY],[14+lean,24+bodyY],[10+lean,20+bodyY]],'edge');poly([[23+lean,17+bodyY],[20+lean,19+bodyY],[22+lean,24+bodyY],[25+lean,20+bodyY]],'edge');rect(19+lean,23+bodyY,1,14,'#7c898b')}
 else {rect(12,21,1,15,'edge');rect(21,21,1,15,'edge');rect(13,27,8,1,'edge')}
 rect(15+lean,13+bodyY,5,5,'skin')
 // Short textured hair and the supplied profile's brow, fringe and goatee.
 rect(11+lean,4+bodyY,12,7,'hair');rect(12+lean,2+bodyY,9,3,'hair');rect(14+lean,1+bodyY,5,2,'hair');rect(12+lean,4+bodyY,4,1,'shine');rect(17+lean,3+bodyY,4,1,'shine')
 if(action!=='climb'){
  poly([[13+lean,7+bodyY],[23+lean,7+bodyY],[23+lean,10+bodyY],[25+lean,10+bodyY],[25+lean,12+bodyY],[22+lean,12+bodyY],[21+lean,15+bodyY],[15+lean,15+bodyY],[13+lean,12+bodyY]],'skin')
  rect(17+lean,8+bodyY,6,4,'light');rect(19+lean,8+bodyY,4,1,'hair');rect(21+lean,9+bodyY,1,1,'hair');rect(19+lean,12+bodyY,4,1,'shade');rect(18+lean,14+bodyY,3,1,'hair');rect(12+lean,8+bodyY,3,4,'shade');rect(13+lean,6+bodyY,10,2,'hair');rect(16+lean,8+bodyY,1,1,'hair');rect(19+lean,7+bodyY,1,2,'hair')
 } else {rect(12,5,11,8,'hair');rect(14,12,7,2,'hair');rect(11,10,2,3,'skin');rect(23,10,2,3,'skin')}
 limb(frontHip,legs.f[0],legs.f[1],'pants');rect(legs.f[1][0]-2,legs.f[1][1],7,3,'shoe');rect(legs.f[1][0]-2,legs.f[1][1]+2,7,1,'sole')
 limb([11+lean,20+bodyY],arms.f[0],arms.f[1],'edge',4);rect(arms.f[1][0]-1,arms.f[1][1],3,3,'skin')
 return pixels
}
const rows=[['idle',1],['walk',8],['run',8],['jump',1],['fall',1],['climb',4],['slide',1]]
const width=W*COLS,height=H*ROWS,pixels=Buffer.alloc(width*height*4)
for(let r=0;r<rows.length;r++)for(let col=0;col<COLS;col++){
 const[action,count]=rows[r],tile=sprite(action,col%count)
 for(let y=0;y<H;y++)tile.copy(pixels,((r*H+y)*width+col*W)*4,y*W*4,(y+1)*W*4)
}
const crcTable=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0})
const crc=buffer=>{let c=0xffffffff;for(const byte of buffer)c=crcTable[(c^byte)&255]^(c>>>8);return(c^0xffffffff)>>>0}
const chunk=(type,data)=>{const name=Buffer.from(type),length=Buffer.alloc(4),checksum=Buffer.alloc(4);length.writeUInt32BE(data.length);checksum.writeUInt32BE(crc(Buffer.concat([name,data])));return Buffer.concat([length,name,data,checksum])}
const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(width,0);ihdr.writeUInt32BE(height,4);ihdr[8]=8;ihdr[9]=6
const scanlines=Buffer.alloc((width*4+1)*height)
for(let y=0;y<height;y++)pixels.copy(scanlines,y*(width*4+1)+1,y*width*4,(y+1)*width*4)
fs.mkdirSync('public/sprites',{recursive:true})
fs.writeFileSync('public/sprites/navi.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',zlib.deflateSync(scanlines)),chunk('IEND',Buffer.alloc(0))]))
console.log('Generated public/sprites/navi.png (32 × 64 per frame)')
