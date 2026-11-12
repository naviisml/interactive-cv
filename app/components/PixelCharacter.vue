<script setup lang="ts">
const props=defineProps<{ walking:boolean; facing:number; airborne:boolean; climbing?:boolean; sliding?:boolean; frame:number }>()
const pose=computed(()=>props.walking || props.climbing ? props.frame : 0)
// Pixel poses keep the planted foot at y=54. The sprite itself never bobs or rotates.
const legs=[
  {back:'M12 35h5v16h-5z',front:'M8 35h5v16H8z',backFoot:'M12 51h5l3 1v2h-8z',frontFoot:'M8 51h5v3H7v-2h1z'},
  {back:'M12 35h5v7l-5 8H8v-3l5-8z',front:'M8 35h5v8l4 8h-5l-4-9z',backFoot:'M8 48h5v3H6v-2h2z',frontFoot:'M12 51h6l3 1v2h-9z'},
  {back:'M12 35h5v16h-5z',front:'M8 35h5v16H8z',backFoot:'M12 51h5v3h-6v-2h1z',frontFoot:'M8 51h6l3 1v2H8z'},
  {back:'M12 35h5l-1 9-6 7H6l7-10z',front:'M8 35h5v7l5 6-3 2-7-7z',backFoot:'M6 51h5v3H4v-2h2z',frontFoot:'M14 48h6v3h-8v-2h2z'},
]
const leg=computed(()=>legs[pose.value]!)
</script>
<template>
  <div class="navi-sprite" :style="{transform:`scaleX(${facing})`}" aria-label="Navi" role="img">
    <svg viewBox="0 0 24 54" shape-rendering="crispEdges" aria-hidden="true">
      <g v-if="!sliding && !climbing && !airborne"><path :d="leg.back" fill="#263139"/><path :d="leg.backFoot" fill="#b8c0b8"/></g>
      <g v-else-if="sliding"><path d="M8 34h9v6l-5 9h8v5H8v-12l4-4H8z" fill="#283641"/><path d="M18 51h5v3h-5z" fill="#d6d8ca"/></g>
      <g v-else><path d="M12 35h5v8l-5 7H8v-4l5-6z" fill="#263139"/><path d="M8 48h5v3H6v-2h2z" fill="#b8c0b8"/></g>
      <g :transform="walking ? `rotate(${pose%2 ? -9 : 7} 13 23)` : undefined"><path d="M16 21h4l1 14h-4z" fill="#1e282e"/><path d="M17 34h4v4h-4z" fill="#b88870"/></g>
      <path fill="#181b20" d="M8 2h2V1h6v1h3v2h1v8h-2v3h-3v-2H8v-2H7V4h1z"/><path fill="#303036" d="M9 3h2V2h5v1h2v2h-4V4h-3v2H9z"/>
      <path fill="#bd8c73" d="M9 7h9v3h2v3h-2v3h-2v2h-5v-2H9v-3H8V9h1z"/><path fill="#d2a083" d="M11 7h7v4h2v2h-2v3h-5v-2h-2z"/>
      <path fill="#202026" d="M8 5h11v3h-2V7h-2v2h-1V7h-2v1h-2v3H8z"/><path fill="#4b3330" d="M14 9h4v1h-4z"/><path fill="#20272c" d="M16 10h2v1h-2z"/><path fill="#ad7863" d="M18 11h2v2h-2z"/><path fill="#48332d" d="M14 14h4v1h-4zM13 16h4v2h-4z"/><path fill="#b88771" d="M12 18h4v3h-4z"/>
      <path fill="#202a30" d="M8 21h10v15H8z"/><path fill="#344255" d="M11 21h5v14h-5z"/><path fill="#424b50" d="m9 20 3 2-2 5-3-3zM18 20l-3 2 2 5 3-3z"/><path fill="#69757b" d="M14 26h1v10h-1z"/>
      <g :transform="climbing ? `translate(0 ${pose%2 ? -7 : 0})` : walking ? `rotate(${pose%2 ? 9 : -7} 8 22)` : undefined"><path d="M6 22h4v13H5V25z" fill="#2a343a"/><path d="M5 25h2v8H5z" fill="#3b454b"/><path d="M5 34h4v4H5z" fill="#c49378"/></g>
      <g v-if="!sliding && !airborne && !climbing"><path :d="leg.front" fill="#34424c"/><path :d="leg.frontFoot" fill="#e2dfcc"/></g>
      <g v-else-if="!sliding"><path d="M8 35h5v8h5v5h-9l-1-8z" fill="#34424c"/><path d="M16 45h5v3h-5z" fill="#e2dfcc"/></g>
    </svg>
  </div>
</template>
<style scoped>
.navi-sprite{width:40px;height:90px;transform-origin:50% 100%;image-rendering:pixelated}
.navi-sprite svg{display:block;width:100%;height:100%;overflow:visible}
@media(prefers-reduced-motion:reduce){.navi-sprite g{transform:none}}
</style>
