<script setup lang="ts">
import {atlasPosition,type SpriteAction} from '~/composables/characterAtlas'
const props=defineProps<{walking:boolean;running?:boolean;facing:number;airborne:boolean;falling:boolean;climbing?:boolean;sliding?:boolean;frame:number}>()
const reducedMotion=ref(false)
let preference:MediaQueryList|undefined
function updatePreference(){reducedMotion.value=preference?.matches ?? false}
onMounted(()=>{preference=window.matchMedia('(prefers-reduced-motion: reduce)');updatePreference();preference.addEventListener('change',updatePreference)})
onBeforeUnmount(()=>preference?.removeEventListener('change',updatePreference))
const action=computed<SpriteAction>(()=>props.sliding?'slide':props.climbing?'climb':props.airborne?(props.falling?'fall':'jump'):props.running?'run':props.walking?'walk':'idle')
const cell=computed(()=>atlasPosition(action.value,props.frame,reducedMotion.value))
</script>
<template><span class="navi-sprite" :style="{transform:`scaleX(${facing})`}" role="img" aria-label="Navi"><img src="/sprites/navi.png" alt="" width="360" height="630" draggable="false" :style="{left:`${-cell.column*45}px`,top:`${-cell.row*90}px`}"></span></template>
<style scoped>
.navi-sprite{display:block;position:relative;width:45px;height:90px;overflow:hidden;transform-origin:50% 100%;image-rendering:pixelated}
.navi-sprite img{position:absolute;display:block;width:360px;height:630px;max-width:none;image-rendering:pixelated;pointer-events:none;user-select:none}
</style>
