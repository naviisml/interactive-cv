<script setup lang="ts">
import{spriteFrame,type CharacterAction}from'~/composables/characterSprite'
const props=defineProps<{walking:boolean;running:boolean;facing:number;airborne:boolean;falling:boolean;climbing?:boolean;sliding?:boolean;frame:number}>()
const reduced=ref(false)
let query:MediaQueryList|undefined
function preference(){reduced.value=query?.matches??false}
onMounted(()=>{query=window.matchMedia('(prefers-reduced-motion: reduce)');preference();query.addEventListener('change',preference)})
onBeforeUnmount(()=>query?.removeEventListener('change',preference))
const action=computed<CharacterAction>(()=>props.sliding?'slide':props.climbing?'climb':props.airborne?(props.falling?'fall':'jump'):props.running?'run':props.walking?'walk':'idle')
const frameIndex=computed(()=>spriteFrame(action.value,reduced.value?0:props.frame))
</script>
<template><div class="navi-pixel" role="img" aria-label="Navi" :style="{transform:`scaleX(${facing})`,backgroundPosition:`${-frameIndex*48}px 0`}"/></template>
<style scoped>
.navi-pixel{width:48px;height:96px;background-image:url('/sprites/navi.png');background-size:1536px 96px;background-repeat:no-repeat;image-rendering:pixelated;transform-origin:50% 100%}
</style>
