<script setup lang="ts">
defineProps<{id:string;active:boolean}>()
</script>
<template>
 <svg viewBox="0 0 600 310" shape-rendering="crispEdges" aria-hidden="true">
  <g v-if="id==='skills-backend'">
   <path d="M176 310V133h74v177Z" fill="#536e69"/><path d="M185 149h55m-55 18h55m-55 18h55m-55 18h55" stroke="#294b4b" stroke-width="8"/>
   <g :fill="active?'#d7c58d':'#8aa18e'"><rect x="188" y="145" width="4" height="4"/><rect x="188" y="163" width="4" height="4"/><rect x="188" y="181" width="4" height="4"/></g>
   <path d="M250 230h65v-48h54" stroke="#a8b39b" stroke-width="4" fill="none"/><path d="M333 168h88v29h-88Z" fill="#a9bba5"/><path d="M333 168v-20q44-19 88 0v20q-44 20-88 0m-88 15q44 20 88 0v34q-44 20-88 0v-34" fill="#6e948b" stroke="#adc1a6" stroke-width="3"/>
   <text x="213" y="123" text-anchor="middle" fill="#e0ddbb" font-family="monospace" font-size="10">API</text><text x="377" y="131" text-anchor="middle" fill="#e0ddbb" font-family="monospace" font-size="10">DATABASE</text><path d="M368 235h18v72h-18Z" fill="#748d77"/>
  </g>
  <g v-else-if="id==='skills-frontend'">
   <path d="M177 310V226h243v84m-250-84h258" stroke="#998362" stroke-width="6" fill="none"/>
   <rect x="181" y="93" width="228" height="116" fill="#345553" stroke="#a5b59a" stroke-width="6"/><path d="M186 109h218" stroke="#91a38c" stroke-width="2"/>
   <rect x="193" y="122" width="64" height="73" fill="#7b9f8d"/><path d="M270 127h119v15H270m0 12h86v7h-86m0 11h112v7H270m0 11h69v7h-69" fill="#c1c7a5"/><path d="M290 211v14m-22 0h57" stroke="#718d7c" stroke-width="5"/>
   <rect x="433" y="155" width="36" height="54" fill="#345553" stroke="#acb69b" stroke-width="4"/><path d="M438 162h26v9h-26m0 8h26v22h-26" fill="#8da78e"/>
  </g>
  <g v-else-if="id==='skills-infrastructure'">
   <path d="m178 310 43-148 43 148m-66-69h47m-57 37h68m-42-98h15" stroke="#8e9986" stroke-width="6" fill="none"/>
   <path d="m215 146-26-31q49-23 69 17l-30 22Z" fill="#b3bca6"/><path d="m225 145 19-28" stroke="#5b7f80" stroke-width="4"/>
   <path d="M365 310v-82h58v82Z" fill="#6b8b85"/><path d="M373 241h42v23h-42Z" :fill="active?'#d4cf98':'#466b6c'"/><path d="M375 275h37m-37 12h37" stroke="#315451" stroke-width="4"/>
   <g :opacity="active?1:.2" fill="none" stroke="#dcc99b" stroke-width="3"><path d="M265 98q39 8 40 46m-31-64q55 10 58 61m-46-80q72 12 77 77"/></g>
  </g>
  <g v-else>
   <path d="M164 310v-79h273v79m-283-79h294" stroke="#948364" stroke-width="6" fill="none"/>
   <rect x="178" y="90" width="245" height="114" fill="#365852" stroke="#9faf93" stroke-width="5"/>
   <g fill="none" stroke="#8eae98" stroke-width="3"><path d="M206 183v-58m0 29h47l22-25h36m-58 25 22 29h115"/></g>
   <g fill="#e0c998"><rect x="201" y="120" width="10" height="10"/><rect x="201" y="149" width="10" height="10"/><rect x="248" y="149" width="10" height="10"/><rect x="306" y="124" width="10" height="10"/><rect x="385" y="178" width="10" height="10"/></g>
   <text x="326" y="132" font-family="monospace" font-size="9" fill="#cdd5ad">feature</text><text x="326" y="169" font-family="monospace" font-size="9" fill="#cdd5ad">main</text>
   <g v-for="(label,i) in ['lint','test','build']" :key="label"><rect :x="187+i*76" y="209" width="66" height="19" :fill="active?'#8fa78b':'#647e6d'"/><text :x="220+i*76" y="197" text-anchor="middle" font-family="monospace" font-size="9" fill="#efdfb5">{{label}}</text></g>
   <path d="M168 271h31v33h-31m232-29h21v29h-21" fill="#718878"/>
  </g>
 </svg>
</template>
