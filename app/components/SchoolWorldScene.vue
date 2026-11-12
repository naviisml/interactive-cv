<script setup lang="ts">
import {sceneLayout,schoolLayout,circuitLayout,circuitCell,circuitInput,circuitOutput,circuitWire,circuitBattery,circuitLamp,circuitInputLead,circuitOutputLead} from '~/data/sceneLayout'
import {newFootball,kickFootball,stepFootball,traceCircuit,codeSequence,stepCode} from '~/composables/worldActivities'
const props=defineProps<{id:string;active:boolean;paused:boolean;playerX:number;playerY:number;velocity:number}>()
const emit=defineEmits<{status:[message:string]}>()
const ball=useState('school-football',newFootball),goals=useState('school-goals',()=>0),turns=useState('school-circuit',()=>[3,0,1,2,1,3]),code=useState('school-code',()=>0)
const circuit=computed(()=>traceCircuit(turns.value))
const padTokens=['{',';','}'],padX=schoolLayout.pads
const standing=ref(-1),feedback=ref('')
const status=computed(()=>props.id==='panta-rhei'?`${ball.value.scored?'Goal. Tap the scoreboard for another ball.':'Walk into the ball, or tap it to shoot.'} · ${goals.value} scored`:props.id==='roc-hilversum'?(circuit.value.complete?'Circuit complete. Power reaches the lamp.':'Tap the wires to connect the battery to the lamp.'):(feedback.value||'Walk or tap the stones: { → ; → { → }'))
watch(status,message=>emit('status',message),{immediate:true})
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
 <div data-world-activity class="school-place" :data-school="id" :class="{'is-near':active}">
 <svg :viewBox="`0 0 ${sceneLayout.width} ${sceneLayout.height}`" shape-rendering="crispEdges" role="group" :aria-label="id==='roc-hilversum'?'Circuit workbench':id==='panta-rhei'?'School football pitch':'Code stepping stones'">
  <template v-if="id==='panta-rhei'">
   <path d="M100 306h400m-70-2v-75h68v75m-60-65h51m-51 13h51m-51 13h51m-51 13h51m-51 13h51m-38-52v61m13-61v61m13-61v61" stroke="#6d8a72" stroke-width="2" fill="none"/><path d="M430 306v-78h70v78" stroke="#b7c2a4" stroke-width="5" fill="none"/>
   <path d="M124 304h6v-33l19 7-19 8m204 18h6v-33l19 7-19 8" fill="#b89b6f"/>
   <path d="M112 308h283m-213-1v-17h110v17" stroke="#b1b994" stroke-width="2" fill="none"/>
   <g aria-hidden="true" :transform="`translate(${schoolLayout.scoreboard.x} ${schoolLayout.scoreboard.y})`"><rect :width="schoolLayout.scoreboard.width" :height="schoolLayout.scoreboard.height" fill="#314e46" stroke="#9c9675" stroke-width="4"/><text :x="schoolLayout.scoreboard.width/2" y="18" text-anchor="middle" fill="#c5cbb0" font-size="9" font-family="monospace">SCHOOLYARD</text><text :x="schoolLayout.scoreboard.width/2" y="44" text-anchor="middle" fill="#ecdfb6" font-size="19" font-family="monospace">{{String(goals).padStart(2,'0')}} : 00</text><path :d="`M11 ${schoolLayout.scoreboard.height}V${sceneLayout.height-schoolLayout.scoreboard.y}m100 0V${schoolLayout.scoreboard.height}`" stroke="#76826a" stroke-width="4"/></g>
   <g :transform="`translate(${ball.x} ${ball.y})`"><circle r="10" fill="#e1dfc9" stroke="#596d60" stroke-width="2"/><path d="m-4-4 6-2 4 5-3 5-6-2Z" fill="#52665b"/><path d="m-9 3 4 2m9-14-1 5m5 8 3 4" stroke="#52665b" stroke-width="2"/></g>
  </template>
  <template v-else-if="id==='roc-hilversum'">
   <g aria-hidden="true">
    <path d="M180 310v-65h255v65" stroke="#857a61" stroke-width="5" fill="none"/><path d="M169 245h277v-9H169Z" fill="#a69673" stroke="#857a61" stroke-width="3"/>
    <rect :x="circuitLayout.x-18" :y="circuitLayout.y-18" :width="circuitLayout.columns*circuitLayout.cell+36" :height="circuitLayout.rows*circuitLayout.cell+36" fill="#344f50" stroke="#93a28a" stroke-width="5"/>
    <path :d="circuitInputLead" stroke="#ead295" stroke-width="5" fill="none"/>
    <path :d="`M${circuitBattery.x} ${circuitBattery.y-15}v30m-7-23v16`" stroke="#a6b69a" stroke-width="4" fill="none"/>
    <path :d="circuitOutputLead" :stroke="circuit.complete?'#ead295':'#6f8979'" stroke-width="5" fill="none"/>
    <path :d="`M${circuitLamp.x-6} ${circuitLamp.y}h12l-2-16h-8Z`" :fill="circuit.complete?'#efcf86':'#6f8979'"/>
   </g>
   <g v-for="(turn,i) in turns" :key="i" class="wire-tile" role="button" :aria-label="`Rotate wire ${i+1}, orientation ${turn+1}`" :aria-disabled="paused||!active" :tabindex="active&&!paused?0:-1" @click="rotate(i)" @keydown.enter.prevent.stop="rotate(i)" @keydown.space.prevent.stop="rotate(i)">
    <rect :x="circuitCell(i).x" :y="circuitCell(i).y" :width="circuitCell(i).size" :height="circuitCell(i).size" :fill="circuit.lit.includes(i)?'#536b58':'#3d5952'" stroke="#6c8473" stroke-width="1"/>
    <path :d="circuitWire(i,turn)" fill="none" :stroke="circuit.lit.includes(i)?'#ead295':'#7e9884'" stroke-width="5"/>
    <circle :cx="circuitCell(i).x+circuitCell(i).size/2" :cy="circuitCell(i).y+circuitCell(i).size/2" r="4" :fill="circuit.lit.includes(i)?'#ead295':'#7e9884'"/>
   </g>
  </template>
  <template v-else>
   <g aria-hidden="true" :transform="`translate(${schoolLayout.codeScreen.x} ${schoolLayout.codeScreen.y})`">
    <rect :width="schoolLayout.codeScreen.width" :height="schoolLayout.codeScreen.height" fill="#314e51" stroke="#a2ad91" stroke-width="6"/>
    <path :d="`M11 17h${schoolLayout.codeScreen.width-22}`" stroke="#5f7c72" stroke-width="2"/><g fill="#d2be8a"><rect v-for="x in [15,24,33]" :key="x" :x="x" y="9" width="4" height="4"/></g>
    <text x="25" y="41" fill="#a7bca4" font-size="10" font-family="monospace">$ make something</text>
    <g v-for="(token,i) in codeSequence" :key="i"><rect :x="24+i*51" y="55" width="40" height="31" :fill="i<code?'#8da18a':'#48645f'"/><text :x="44+i*51" y="77" text-anchor="middle" :fill="i<code?'#e9deae':'#9db29b'" font-size="20" font-family="monospace">{{token}}</text></g>
    <text x="25" y="107" :fill="code===4?'#e6d49d':'#9cb298'" font-size="10" font-family="monospace">{{code===4?'build passed':'Walk the commands in order.'}}</text>
    <path :d="`M29 ${schoolLayout.codeScreen.height+4}V${sceneLayout.height-schoolLayout.codeScreen.y}m222 0V${schoolLayout.codeScreen.height+4}`" stroke="#81937f" stroke-width="5"/>
   </g>
   <g v-for="(x,i) in padX" :key="x"><path :d="`M${x-27} 302h54v8h-54Z`" :fill="standing===i?'#ddc48d':'#7e9b87'"/><path :d="`M${x-22} 299h44`" stroke="#c4c7a7" stroke-width="3"/></g>
  </template>
 </svg>
 <template v-if="id==='panta-rhei'">
  <button class="ball-target" :style="{left:`${ball.x-24}px`,top:`${ball.y-24}px`}" :tabindex="active?0:-1" aria-label="Kick the football towards the goal" :disabled="!active||!ball.settled||ball.scored||paused" @click="kick"/>
  <button v-if="ball.scored||ball.x>490" class="school-reset football-reset" :style="{left:`${schoolLayout.scoreboard.x+17}px`,top:`${schoolLayout.scoreboard.y+43}px`}" :tabindex="active?0:-1" :disabled="paused||!active" @click="resetBall">New ball ↺</button>
 </template>
 <template v-else-if="id==='coding-college'">
  <button v-for="(x,i) in padX" :key="x" class="code-pad" :style="{left:`${x-28}px`}" :aria-label="`Code stepping stone ${padTokens[i]}`" :tabindex="active?0:-1" :disabled="paused||!active||code===4" @click="enterPad(i)">{{padTokens[i]}}</button>
  <button v-if="code===4" class="school-reset code-reset" :style="{left:`${schoolLayout.codeScreen.x+185}px`,top:`${schoolLayout.codeScreen.y+72}px`}" :tabindex="active?0:-1" :disabled="paused||!active" @click="code=0;feedback=''">Run again ↺</button>
 </template>
 </div>
</template>
<style scoped>
.school-place{position:absolute;inset:0;pointer-events:none}.school-place>svg{width:100%;height:100%;overflow:visible}.ball-target{position:absolute;width:48px;height:48px;border-radius:50%;pointer-events:auto;background:transparent}.ball-target:disabled{cursor:default}.wire-tile{pointer-events:auto;cursor:pointer}.wire-tile:focus-visible{outline:none}.wire-tile:focus-visible rect{stroke:#f7e6b5;stroke-width:3}.wire-tile[aria-disabled=true]{cursor:default}.school-reset{position:absolute;pointer-events:auto;background:transparent;color:#ead9ad;font:9px monospace;height:56px;display:flex;align-items:flex-start;justify-content:center}.football-reset{width:88px;padding-top:8px}.code-reset{width:82px;padding-top:24px}.code-pad{position:absolute;top:254px;width:56px;height:56px;color:#e3d4a7;font:20px monospace;pointer-events:auto;background:transparent}.code-pad:focus-visible,.ball-target:focus-visible{outline:2px solid #f2db9d;outline-offset:0}
</style>
