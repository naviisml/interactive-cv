<script setup lang="ts">
import {newFootball,kickFootball,stepFootball,traceCircuit,codeSequence,stepCode} from '~/composables/worldActivities'
const props=defineProps<{id:string;active:boolean;paused:boolean;playerX:number;playerY:number;velocity:number}>()
const ball=useState('school-football',newFootball),goals=useState('school-goals',()=>0),turns=useState('school-circuit',()=>[3,0,1,2,1,3]),code=useState('school-code',()=>0)
const circuit=computed(()=>traceCircuit(turns.value))
const padTokens=['{',';','}'],padX=[184,300,416]
const standing=ref(-1),feedback=ref('')
let frame=0,last=0,scored=ball.value.scored
function kick(){if(props.paused||!props.active)return;ball.value=kickFootball(ball.value)}
function resetBall(){ball.value=newFootball();scored=false}
function rotate(index:number){if(props.paused||!props.active)return;turns.value[index]=((turns.value[index]??0)+1)%4}
function enterPad(index:number){if(props.paused||!props.active||code.value===4)return;const previous=code.value;code.value=stepCode(code.value,padTokens[index]!);feedback.value=code.value===4?'Build passed.':code.value>previous?'':'Start with { again.'}
watch(()=>[props.playerX,props.playerY,props.velocity,props.active],()=>{
 if(!props.active||props.paused)return
 if(props.id==='panta-rhei'&&Math.abs(props.playerX-ball.value.x)<24&&props.playerY>278&&props.velocity>15)kick()
 if(props.id==='coding-college'){
  const pad=props.playerY>294?padX.findIndex(x=>Math.abs(x-props.playerX)<27):-1
  if(pad!==standing.value){standing.value=pad;if(pad>=0)enterPad(pad)}
 }
})
function tick(time:number){const dt=last?Math.min((time-last)/1000,.1):0;last=time
 if(props.active&&!props.paused&&props.id==='panta-rhei'){
  ball.value=stepFootball(ball.value,dt)
  if(ball.value.scored&&!scored){goals.value++;scored=true}
 }
 frame=requestAnimationFrame(tick)
}
onMounted(()=>{frame=requestAnimationFrame(tick)})
onBeforeUnmount(()=>cancelAnimationFrame(frame))
</script>
<template>
 <div class="school-place" :data-school="id" :class="{'is-near':active}">
 <svg viewBox="0 0 600 310" shape-rendering="crispEdges" aria-hidden="true">
  <template v-if="id==='panta-rhei'">
   <path d="M100 306h400m-70-2v-75h68v75m-60-65h51m-51 13h51m-51 13h51m-51 13h51m-51 13h51m-38-52v61m13-61v61m13-61v61" stroke="#c5ccb1" stroke-width="3" fill="none"/><path d="M430 306v-78h70v78" stroke="#e0ddc4" stroke-width="6" fill="none"/>
   <path d="M124 304h6v-33l19 7-19 8m204 18h6v-33l19 7-19 8" fill="#b89b6f"/>
   <path d="M112 308h283m-213-1v-17h110v17" stroke="#b1b994" stroke-width="2" fill="none"/>
   <path d="M160 231h122v-60H160Z" fill="#3d6257" stroke="#9c9675" stroke-width="5"/><text x="221" y="191" text-anchor="middle" fill="#c5cbb0" font-size="10" font-family="monospace">SCHOOLYARD</text><text x="221" y="218" text-anchor="middle" fill="#ecdfb6" font-size="20" font-family="monospace">{{String(goals).padStart(2,'0')}} : 00</text><path d="M171 233v74m100-74v74" stroke="#85886a" stroke-width="5"/>
   <g :transform="`translate(${ball.x} ${ball.y})`"><circle r="10" fill="#e1dfc9" stroke="#596d60" stroke-width="2"/><path d="m-4-4 6-2 4 5-3 5-6-2Z" fill="#52665b"/><path d="m-9 3 4 2m9-14-1 5m5 8 3 4" stroke="#52665b" stroke-width="2"/></g>
  </template>
  <template v-else-if="id==='roc-hilversum'">
   <path d="M136 307v-41h325v41m-314-42v-14h302v14" stroke="#8c795b" stroke-width="7" fill="none"/><path d="M177 252V106h224v146Z" fill="#344f50" stroke="#a1a68a" stroke-width="7"/>
   <path d="M185 144h24m161 72h24" :stroke="circuit.complete?'#e7cf8f':'#8aa594'" stroke-width="5"/><path d="M186 125h-12v36h12m-16-27v18" stroke="#adba9b" stroke-width="4" fill="none"/>
   <path d="M400 217h28v-27m-7-7h15l-3-17h-9Z" :fill="circuit.complete?'#f0d18b':'#7d9787'" stroke="#8c9b80" stroke-width="3"/>
   <rect x="148" y="281" width="65" height="22" fill="#a5a58b"/><path d="M157 291h46m139-4h60v17h-60" stroke="#667c6c" stroke-width="3"/><path d="M246 282h56m-49 9h35" stroke="#b9b18a" stroke-width="4"/>
  </template>
  <template v-else>
   <path d="M160 244V123h280v121Z" fill="#314e51" stroke="#a2ad91" stroke-width="7"/><path d="M171 140h257" stroke="#5f7c72" stroke-width="2"/><g fill="#d2be8a"><rect x="175" y="132" width="4" height="4"/><rect x="184" y="132" width="4" height="4"/><rect x="193" y="132" width="4" height="4"/></g>
   <text x="185" y="164" fill="#a7bca4" font-size="10" font-family="monospace">$ make something</text>
   <g v-for="(token,i) in codeSequence" :key="i"><rect :x="184+i*51" y="181" width="40" height="31" :fill="i<code?'#8da18a':'#48645f'"/><text :x="204+i*51" y="203" text-anchor="middle" :fill="i<code?'#e9deae':'#9db29b'" font-size="20" font-family="monospace">{{token}}</text></g>
   <text x="185" y="230" :fill="code===4?'#e6d49d':'#9cb298'" font-size="10" font-family="monospace">{{code===4?'✓ build passed':'Walk the commands in order.'}}</text><path d="M189 250v45m221-45v45" stroke="#81937f" stroke-width="6"/>
   <g v-for="(x,i) in padX" :key="x"><path :d="`M${x-27} 302h54v8h-54Z`" :fill="standing===i?'#ddc48d':'#7e9b87'"/><path :d="`M${x-22} 299h44`" stroke="#c4c7a7" stroke-width="3"/></g>
  </template>
 </svg>
 <template v-if="id==='panta-rhei'">
  <button class="ball-target" :style="{left:`${ball.x-24}px`,top:`${ball.y-24}px`}" :tabindex="active?0:-1" aria-label="Kick the football towards the goal" :disabled="!active||!ball.settled||ball.scored||paused" @click="kick"/>
  <p class="place-hint" role="status">{{ball.scored?'Goal!': 'Walk into the ball, or tap it to shoot.'}} <button v-if="ball.scored||ball.x>490" :tabindex="active?0:-1" @click="resetBall">Another ball ↺</button></p>
 </template>
 <template v-else-if="id==='roc-hilversum'">
  <div class="circuit-board" aria-label="Route power from the battery to the lamp">
   <button v-for="(turn,i) in turns" :key="i" :class="{'is-lit':circuit.lit.includes(i)}" :aria-label="`Rotate wire ${i+1}, orientation ${turn+1}`" :tabindex="active?0:-1" :disabled="paused||!active" @click="rotate(i)"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 0v24h24" :transform="`rotate(${turn*90} 24 24)`" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="24" cy="24" r="5" fill="currentColor"/></svg></button>
  </div>
  <p class="place-hint" role="status">{{circuit.complete?'Connected. The lamp is on.':'Rotate the six wires. Battery → lamp.'}}</p>
 </template>
 <template v-else>
  <button v-for="(x,i) in padX" :key="x" class="code-pad" :style="{left:`${x-27}px`}" :aria-label="`Code stepping stone ${padTokens[i]}`" :tabindex="active?0:-1" :disabled="paused||!active||code===4" @click="enterPad(i)">{{padTokens[i]}}</button>
  <p class="place-hint" role="status">{{feedback||'Step on the stones: { → ; → { → }'}} <button v-if="code===4" :tabindex="active?0:-1" @click="code=0;feedback=''">Run again ↺</button></p>
 </template>
 </div>
</template>
<style scoped>
.school-place{position:absolute;inset:0;pointer-events:none}.school-place>svg{width:600px;height:310px;overflow:visible}.ball-target{position:absolute;width:48px;height:48px;border-radius:50%;pointer-events:auto;background:transparent}.ball-target:disabled{cursor:default}.place-hint{position:absolute;left:170px;bottom:173px;max-width:300px;padding:5px 9px;margin:0;background:#e5dfc8ed;color:#3b594f;border-left:3px solid #829276;font:10px/1.5 'Space Grotesk',sans-serif;opacity:0;transition:opacity .2s;pointer-events:none}.is-near .place-hint{opacity:1}.place-hint button{pointer-events:auto;text-decoration:underline;margin-left:6px;font-size:10px}.school-place[data-school=roc-hilversum] .place-hint{bottom:213px}.school-place[data-school=coding-college] .place-hint{bottom:215px}.circuit-board{position:absolute;left:208px;top:119px;display:grid;grid-template-columns:repeat(3,48px);gap:0;pointer-events:auto;border:1px solid #728b77}.circuit-board button{padding:0;width:48px;height:48px;background:#405e58;color:#6f8979;border:1px solid #587367}.circuit-board button svg{width:46px;height:46px;display:block}.circuit-board .is-lit{color:#ead295;background:#526c58}.circuit-board button:focus-visible{outline:3px solid #f0ddae;outline-offset:-3px}.code-pad{position:absolute;top:263px;width:54px;height:47px;color:#e3d4a7;font:20px monospace;pointer-events:auto;border:0;background:transparent}.code-pad:disabled{opacity:.8}.code-pad:focus-visible,.ball-target:focus-visible{outline:2px solid #f2db9d;outline-offset:0}
@media(prefers-reduced-motion:reduce){.place-hint{transition:none}}
</style>
