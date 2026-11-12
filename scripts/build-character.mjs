import fs from 'node:fs/promises'
import sharp from 'sharp'
// Authored whole-frame pixel poses. No SVG joints or CSS limb transforms at runtime.
const walk=[
 [[19,48,25,61],[13,48,9,61]],[[19,49,22,61],[12,47,11,58]],
 [[17,49,18,61],[11,46,15,55]],[[16,49,14,61],[13,46,21,58]],
 [[13,49,9,61],[21,48,25,61]],[[12,47,11,58],[20,49,22,61]],
 [[11,46,15,55],[18,49,18,61]],[[13,46,21,58],[17,49,14,61]],
]
const rect=(x,y,w,h,c)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
const limb=(x,y,pose,color,width)=>`<path d="M${x} ${y} L${pose[0]} ${pose[1]} L${pose[2]} ${pose[3]}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="square"/>`
const head=rect(12,2,10,10,'#191e24')+rect(11,4,2,6,'#191e24')+rect(14,1,6,2,'#25292e')+rect(13,4,9,8,'#c29277')+rect(15,6,7,7,'#d1a084')+rect(22,8,2,3,'#bf8b70')+rect(12,3,10,3,'#20242a')+rect(13,5,2,3,'#20242a')+rect(17,5,2,2,'#20242a')+rect(18,7,4,1,'#503a31')+rect(20,8,2,1,'#1c252a')+rect(18,11,4,1,'#513b30')+rect(17,13,4,2,'#4a352d')+rect(15,14,5,4,'#b7856b')
const torso=rect(11,18,11,21,'#202b33')+rect(9,19,3,10,'#28343d')+rect(14,18,5,19,'#3a4a60')+rect(12,19,2,18,'#2b353d')+rect(19,20,3,17,'#18232b')+rect(18,24,1,13,'#65727b')+rect(11,36,11,3,'#2b3742')+rect(12,18,2,5,'#46525a')+rect(20,18,2,5,'#414d55')
function render(kind,frame=0){
 let front=[15,49,15,61],back=[19,49,19,61],frontHand=10,backHand=23,bodyY=0,frontHandY=39,backHandY=38
 if(kind==='walk'||kind==='run'){
  ;[front,back]=walk[frame]
  const swing=[-4,-3,0,3,4,3,0,-3][frame]
  frontHand=11+swing;backHand=21-swing
  if(kind==='run'){front=[front[0],front[1]-1,front[2],front[3]<61?front[3]-3:61];back=[back[0],back[1]-1,back[2],back[3]<61?back[3]-3:61];frontHandY=36;backHandY=36}
 }else if(kind==='jump'){front=[22,48,24,55];back=[11,46,9,53];frontHand=8;frontHandY=31;backHand=25;backHandY=29
 }else if(kind==='fall'){front=[19,49,20,61];back=[12,48,10,57];frontHand=8;frontHandY=36;backHand=25;backHandY=34
 }else if(kind==='climb'){const flip=frame%4<2;front=[flip?22:17,47,flip?24:19,flip?57:61];back=[flip?15:11,47,flip?12:9,flip?61:57];frontHand=23;backHand=24;frontHandY=flip?13:23;backHandY=flip?23:13
 }else if(kind==='slide'){bodyY=10;front=[27,52,27,61];back=[24,52,23,61];frontHand=18;backHand=25;frontHandY=47;backHandY=45}
 const backLeg=limb(19,38+bodyY,back,'#25343e',5)+rect(back[2]-2,back[3],7,3,'#a8b5b6')
 const backArm=limb(21,21+bodyY,[23,Math.round((21+bodyY+backHandY)/2),backHand,backHandY],'#1a252e',4)+rect(backHand-1,backHandY,3,3,'#b9876e')
 const frontLeg=limb(15,38+bodyY,front,'#344552',5)+rect(front[2]-2,front[3],7,3,'#dedfce')
 const frontArm=limb(11,21+bodyY,[Math.round((11+frontHand)/2)-1,Math.round((21+bodyY+frontHandY)/2),frontHand,frontHandY],'#303f49',4)+rect(frontHand-1,frontHandY,3,3,'#c79578')
 return `<g shape-rendering="crispEdges">${backLeg}${backArm}<g transform="translate(0 ${bodyY})">${head}${torso}</g>${frontLeg}${frontArm}</g>`
}
const actions=[['idle',0],...Array.from({length:8},(_,i)=>['walk',i]),['jump',0],['fall',0],...Array.from({length:4},(_,i)=>['climb',i]),['slide',0],...Array.from({length:8},(_,i)=>['run',i])]
await fs.mkdir('public/sprites',{recursive:true})
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="${actions.length*32}" height="64">${actions.map(([kind,frame],i)=>`<g transform="translate(${i*32} 0)">${render(kind,frame)}</g>`).join('')}</svg>`
await sharp(Buffer.from(sheet)).png().toFile('public/sprites/navi.png')
const reviewDir=process.env.CHARACTER_REVIEW_DIR
if(reviewDir){
await fs.mkdir(reviewDir,{recursive:true})
const thumbnails=actions.map(([kind,frame],i)=>`<g transform="translate(${i%8*112} ${Math.floor(i/8)*220})"><path d="M5 193h102" stroke="#8a9b81"/><g transform="translate(8 0) scale(3)">${render(kind,frame)}</g><text x="56" y="211" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3c5c4d">${kind} ${frame}</text></g>`).join('')
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="896" height="660"><rect width="100%" height="100%" fill="#e0e3d4"/>${thumbnails}</svg>`)).png().toFile(`${reviewDir}/sprite-review.png`)
for(let i=0;i<8;i++) await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64">${render('walk',i)}</svg>`)).resize(128,256,{kernel:'nearest'}).png().toFile(`${reviewDir}/navi-walk-${i}.png`)
}
console.log('Generated 24 fixed pixel frames.')
