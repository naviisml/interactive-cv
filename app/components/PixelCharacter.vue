<script setup lang="ts">
defineProps<{ walking: boolean; facing: number; airborne: boolean; climbing?: boolean; sliding?: boolean }>()
</script>
<template>
  <div class="character" :class="{ walking, airborne, climbing, sliding }" :style="{ '--facing': facing }" aria-label="Navi, the playable character" role="img">
    <svg viewBox="0 0 20 32" shape-rendering="crispEdges" aria-hidden="true">
      <path fill="#242d32" d="M6 1h9v2h2v7H4V4h2z"/><path fill="#be8764" d="M6 7h10v8H7v-2H5V9h1z"/><path fill="#e2ac82" d="M8 7h8v5h-2v3H9v-3H7V9h1z"/><path fill="#263037" d="M13 8h2v2h-2zM9 13h5v2H9z"/>
      <path fill="#e5ded0" d="M6 16h9l3 3v7H4v-8z"/><path fill="#a9a99e" d="M4 18h3v7H4zM14 18h3v7h-3z"/><path fill="#dba07a" d="M3 23h4v4H3zM14 23h4v4h-4z"/>
      <g class="leg leg-a"><path fill="#37474b" d="M6 25h5v5H6z"/><path fill="#d2c6ae" d="M5 30h6v2H5z"/></g><g class="leg leg-b"><path fill="#26373d" d="M11 25h4v5h-4z"/><path fill="#ede1c8" d="M11 30h6v2h-6z"/></g>
    </svg>
  </div>
</template>
