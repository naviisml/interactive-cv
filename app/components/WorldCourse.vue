<script setup lang="ts">
import type {WorldGeometry} from '~/composables/physics'
const props=defineProps<{geometry:WorldGeometry;width:number;window:{start:number;end:number;width:number}}>()
import { terrainHeight, slideSurface } from '~/composables/physics'
const groundAt=(x:number)=>terrainHeight(x,props.geometry.terrain)
const base=420
const platforms=computed(()=>props.geometry.platforms.filter(p=>!p.id.startsWith('portal-')&&p.x+p.width>=props.window.start&&p.x<=props.window.end))
const ladders=computed(()=>props.geometry.ladders.filter(l=>l.x>=props.window.start&&l.x<=props.window.end))
const slides=computed(()=>props.geometry.slides.filter(s=>s.x+s.width>=props.window.start&&s.x<=props.window.end))
</script>
<template>
  <svg class="course-art" :viewBox="`${window.start} 0 ${window.width} ${base}`" :style="{left:`${window.start}px`,width:`${window.width}px`}" fill="none" aria-hidden="true" shape-rendering="crispEdges">
    <g v-for="p in platforms" :key="p.id">
      <rect v-for="x in [p.x+14,p.x+p.width-20]" :key="x" :x="x" :y="base-p.height+9" width="7" :height="Math.max(0,p.height-groundAt(x)-9)" fill="#687858"/>
      <path :d="`M${p.x+16} ${base-p.height+12} L${p.x+p.width-17} ${base-groundAt(p.x+p.width-17)-12}`" stroke="#607454" stroke-width="5"/>
      <path :d="`M${p.x} ${base-p.height}h${p.width}v10H${p.x}Z`" fill="#5f6950"/>
      <rect :x="p.x" :y="base-p.height" :width="p.width" height="3" fill="#c4b38b"/>
      <path :d="`M${p.x+4} ${base-p.height}v-29h${p.width-8}v29`" fill="none" stroke="#91a27d" stroke-width="4"/>
      <path v-for="n in 3" :key="n" :d="`M${p.x+n*p.width/4} ${base-p.height}v-28`" stroke="#7f946e" stroke-width="3"/>
    </g>
    <g v-for="ladder in ladders" :key="ladder.id">
      <rect :x="ladder.x-14" :y="base-ladder.top" width="5" :height="ladder.top-ladder.bottom" fill="#bea077"/>
      <rect :x="ladder.x+9" :y="base-ladder.top" width="5" :height="ladder.top-ladder.bottom" fill="#a98b62"/>
      <rect v-for="n in Math.floor((ladder.top-ladder.bottom)/16)" :key="n" :x="ladder.x-9" :y="base-ladder.bottom-n*16" width="18" height="4" fill="#d0b28a"/>
    </g>
    <g v-for="slide in slides" :key="slide.id">
      <path :d="`M${slide.x} ${base-slide.from} L${slide.x+slide.width} ${base-slide.to} v8 L${slide.x} ${base-slide.from+8}Z`" fill="#688b83"/>
      <path :d="`M${slide.x} ${base-slide.from} L${slide.x+slide.width} ${base-slide.to}`" stroke="#d6c29b" stroke-width="2"/>
      <path :d="`M${slide.x} ${base-slide.from-11} L${slide.x+slide.width} ${base-slide.to-11}`" stroke="#95aaa0" stroke-width="3"/>
      <rect v-for="ratio in [.3,.7]" :key="ratio" :x="slide.x+slide.width*ratio" :y="base+slideSurface(slide,slide.x+slide.width*ratio)+8" width="5" :height="Math.max(0,-slideSurface(slide,slide.x+slide.width*ratio)-groundAt(slide.x+slide.width*ratio)-8)" fill="#69816a"/>
    </g>
    <g v-if="window.start<550&&window.end>380">
      <rect v-for="x in [395,515]" :key="x" :x="x" :y="base-groundAt(450)-34" width="5" :height="groundAt(450)+34-groundAt(x)" fill="#7b8462"/>
      <rect x="380" :y="base-groundAt(450)-104" width="150" height="80" fill="#35594c" stroke="#a8b58a" stroke-width="2"/>
      <text x="392" :y="base-groundAt(450)-86" fill="#eddfb1" font-family="monospace" font-size="10" letter-spacing="1">TUTORIAL</text>
      <g fill="#d5ddbf" font-family="monospace" font-size="9"><text x="392" :y="base-groundAt(450)-66">← → / Swipe : move</text><text x="392" :y="base-groundAt(450)-49">Space / ↥   : jump</text><text x="392" :y="base-groundAt(450)-32">↑ ↓         : climb</text></g>
    </g>
  </svg>
</template>
