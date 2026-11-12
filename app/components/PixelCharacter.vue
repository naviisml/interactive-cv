<script setup lang="ts">
defineProps<{ walking: boolean; facing: number; airborne: boolean; climbing?: boolean; sliding?: boolean }>()
</script>
<template>
  <div class="character" :class="{ walking, airborne, climbing, sliding }" :style="{ '--facing': facing }" aria-label="Pixel Navi: tall, dark hair, short facial hair, black jacket and navy shirt" role="img">
    <svg viewBox="0 0 24 54" shape-rendering="crispEdges" aria-hidden="true">
      <!-- Short sides, textured dark top and a small fringe. -->
      <path fill="#181b20" d="M8 2h2V1h6v1h3v2h1v8h-2v3h-3v-2H8v-2H7V4h1z"/>
      <path fill="#303036" d="M9 3h2V2h5v1h2v2h-4V4h-3v2H9z"/>
      <path fill="#bd8c73" d="M9 7h9v3h2v3h-2v3h-2v2h-5v-2H9v-3H8V9h1z"/>
      <path fill="#d2a083" d="M11 7h7v4h2v2h-2v3h-5v-2h-2z"/>
      <path fill="#202026" d="M8 5h11v3h-2V7h-2v2h-1V7h-2v1h-2v3H8z"/>
      <path fill="#4b3330" d="M14 9h4v1h-4z"/><path fill="#20272c" d="M16 10h2v1h-2z"/>
      <path fill="#ad7863" d="M18 11h2v2h-2zM10 13h2v3h-2z"/>
      <!-- Narrow moustache and short goatee, rather than a full beard. -->
      <path fill="#48332d" d="M14 14h4v1h-4zM13 16h4v2h-4z"/><path fill="#b88771" d="M12 18h4v3h-4z"/>
      <!-- Long, slim silhouette, dark jacket over a navy shirt. -->
      <path fill="#22292e" d="M9 20h9l3 4v12h-4V25H8v11H4V25l2-3z"/>
      <path fill="#151e25" d="M8 22h10v14H8z"/><path fill="#344255" d="M11 21h5v14h-5z"/>
      <path fill="#3d4347" d="m9 20 3 2-2 5-3-3zM18 20l-3 2 2 5 3-3z"/>
      <path fill="#647077" d="M14 26h1v10h-1z"/><path fill="#343a3d" d="M5 25h2v8H5zM18 26h2v7h-2z"/>
      <path fill="#bd8b70" d="M4 35h4v4H4zM18 35h3v4h-3z"/>
      <g class="leg leg-a"><path fill="#29343d" d="M8 36h6v16H9V44H8z"/><path fill="#39464e" d="M9 39h2v11H9z"/><path fill="#c5c5bc" d="M8 51h6v3H7v-2h1z"/><path fill="#525f65" d="M8 51h6v1H8z"/></g>
      <g class="leg leg-b"><path fill="#202b34" d="M14 36h5v16h-5z"/><path fill="#35414b" d="M17 39h1v11h-1z"/><path fill="#e0dfce" d="M14 51h5l3 1v2h-8z"/><path fill="#5d6971" d="M14 51h5v1h-5z"/></g>
    </svg>
  </div>
</template>
