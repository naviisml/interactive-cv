<script setup lang="ts">
const props=defineProps<{active:boolean;paused:boolean;playerX:number;playerY:number}>()
const emit=defineEmits<{unlock:[];status:[message:string]}>()
const runes=[{x:168,y:235},{x:300,y:151},{x:432,y:220}]
const collected=useState<number[]>('portal-runes',()=>[])
const ready=computed(()=>collected.value.length===3)
watch(()=>[props.playerX,props.playerY,props.active],()=>{
 if(!props.active||props.paused)return
 runes.forEach((rune,index)=>{if(!collected.value.includes(index)&&Math.abs(props.playerX-rune.x)<24&&rune.y>=props.playerY-94&&rune.y<=props.playerY-5)collected.value.push(index)})
})
watch(ready,value=>{if(value)emit('unlock')})
watch(()=>collected.value.length,count=>emit('status',count===3?'Side path unlocked. Jump up the steps.':`Jump to collect the runes · ${count} / 3`),{immediate:true})
</script>
<template>
 <div class="portal-activity" :class="{'is-near':active,'is-complete':ready}" data-world-activity>
 <svg viewBox="0 0 600 310" shape-rendering="crispEdges" aria-hidden="true">
  <g v-for="(rune,i) in runes" :key="i" :transform="`translate(${rune.x} ${rune.y})`" :class="{'is-collected':collected.includes(i)}"><path d="m0-13 10 13L0 13-10 0Z" fill="#d7c7e1" stroke="#6b718d" stroke-width="3"/><path d="M0-5v10m-4-5h8" stroke="#fbebc8" stroke-width="2"/></g>
  <g v-if="ready"><g v-for="(p,i) in [{x:170,y:260,w:75},{x:265,y:210,w:75},{x:360,y:160,w:100}]" :key="i"><path :d="`M${p.x} ${p.y}h${p.w}v8h-${p.w}Z`" fill="#a7b5a2"/><path :d="`M${p.x+10} ${p.y+8}h${p.w-20}l-10 14h-${p.w-40}Z`" fill="#668780"/></g><path d="m428 159 6-33 13 8-8 11 11 12Z" fill="#dbc69b"/></g>
 </svg>

 </div>
</template>
<style scoped>
.portal-activity{position:absolute;inset:0;pointer-events:none}.portal-activity svg{width:100%;height:100%;overflow:visible}.is-collected{opacity:.12}
</style>
