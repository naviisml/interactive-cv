<script setup lang="ts">
import type { Landmark } from '~/data/timeline'
defineProps<{ kind: Landmark; name: string }>()
</script>
<template>
  <svg class="chapter-landmark" viewBox="0 0 320 260" shape-rendering="crispEdges" aria-hidden="true">
    <ellipse cx="166" cy="253" rx="150" ry="7" fill="#132e32" opacity=".25"/>
    <template v-if="kind==='home'">
      <path d="M35 250V97l118-65 116 65v153Z" fill="#ad906c"/><path d="M269 250V97l32 20v133Z" fill="#6b7060"/><path d="M20 105 153 22 285 105l-16 9-116-70-117 70Z" fill="#3b5753"/><path d="m153 22 32-10 130 85-30 8Z" fill="#254449"/>
      <rect x="55" y="110" width="190" height="140" fill="#3e5c57"/><rect x="63" y="120" width="176" height="122" fill="#bfab81"/><path d="M65 122h171v55H65z" fill="#cfbd94"/>
      <path d="M167 132h48v57h-48Z" fill="#466965"/><path d="M190 132v57m-23-30h48" stroke="#e4c899" stroke-width="5"/><path d="M168 134h20v22h-20z" fill="#f4cd84"/>
      <path d="M87 182h92v8H87zm6 8h6v52h-6zm77 0h6v52h-6" fill="#6e6551"/><rect x="105" y="144" width="50" height="33" fill="#324b4e"/><rect x="110" y="149" width="40" height="23" fill="#7aada0"/><path d="m117 155-5 5 5 5m10-10-4 12m9-12 5 5-5 5" fill="none" stroke="#e0dcaf" stroke-width="2"/><rect x="126" y="177" width="6" height="6" fill="#455c57"/><path d="M198 216h27v26h-27z" fill="#a07051"/><path d="m210 216-16-17 13 3-6-21 14 14 10-18-2 25 12-3-15 17" fill="#547957"/>
      <path d="M49 250h214v6H49z" fill="#d0bb8e"/><rect x="78" y="83" width="8" height="150" fill="#b9a17d"/>
    </template>
    <template v-else-if="kind==='cloud'">
      <path d="M36 250V146h219v104Z" fill="#849c9b"/><path d="m255 146 39-22v126h-39Z" fill="#456c74"/><path d="M26 146 65 124h229l-39 22Z" fill="#adbcad"/>
      <path d="M72 124V89l25-37 47-18 48 18 25 37v35Z" fill="#79a6a7" stroke="#c0d2b8" stroke-width="5"/><path d="M144 35v89M97 52l12 72m83-72-12 72M73 89h143" stroke="#d1d8b8" stroke-width="4" fill="none"/>
      <path d="M65 165h150v68H65z" fill="#294951"/><g v-for="n in 4" :key="n" :transform="`translate(${70+n*31} 172)`"><rect width="23" height="53" fill="#426571"/><path d="M4 8h15M4 18h15M4 28h15M4 38h15" stroke="#1f404c" stroke-width="4"/><rect x="4" y="7" width="3" height="3" fill="#e3c48b"/><rect x="4" y="27" width="3" height="3" fill="#94c7b3"/></g>
      <path d="M228 190h20v60h-20z" fill="#334f5b"/><path d="M142 34V13h5v21m-12-21h23v4h-23" fill="#d4bd92"/><path d="M36 249h220v7H36z" fill="#b6ba9a"/>
    </template>
    <template v-else-if="kind==='station'">
      <path d="M26 246h269v9H26z" fill="#c3b88d"/><path d="M55 244V100h9v144m187 0V100h9v144" fill="#547268"/><path d="M20 97h262v12H20z" fill="#a6b49b"/><path d="m20 97 28-20h261l-27 20Z" fill="#d2c39c"/><path d="M282 109V97l27-20v13Z" fill="#728776"/>
      <rect x="81" y="123" width="145" height="70" fill="#25484c"/><rect x="88" y="131" width="131" height="54" fill="#426764"/><g fill="#e3c984"><rect x="98" y="141" width="50" height="4"/><rect x="98" y="154" width="80" height="4"/><rect x="98" y="167" width="61" height="4"/></g><path d="M84 214h145v7H84zm10 7h6v25h-6zm119 0h6v25h-6" fill="#866f53"/>
      <rect x="40" y="144" width="29" height="30" fill="#d8c9a0"/><path d="M54 150v17m-6-11 6-6 6 6" stroke="#3c6864" stroke-width="3" fill="none"/>
    </template>
    <template v-else>
      <path d="M39 250V87h213v163Z" :fill="kind==='hotel' ? '#a9b9a5' : kind==='arcade' ? '#8d8b9d' : '#bca57d'"/><path d="M252 87 291 64v186h-39Z" fill="#55756e"/><path d="M28 87 68 64h233l-39 23Z" fill="#bac5ac"/><path d="M28 87h234v9H28z" fill="#6e8c78"/>
      <path v-if="kind==='school'" d="m28 87 116-60 118 60Z" fill="#536d63"/><rect v-if="kind==='hotel'" x="136" y="23" width="4" height="41" fill="#536e66"/><path v-if="kind==='hotel'" d="M140 23h45v20h-45z" fill="#b99166"/>
      <g v-for="n in 6" :key="n" :transform="`translate(${59+((n-1)%3)*62} ${113+Math.floor((n-1)/3)*52})`"><rect width="36" height="37" fill="#4c6f67"/><rect x="4" y="4" width="28" height="29" :fill="n%3===0 ? '#a8bdab' : '#edca88'"/><path d="M18 4v29M4 20h28" stroke="#7f8d73" stroke-width="3"/><rect y="37" x="-4" width="44" height="5" fill="#d7c59b"/></g>
      <rect x="38" y="199" width="215" height="18" fill="#3d6259"/><text x="146" y="211" text-anchor="middle" fill="#f0deae" font-size="9" font-family="monospace" letter-spacing="1">{{ name.length>27 ? name.slice(0,26) : name }}</text>
      <path d="M129 220h36v30h-36z" fill="#355751"/><path d="M132 222h30v24h-30z" fill="#9fb5a1"/><path d="M146 222v24" stroke="#486a60" stroke-width="3"/>
      <path v-if="kind==='shop'||kind==='arcade'" d="M29 194h234l-10 13H39Z" fill="#ceaa7a"/><g v-if="kind==='arcade'" fill="#d6ad7e"><rect x="62" y="224" width="20" height="26"/><rect x="202" y="224" width="20" height="26"/></g>
      <path d="M37 249h219v7H37z" fill="#d3c29a"/><g stroke="#3b5b51" stroke-width="3" opacity=".3"><path d="m268 104 14-8m-14 36 14-8m-14 36 14-8m-14 36 14-8m-14 36 14-8"/></g>
    </template>
  </svg>
</template>
