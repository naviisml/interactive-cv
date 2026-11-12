<script setup lang="ts">
import type {WorldGeometry} from '~/composables/physics'
const props=defineProps<{geometry:WorldGeometry;width:number;window:{start:number;end:number;width:number}}>()
const terrain=computed(()=>props.geometry.terrain ?? [])
import { terrainPose, awayFromTerrainCorners } from '~/composables/terrainPlacement'
const surface=computed(()=>terrain.value.map(p=>`${p.x},${360-p.height}`).join(' '))
const polygon=computed(()=>`0,480 ${surface.value} ${props.width},480`)
const rocks = computed(()=>Array.from({length:Math.ceil(props.width/215)},(_,i)=>({x:i*215+85,size:8+(i%3)*3})).filter(r=>r.x>=props.window.start-20&&r.x<=props.window.end+20).filter(r=>awayFromTerrainCorners(r.x,r.size+8,terrain.value)).map(r=>({...r,...terrainPose(r.x,r.size,terrain.value)})))
const plants = computed(()=>Array.from({length:Math.ceil(props.width/310)},(_,i)=>terrainPose(i*310+225,5,terrain.value)).filter(p=>p.x>=props.window.start-20&&p.x<=props.window.end+20).filter(p=>awayFromTerrainCorners(p.x,10,terrain.value)))
</script>
<template>
  <svg class="terrain-art" :viewBox="`${window.start} 0 ${window.width} 480`" :style="{left:`${window.start}px`,width:`${window.width}px`}" aria-hidden="true">
    <defs>
      <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#56614e"/><stop offset=".45" stop-color="#374c43"/><stop offset="1" stop-color="#233e3b"/></linearGradient>
      <pattern id="stone-grain" width="88" height="63" patternUnits="userSpaceOnUse"><path d="M10 15h20v4H10zM54 43h28v3H54zM0 58h9v3H0z" fill="#c3b286" opacity=".12"/><path d="M37 26h8v9h-8zM73 6h4v8h-4z" fill="#112f31" opacity=".3"/></pattern>
      <clipPath id="earth-clip"><polygon :points="polygon"/></clipPath>
    </defs>
    <polygon :points="polygon" fill="url(#earth)"/>
    <g clip-path="url(#earth-clip)"><rect :x="window.start" :width="window.width" height="480" fill="url(#stone-grain)"/><path v-for="n in 30" :key="n" :d="`M${n*190} 0 l-14 80 35 55 -25 70 17 155`" fill="none" stroke="#152f32" stroke-width="3" opacity=".25"/></g>
    <g clip-path="url(#earth-clip)"><polyline :points="surface" fill="none" stroke="#233f38" stroke-width="18" stroke-linejoin="round"/>
    <polyline :points="surface" fill="none" stroke="#6d8660" stroke-width="11" stroke-linejoin="round"/>
    <polyline :points="surface" fill="none" stroke="#b0ae76" stroke-width="2"/></g>
    <g v-for="rock in rocks" :key="rock.x" :transform="`translate(${rock.x} ${360-rock.height+1}) rotate(${rock.angle})`"><path :d="`M${-rock.size} 0 v-${rock.size*.55} l${rock.size*.5} -${rock.size*.35} h${rock.size} l${rock.size*.5} ${rock.size*.35} V0Z`" fill="#5e7770"/><path :d="`M${-rock.size} -${rock.size*.55} l${rock.size*.5} -${rock.size*.35} h${rock.size} l${rock.size*.5} ${rock.size*.35}Z`" fill="#96a18b"/></g>
    <g v-for="plant in plants" :key="plant.x" :transform="`translate(${plant.x} ${360-plant.height+1}) rotate(${plant.angle})`"><path d="M-7 0l-3-9 7 5 2-12 3 12 7-6-4 10z" fill="#91a06c"/></g>
  </svg>
</template>
