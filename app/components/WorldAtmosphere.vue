<script setup lang="ts">
import {parallaxTiles,parallaxOffset} from '~/composables/worldProjection'
const props=defineProps<{camera:number;viewportWidth:number;level:string}>()
const tiles=computed(()=>parallaxTiles(props.viewportWidth))
const shift=(speed:number)=>`translate3d(${parallaxOffset(props.camera,speed)}px,0,0)`
const fir='0,0 -14,25 -7,25 -23,51 -14,51 -31,80 -20,80 -39,113 39,113 20,80 31,80 14,51 23,51 7,25 14,25'
</script>
<template>
 <div class="atmosphere" :data-level="level" :style="{'--atmosphere-width':`${tiles.width}px`}" aria-hidden="true">
  <div class="sky-glow"/>
  <svg class="distant-clouds" :viewBox="`0 0 ${tiles.width} 260`" preserveAspectRatio="none" :style="{transform:shift(.06)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`" fill="#f1dfb7" opacity=".45"><polygon points="70,62 70,54 128,54 128,45 193,45 193,52 262,52 262,64 337,64 337,72 62,72 62,62"/><polygon points="640,113 640,104 689,104 689,97 752,97 752,104 817,104 817,115 907,115 907,122 628,122 628,113"/></g></svg>
  <svg class="depth-layer far-peaks" :viewBox="`0 0 ${tiles.width} 520`" preserveAspectRatio="none" :style="{transform:shift(.13)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`"><polygon points="0,310 85,270 144,286 316,133 395,190 505,77 641,217 715,198 885,338 1055,252 1200,310 1200,520 0,520" fill="#97a8a7"/><polygon points="505,77 460,139 505,123 525,148 537,113 569,146" fill="#bdc8b6" opacity=".7"/></g></svg>
  <svg class="depth-layer valley-layer" :viewBox="`0 0 ${tiles.width} 420`" preserveAspectRatio="none" :style="{transform:shift(.28)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`"><polygon points="0,280 150,235 330,254 490,288 690,232 902,261 1070,240 1200,280 1200,420 0,420" fill="#6c9189"/><polygon points="0,356 230,340 435,367 650,348 890,366 1200,356 1200,420 0,420" fill="#829f8d"/></g></svg>
  <svg class="depth-layer forest-layer" :viewBox="`0 0 ${tiles.width} 420`" preserveAspectRatio="none" :style="{transform:shift(.5)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`"><g v-for="(x,i) in [60,220,450,650,860,1090]" :key="x" :transform="`translate(${x} ${155+i%3*26}) scale(${.85+i%3*.18})`"><rect x="-4" y="99" width="8" height="110" fill="#436b58"/><polygon :points="fir" fill="#3c7063"/><polygon points="0,0 0,113 39,113 20,80 31,80 14,51 23,51 7,25 14,25" fill="#315c55"/></g></g></svg>
  <svg v-if="level==='work'||level==='company'" class="depth-layer city-layer" :viewBox="`0 0 ${tiles.width} 420`" preserveAspectRatio="none" :style="{transform:shift(.43)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`"><g v-for="n in 8" :key="n" :transform="`translate(${35+(n-1)*140} 0)`"><rect x="0" :y="130+n%4*32" width="95" :height="290-n%4*32" fill="#426c67"/><rect x="5" :y="136+n%4*32" width="10" :height="284-n%4*32" fill="#648578"/><g v-for="row in 4" :key="row" fill="#bac09d" opacity=".6"><rect v-for="col in 3" :key="col" :x="22+col*18" :y="285+row*23" width="9" height="6"/></g></g></g></svg>
  <svg v-if="level==='skills'" class="depth-layer circuit-layer" :viewBox="`0 0 ${tiles.width} 420`" preserveAspectRatio="none" :style="{transform:shift(.08)}"><g v-for="copy in tiles.copies" :key="copy" :transform="`translate(${(copy-1)*1200} 0)`" fill="none" stroke="#b6d0b6" stroke-width="2" opacity=".25"><path v-for="n in 7" :key="n" :d="`M${n*150} 420V${180+n%3*40}l40-40v-80h40`"/></g></svg>
  <div class="distance-haze"/>
 </div>
</template>
