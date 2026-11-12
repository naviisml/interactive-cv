<script setup lang="ts">
import { characterPose, limbPath, type CharacterAction } from '~/composables/characterRig'
const props=defineProps<{walking:boolean;facing:number;airborne:boolean;falling:boolean;climbing?:boolean;sliding?:boolean;frame:number}>()
const reducedMotion=ref(false)
let preference:MediaQueryList|undefined
function updatePreference(){reducedMotion.value=preference?.matches ?? false}
onMounted(()=>{preference=window.matchMedia('(prefers-reduced-motion: reduce)');updatePreference();preference.addEventListener('change',updatePreference)})
onBeforeUnmount(()=>preference?.removeEventListener('change',updatePreference))
const action=computed<CharacterAction>(()=>props.sliding?'slide':props.climbing?'climb':props.airborne?(props.falling?'fall':'jump'):props.walking?'walk':'idle')
const pose=computed(()=>characterPose(action.value,reducedMotion.value?0:props.frame))
</script>
<template>
  <div class="navi-sprite" :style="{transform:`scaleX(${facing})`}" aria-label="Navi" role="img">
    <svg viewBox="0 0 24 54" shape-rendering="crispEdges" aria-hidden="true">
      <g stroke-linecap="square" stroke-linejoin="round" fill="none">
        <path :d="limbPath(pose.rearLeg)" stroke="#25323b" stroke-width="4.5"/>
        <path :d="limbPath(pose.rearArm)" stroke="#202b31" stroke-width="4"/>
      </g>
      <rect :x="pose.rearLeg.end.x-2" :y="pose.rearLeg.end.y-1" width="6" height="3" fill="#b7c0b7"/>
      <rect :x="pose.rearArm.end.x-1.5" :y="pose.rearArm.end.y-1" width="3" height="3" fill="#b88870"/>
      <g :transform="`translate(0 ${pose.bodyY})`">
      <path fill="#181b20" d="M8 2h2V1h6v1h3v2h1v8h-2v3h-3v-2H8v-2H7V4h1z"/><path fill="#303036" d="M9 3h2V2h5v1h2v2h-4V4h-3v2H9z"/>
      <path fill="#bd8c73" d="M9 7h9v3h2v3h-2v3h-2v2h-5v-2H9v-3H8V9h1z"/><path fill="#d2a083" d="M11 7h7v4h2v2h-2v3h-5v-2h-2z"/>
      <path fill="#202026" d="M8 5h11v3h-2V7h-2v2h-1V7h-2v1h-2v3H8z"/><path fill="#4b3330" d="M14 9h4v1h-4z"/><path fill="#20272c" d="M16 10h2v1h-2z"/><path fill="#ad7863" d="M18 11h2v2h-2z"/><path fill="#48332d" d="M14 14h4v1h-4zM13 16h4v2h-4z"/><path fill="#b88771" d="M12 18h4v3h-4z"/>
      <path fill="#202a30" d="M8 21h10v15H8z"/><path fill="#344255" d="M11 21h5v14h-5z"/><path fill="#424b50" d="m9 20 3 2-2 5-3-3zM18 20l-3 2 2 5 3-3z"/><path fill="#69757b" d="M14 26h1v10h-1z"/>
      </g>
      <path :d="limbPath(pose.frontLeg)" fill="none" stroke="#34424b" stroke-width="4.5" stroke-linecap="square" stroke-linejoin="round"/>
      <rect :x="pose.frontLeg.end.x-2" :y="pose.frontLeg.end.y-1" width="6" height="3" fill="#e1dfcd"/>
      <path :d="limbPath(pose.frontArm)" fill="none" stroke="#303b43" stroke-width="4" stroke-linecap="square" stroke-linejoin="round"/>
      <rect :x="pose.frontArm.end.x-1.5" :y="pose.frontArm.end.y-1" width="3" height="3" fill="#c49378"/>
    </svg>
  </div>
</template>
<style scoped>
.navi-sprite{width:40px;height:90px;transform-origin:50% 100%;image-rendering:pixelated}
.navi-sprite svg{display:block;width:100%;height:100%;overflow:visible}

</style>
