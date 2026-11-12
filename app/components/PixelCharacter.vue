<script setup lang="ts">
import {sceneLayout} from '~/data/sceneLayout'
import{spriteFrame,SPRITE_FRAMES,type CharacterAction}from'~/composables/characterSprite'
const props=defineProps<{walking:boolean;running:boolean;facing:number;airborne:boolean;falling:boolean;climbing?:boolean;sliding?:boolean;frame:number}>()
const reduced=ref(false)
let query:MediaQueryList|undefined
function preference(){reduced.value=query?.matches??false}
onMounted(()=>{query=window.matchMedia('(prefers-reduced-motion: reduce)');preference();query.addEventListener('change',preference)})
onBeforeUnmount(()=>query?.removeEventListener('change',preference))
const action=computed<CharacterAction>(()=>props.sliding?'slide':props.climbing?'climb':props.airborne?(props.falling?'fall':'jump'):props.running?'run':props.walking?'walk':'idle')
const frameIndex=computed(()=>spriteFrame(action.value,reduced.value?0:props.frame))
</script>
<template><div class="navi-pixel" role="img" aria-label="Navi" :style="{transform:`scaleX(${facing})`,width:`${sceneLayout.actorWidth}px`,height:`${sceneLayout.actorHeight}px`,backgroundSize:`${sceneLayout.actorWidth*SPRITE_FRAMES}px ${sceneLayout.actorHeight}px`,backgroundPosition:`${-frameIndex*sceneLayout.actorWidth}px 0`}"/></template>
<style scoped>
.navi-pixel{background-image:url('/sprites/navi.png');background-repeat:no-repeat;image-rendering:pixelated;transform-origin:50% 100%}
</style>
