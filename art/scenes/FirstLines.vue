<script setup lang="ts">
defineProps<{ active: boolean }>()
</script>
<template>
  <svg viewBox="0 0 600 310" fill="none" shape-rendering="crispEdges" aria-hidden="true">
    <g>
      <rect x="105" y="157" width="9" height="153" fill="#746a52" />
      <polygon
        points="64,158 64,115 81,115 81,93 127,93 127,106 153,106 153,151 135,151 135,172 83,172 83,158"
        fill="#6c8763"
      />
      <polygon
        points="80,123 95,123 95,105 123,105 123,120 140,120 140,145 112,145 112,156 80,156"
        fill="#96a578"
      />
      <rect x="156" y="249" width="108" height="8" fill="#b09a72" />
      <rect x="164" y="257" width="6" height="53" fill="#86765a" />
      <rect x="251" y="257" width="6" height="53" fill="#86765a" />
      <rect x="173" y="179" width="74" height="56" fill="#8fa18b" />
      <rect x="179" y="185" width="62" height="43" :fill="active ? '#80aa92' : '#365b54'" />
      <path
        v-if="active"
        d="M193 197L186 204L193 211M224 197L231 204L224 211M213 195L206 214"
        stroke="#e1d5a6"
        stroke-width="2"
      />
      <rect x="204" y="235" width="11" height="14" fill="#7c927b" />
      <rect x="186" y="244" width="48" height="5" fill="#90a186" />
      <rect x="256" y="218" width="8" height="30" fill="#4a6d5e" />
      <rect x="393" y="272" width="98" height="8" fill="#ac946d" />
      <rect x="401" y="280" width="6" height="30" fill="#7f7056" />
      <rect x="477" y="280" width="6" height="30" fill="#7f7056" />
      <rect x="397" y="249" width="91" height="7" fill="#b6a27d" />
      <rect x="402" y="256" width="5" height="16" fill="#7f7056" />
      <rect x="478" y="256" width="5" height="16" fill="#7f7056" />
    </g>
  </svg>
</template>
