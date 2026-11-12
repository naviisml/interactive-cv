<script setup lang="ts">
import { terrain } from '~/data/world'
import { WORLD_WIDTH } from '~/data/timeline'
import { terrainHeight } from '~/composables/physics'
const surface = terrain.map(p=>`${p.x},${360-p.height}`).join(' ')
const polygon = `0,360 ${surface} ${WORLD_WIDTH},360`
const rocks = Array.from({length: 38},(_,i)=>({ x: i*143+80, h: terrainHeight(i*143+80,terrain), size: 10+i%4*4 }))
</script>
<template>
  <svg class="terrain-art" :viewBox="`0 0 ${WORLD_WIDTH} 360`" :style="{ width: `${WORLD_WIDTH}px` }" aria-hidden="true">
    <defs>
      <linearGradient id="earth" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#56614e"/><stop offset=".45" stop-color="#374c43"/><stop offset="1" stop-color="#233e3b"/></linearGradient>
      <pattern id="stone-grain" width="88" height="63" patternUnits="userSpaceOnUse"><path d="M10 15h20v4H10zM54 43h28v3H54zM0 58h9v3H0z" fill="#c3b286" opacity=".12"/><path d="M37 26h8v9h-8zM73 6h4v8h-4z" fill="#112f31" opacity=".3"/></pattern>
      <clipPath id="earth-clip"><polygon :points="polygon"/></clipPath>
    </defs>
    <polygon :points="polygon" fill="url(#earth)"/>
    <g clip-path="url(#earth-clip)"><rect width="100%" height="360" fill="url(#stone-grain)"/><path v-for="n in 30" :key="n" :d="`M${n*190} 0 l-14 80 35 55 -25 70 17 155`" fill="none" stroke="#152f32" stroke-width="3" opacity=".25"/></g>
    <polyline :points="surface" fill="none" stroke="#233f38" stroke-width="19" stroke-linejoin="round"/>
    <polyline :points="surface" fill="none" stroke="#6d8660" stroke-width="11" stroke-linejoin="round"/>
    <polyline :points="surface" transform="translate(0 -3)" fill="none" stroke="#b0ae76" stroke-width="3"/>
    <g v-for="rock in rocks" :key="rock.x" :transform="`translate(${rock.x} ${360-rock.h})`"><path :d="`M${-rock.size} 0 v-${rock.size*.55} l${rock.size*.5} -${rock.size*.45} h${rock.size} l${rock.size*.5} ${rock.size*.45} V0Z`" fill="#5e7770"/><path :d="`M${-rock.size} -${rock.size*.55} l${rock.size*.5} -${rock.size*.45} h${rock.size} l${rock.size*.5} ${rock.size*.45}Z`" fill="#96a18b"/><path d="M20 0l-3-12 8 7 2-17 4 16 9-8-5 14z" fill="#9caa71"/></g>
  </svg>
</template>
