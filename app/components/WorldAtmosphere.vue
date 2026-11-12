<script setup lang="ts">
import { WORLD_WIDTH } from '~/data/timeline'
defineProps<{ camera: number }>()
const width = WORLD_WIDTH + 2400
const fir = 'M0 0 L-17 28 H-10 L-26 55 H-16 L-34 88 H-23 L-42 122 H42 L23 88 H34 L16 55 H26 L10 28 H17 Z'
</script>
<template>
  <div class="atmosphere" :style="{ '--atmosphere-width': `${width}px` }" aria-hidden="true">
    <div class="sky-glow"/>
    <svg class="distant-clouds" preserveAspectRatio="none" viewBox="0 0 6000 400" :style="{ transform: `translate3d(${-camera*.06}px,0,0)` }"><g fill="#fce4be" opacity=".55"><path v-for="n in 15" :key="n" :transform="`translate(${n*390-350} ${25+(n*31%105)}) scale(${.6+n%3*.25})`" d="M0 22h28V12h26V0h48v8h30v14h40v12h-25v7H-10V29H0z"/></g><g fill="#fff5db"><rect v-for="n in 35" :key="n" :x="n*157" :y="n*73%240" width="2" height="2" opacity=".6"/></g></svg>
    <svg class="depth-layer far-peaks" viewBox="0 0 6000 520" preserveAspectRatio="none" :style="{ transform: `translate3d(${-camera*.13}px,0,0)` }">
      <defs><linearGradient id="far-mist" x2="0" y2="1"><stop stop-color="#8d9aab"/><stop offset="1" stop-color="#b3b5b0"/></linearGradient></defs>
      <path fill="url(#far-mist)" d="M0 290 90 265 150 280 320 120 390 175 490 70 610 195 680 180 840 330 1010 245 1190 80 1270 155 1390 25 1550 200 1700 170 1840 315 1980 270 2100 140 2200 190 2360 60 2560 280 2720 210 2880 100 3030 255 3170 175 3300 310 3480 110 3610 155 3780 45 3920 185 4060 150 4230 280 4400 130 4560 220 4700 100 4900 270 5060 170 5200 300 5400 100 5590 250 5800 120 6000 220V520H0Z"/>
      <g fill="#d9d5c4" opacity=".6"><path d="m490 70-45 61 41-15 17 24 12-32 28 28zM1390 25l-44 65 40-24 26 37 6-40 28 17zM2360 60l-53 73 38-17 16 25 19-42 28 25zM3780 45l-51 72 38-20 20 30 12-44 22 15z"/></g>
    </svg>
    <svg class="depth-layer valley-layer" viewBox="0 0 6000 440" preserveAspectRatio="none" :style="{ transform: `translate3d(${-camera*.28}px,0,0)` }">
      <path fill="#748f91" d="M0 230 140 245 290 200 460 180 600 225 830 275 1020 230 1210 265 1400 200 1580 245 1800 195 2000 250 2250 225 2440 275 2620 220 2810 245 3000 190 3220 250 3420 210 3600 280 3820 230 4000 270 4200 190 4440 240 4650 190 4900 270 5100 230 5340 265 5580 200 5800 250 6000 230V440H0Z"/>
      <path fill="#476f76" d="M0 350 200 310 460 330 680 300 850 350 1070 320 1260 365 1460 325 1680 350 1860 300 2060 350 2280 330 2480 370 2700 325 2960 350 3200 300 3420 345 3660 315 3890 370 4120 325 4340 350 4560 315 4780 360 5020 320 5260 355 5500 315 5780 360 6000 320V440H0Z"/>
      <path fill="#aec3b7" opacity=".65" d="M0 385 Q300 315 600 375T1200 380T1800 370T2400 390T3000 380T3600 390T4200 370T4800 390T5400 375T6000 390V440H0Z"/>
      <g fill="#cce0cc" opacity=".5"><rect v-for="n in 70" :key="n" :x="n*87" :y="390+n*17%40" :width="12+n%4*9" height="2"/></g>
    </svg>
    <svg class="depth-layer forest-layer" :viewBox="`0 0 ${width} 420`" preserveAspectRatio="none" :style="{ transform: `translate3d(${-camera*.5}px,0,0)` }"><g v-for="n in Math.ceil(width/118)" :key="n" :transform="`translate(${n*118-130} ${140+n*47%130}) scale(${.65+n%4*.22})`"><path :d="fir" fill="#335f60"/><path d="M0 7V122H42L23 88H34L16 55H26L10 28H17Z" fill="#264d52" opacity=".5"/><rect x="-4" y="115" width="8" height="85" fill="#34564e"/></g><path d="M0 395Q350 340 700 390T1400 380T2100 395T2800 380T3500 390T4200 380T4900 395T5600 380L6000 390V420H0Z" fill="#315b58"/></svg>
    <div class="distance-haze"/>
    <svg class="depth-layer near-forest" :viewBox="`0 0 ${width} 460`" :style="{ transform: `translate3d(${-camera*.77}px,0,0)` }"><g v-for="n in Math.ceil(width/380)" :key="n" :transform="`translate(${n*380+30} ${105+n*31%70}) scale(${1.1+n%3*.2})`"><rect x="-7" y="90" width="14" height="260" fill="#294d43"/><path :d="fir" fill="#386c56"/><path :d="fir" transform="translate(0 50) scale(1.1)" fill="#2c5d4d"/><path d="M-30 113 0 100 0 175-15 155z" fill="#477963"/></g></svg>
  </div>
</template>
