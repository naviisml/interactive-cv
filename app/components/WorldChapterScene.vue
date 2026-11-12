<script setup lang="ts">
import {sceneLayout} from '~/data/sceneLayout'
const props=defineProps<{id:string;active:boolean;paused:boolean;playerX:number;playerY:number;velocity:number}>()
const emit=defineEmits<{unlockRoute:[];status:[message:string]}>()
const portalReady=useState('portal-ready',()=>false)
const switched=computed(()=>props.id==='gmodstore'?portalReady.value:props.active)
function unlockPortal(){portalReady.value=true;emit('unlockRoute')}
const scene=computed(()=>props.id.startsWith('skills-')?props.id:props.id)
const school=computed(()=>['panta-rhei','roc-hilversum','coding-college'].includes(scene.value))
</script>
<template>
 <div class="world-chapter" :class="{'is-powered':switched,'is-near':active,'is-paused':paused}" :data-scene="scene" :style="{left:`${-sceneLayout.originX}px`,width:`${sceneLayout.width}px`,height:`${sceneLayout.height}px`}">
 <SchoolWorldScene v-if="school" :id="id" :active="active" :paused="paused" :player-x="playerX" :player-y="playerY" :velocity="velocity" @status="emit('status',$event)" />
 <SkillsWorldScene v-else-if="scene.startsWith('skills-')" :id="scene" :active="active"/>
 <svg v-else viewBox="0 0 600 310" shape-rendering="crispEdges" aria-hidden="true">
  <!-- The scene is a place on the trail, with a clear path through its centre. -->
  <g v-if="scene==='first-lines'||scene==='contact'">
   <path d="M90 300V125h12v175" fill="#6a6250"/><path d="M96 160 55 118m43 52 46-70" stroke="#6a6250" stroke-width="9"/><path d="M24 114V74h25V45h65v18h39v44h-25v31H55v-24Z" fill="#6e8866"/><path d="M47 76h31V55h35v23h27v24H92v15H47Z" fill="#95a17a"/>
   <path d="M365 280h112v9H365m9 0v20m90-20v20m-90-40h90v-9h-90Z" fill="#9b7b58" stroke="#655e49" stroke-width="4"/>
   <template v-if="scene==='first-lines'">
    <path d="M167 236h139v9H167m9 0v64m119-64v64" stroke="#7e7056" stroke-width="6" fill="none"/><rect x="195" y="179" width="77" height="52" fill="#344c50"/><rect x="202" y="186" width="63" height="37" :fill="switched?'#91c8b3':'#536b68'"/><path v-if="switched" d="m214 196-8 7 8 7m25-14 8 7-8 7m-11-16-6 20" stroke="#e7e7bc" stroke-width="3" fill="none"/><path d="M230 230v6m-20 0h47" stroke="#344c50" stroke-width="5"/><path d="M182 251h35v9h-35m0 0v47m30-47v47" stroke="#5b6b5a" stroke-width="5"/><rect x="275" y="202" width="20" height="34" fill="#526b65"/>
   </template>
   <template v-else><path d="m235 304 44-11m-43-1 46 13" stroke="#7b6048" stroke-width="9"/><path class="fire" d="m242 292 10-29 9 13 8-33 10 28 9-10 4 32Z" :fill="switched?'#d5a55f':'#8b8061'"/><path d="M331 309V207h7v102" fill="#786b51"/><rect x="319" y="190" width="44" height="27" rx="3" fill="#91a18a"/><path d="M334 196h22v13h-22z" fill="#e5d4ab"/></template>
  </g>
  <g v-else-if="scene==='gmodstore'">
   <path d="M133 307V192h18v-29h20v-17h20v-13h68v13h20v17h20v29h18v115h-35V199l-19-27h-57l-20 27v108Z" fill="#66747c"/><path d="M151 192h17v-22h24v-21h66v21h24v22h17" fill="none" stroke="#9da1a1" stroke-width="8"/>
   <path class="portal" d="M189 305V202l18-25h45l19 25v103Z" :fill="switched?'#8da0b5':'#455e65'"/><path v-if="switched" d="m211 205 23 20-18 26 29 20-17 31" stroke="#d2c3d9" stroke-width="6" fill="none" class="portal-stream"/>
   <path d="M346 307v-68h44v68Z" fill="#475c67"/><path d="M340 239v-30h54v30Z" fill="#7e8291"/><path d="M348 215h38v18h-38Z" :fill="switched?'#dcc1a5':'#9db3ad'"/><path d="M352 254h23m-12-7v14" stroke="#c9bb9f" stroke-width="4"/><path d="M98 306h30v-22H98m218 22h20v-14h-20" fill="#819185"/>
   <g :opacity="switched?1:.25" fill="#ddcbb0"><rect x="190" y="107" width="8" height="8"/><rect x="282" y="120" width="6" height="6"/><rect x="238" y="84" width="9" height="9"/></g>
  </g>
  <g v-else-if="scene==='get-e'">
   <path d="M91 304h416v6H91Z" fill="#747f78"/><path d="M100 295h40m25 0h40m25 0h40m25 0h40m25 0h40m25 0h40" stroke="#dfd7b7" stroke-width="3"/>
   <g class="aeroplane"><path d="m172 222 136-1 29 12-24 12H184l-27-37h14l19 17m45 2 33-51h17l-15 51m-34 13 44 32h-19l-47-32" fill="#d8dbc7"/><path d="M284 228h30l9 5h-39Z" fill="#638b92"/><path d="M196 229h6m8 0h6m8 0h6m8 0h6m8 0h6" stroke="#638b92" stroke-width="4"/><circle cx="202" cy="250" r="5" fill="#4a5b58"/><circle cx="292" cy="250" r="5" fill="#4a5b58"/></g>
   <g><path d="M361 282v-33h54l21 20v24h-75Z" fill="#889e93"/><path d="M396 253h16l16 16h-32Z" fill="#c4d4bb"/><circle cx="374" cy="293" r="9" fill="#40564f"/><circle cx="422" cy="293" r="9" fill="#40564f"/><path d="M443 294h44v-21h-44m8 22v7m29-7v7" fill="#b69d72"/></g>
   <path d="M114 270V188m0 0 45 11-45 9" stroke="#a58c65" stroke-width="4" fill="#c0a17a"/>
  </g>
  <g v-else-if="scene==='fletcher'||scene==='fifty-five'">
   <path d="M126 306h337" stroke="#b8ba9a" stroke-width="6"/><path d="M140 270h122v26H140Z" fill="#7fa7a0"/><path d="M149 277h102m-89 11h70" stroke="#bdd0b5" stroke-width="3" class="water-lines"/>
   <path d="M204 265v-48m-25 0h51l-7 15h-36Z" stroke="#b8ad8a" fill="#a6b7a5" stroke-width="5"/><path class="fountain" d="M192 216q-12-43-25 12m37-12v-53m12 53q13-43 26 12" fill="none" stroke="#b4d5c5" stroke-width="3" :opacity="switched?1:.15"/>
   <path d="M320 230h116m-106 0v76m96-76v76m-115-76 17-18h102l17 18Z" stroke="#8f7f60" fill="#c7b78c" stroke-width="5"/><path d="M339 282h70m-64 0v23m58-23v23" stroke="#b29a71" stroke-width="5"/>
   <path d="M278 280h24v27h-24Z" fill="#a38562"/><path d="M284 280v-8h12v8m-7 4v19" stroke="#665f4b" stroke-width="3" fill="none"/><path d="M100 308v-56m0 16-15-18m15 8 17-18" stroke="#6d8864" stroke-width="6"/>
  </g>
  <g v-else-if="scene==='q-lite'">
   <path d="M120 305h355v-16H120Z" fill="#7a7967"/><path d="M138 288V126h320v162m-320-135 28-27m-28 61 62-61m258 27-28-27m28 61-62-61" stroke="#647e75" stroke-width="6" fill="none"/>
   <g v-for="x in [171,272,421]" :key="x"><path :d="`M${x} 132v15`" stroke="#6c7260" stroke-width="6"/><rect :x="x-10" y="145" width="20" height="17" fill="#516763"/><path class="stage-beam" :d="`m${x-7} 161-55 126h124l-55-126Z`" fill="#e5cc92" :opacity="switched?.35:.04"/></g>
   <g v-for="x in [151,418]" :key="x"><rect :x="x" y="233" width="35" height="55" fill="#3e5556"/><circle :cx="x+17" cy="269" r="11" fill="#233e44"/><circle :cx="x+17" cy="245" r="5" fill="#233e44"/></g><path d="M237 266h111v22H237m14-22v-21h84v21" fill="#938b76"/><path d="M264 252h55" stroke="#d3c394" stroke-width="3"/>
  </g>
  <g v-else-if="scene==='shopify'">
   <g v-for="(x,i) in [116,355]" :key="x"><path :d="`M${x} 305V190h112v115`" stroke="#85765b" stroke-width="5" fill="none"/><path :d="`m${x-10} 190 20-38h90l20 38Z`" :fill="i?'#b08e77':'#869d7b'"/><path :d="`M${x} 252h112v12H${x}Z`" fill="#b7a47a"/><rect v-for="n in 4" :key="n" :x="x+n*22-12" y="232" width="15" height="20" :fill="n%2?'#d3be8e':'#9aaf91'"/><path v-if="switched" :d="`M${x+30} 204h51v18h-51Z`" fill="#ddccaa"/></g>
   <path d="m274 275 8 24h33l9-24Z" fill="#87988a"/><path d="M281 300h37m-27-23-8-15h-12" stroke="#6d7c6b" stroke-width="3"/><circle cx="288" cy="306" r="4" fill="#53665a"/><circle cx="313" cy="306" r="4" fill="#53665a"/>
  </g>
  <g v-else-if="scene==='aquablu'">
   <path d="M102 295h373v15H102Z" fill="#80aaa3"/><path d="M113 302h54m31 0h48m30 0h62m30 0h79" stroke="#bed0b5" stroke-width="2"/>
   <g class="waterwheel"><circle cx="229" cy="255" r="46" fill="none" stroke="#a38c65" stroke-width="9"/><path d="M183 255h92m-46-46v92m-33-79 66 66m0-66-66 66" stroke="#947f5d" stroke-width="6"/><circle cx="229" cy="255" r="10" fill="#5d756d"/></g>
   <path d="M343 288V205h43v83Z" fill="#b2c5bb" stroke="#668b89" stroke-width="5"/><path d="M349 259h31v22h-31Z" fill="#86b6b0"/><path d="M365 205v-29h-69v29m90 51h40v42" fill="none" stroke="#789b95" stroke-width="8"/><path d="M335 293h60" stroke="#668b89" stroke-width="6"/><circle cx="365" cy="231" r="7" :fill="switched?'#dbd09a':'#7f9e91'"/>
  </g>
  <g v-else-if="scene==='appjection'">
   <path d="M122 305h360" stroke="#95a38b" stroke-width="5"/>
   <path d="M154 305V219m132 86V173m131 132V231" stroke="#737e69" stroke-width="8"/>
   <path d="M118 217h77v13h-77m129-59h79v13h-79m52 50h78v13h-78" fill="#b8b193"/>
   <path d="m192 222 57-45m75 0 54 64" :stroke="switched?'#dbc88c':'#7c9387'" stroke-width="5" fill="none"/>
   <g v-for="(p,i) in [[149,194],[278,148],[406,209]]" :key="i"><path :d="`M${p[0]-13} ${p[1]-28}h32v40h-32Z`" :fill="['#89a69a','#9990a6','#c0a77e'][i]"/><rect :x="p[0]-6" :y="p[1]-21" width="18" height="18" :fill="switched?'#ead4a0':'#536f70'"/></g>
   <path v-if="switched" class="data-pulse" d="m192 222 57-45h75l54 64" stroke="#ecdbac" stroke-width="4" stroke-dasharray="7 18" fill="none"/>
  </g>
  <g v-else>
   <!-- Open-air invention gardens: systems become objects rather than office façades. -->
   <path d="M126 306h343" stroke="#8a9f83" stroke-width="5"/>
   <template v-if="scene==='navel-development'">
    <path d="M150 258h181v10H150m13 0v40m151-40v40" stroke="#9e8964" stroke-width="6" fill="none"/><path d="M177 258v-61h123v61Z" fill="#415f60"/><path d="M185 205h107v45H185Z" :fill="switched?'#b4c4ac':'#77998e'"/><path :d="switched?'M195 214h24v25h-24m33-25h54v8h-54m0 9h40v8h-40':'M196 216h72m-72 12h46m-46 12h60'" stroke="#e2d2a9" stroke-width="4"/><path d="M353 306v-93h65v93Z" fill="#9ca78c"/><path d="M365 234h41m-41 21h41m-41 21h41" stroke="#677c67" stroke-width="3"/><path d="m367 216 14-21 12 21" stroke="#a28b63" stroke-width="5" fill="none"/>
   </template>
   <template v-else>
    <path d="M166 284h79m0 0v-68h83v68h72m-114-68v-67" stroke="#8aa999" stroke-width="6" fill="none"/>
    <g v-for="(x,i) in [149,265,381]" :key="x" :transform="`translate(${x} ${i===1?146:225})`"><path d="M0 0h47v78H0Z" :fill="i===1?'#6b8391':'#527773'"/><path d="M6 12h35m-35 15h35m-35 15h35m-35 15h35" stroke="#304e56" stroke-width="5"/><g class="network-lights" :fill="switched?'#e9d19b':'#91a996'"><rect x="8" y="9" width="4" height="4"/><rect x="8" y="24" width="4" height="4"/><rect x="8" y="39" width="4" height="4"/><rect x="8" y="54" width="4" height="4"/></g></g>
    <path d="M289 146v-30m-15-7 15 9 15-9m-24-13 9 7 9-7" fill="none" stroke="#bdab83" stroke-width="4" class="signal"/>
    <path d="M112 303v-44m0 0-16-16m16 28 17-21m332 53v-37m0 0-12-15" stroke="#78936e" stroke-width="5"/>
    <path v-if="switched" class="data-pulse" d="M171 284h74v-68h42v-68" fill="none" stroke="#e3cf99" stroke-width="4" stroke-dasharray="9 23"/>
   </template>
  </g>
 </svg>
 <PortalWorldActivity v-if="scene==='gmodstore'" :active="active" :paused="paused" :player-x="playerX" :player-y="playerY" @unlock="unlockPortal" @status="emit('status',$event)"/>
 <a v-if="scene==='contact'" class="mailbox-link" href="mailto:contact@navel.dev" :tabindex="active?0:-1" aria-label="Email Navi at contact@navel.dev">contact@navel.dev ↗</a>
 </div>
</template>
<style scoped>
.mailbox-link{position:absolute;left:323px;bottom:96px;pointer-events:auto;font-size:10px;background:#e5ddc4;padding:5px 8px;white-space:nowrap;opacity:0}.is-near .mailbox-link,.mailbox-link:focus-visible{opacity:1}
.world-chapter{position:absolute;bottom:0;pointer-events:none}.world-chapter>svg{width:100%;height:100%;overflow:visible}.is-powered .portal-stream{animation:portal 1.8s ease-in-out infinite alternate}.is-powered .aeroplane{animation:takeoff 4s cubic-bezier(.5,0,.4,1) forwards}.is-powered .waterwheel{transform-origin:229px 255px;animation:wheel 7s linear infinite}.is-powered .water-lines,.is-powered .fountain{animation:shimmer 1s ease-in-out infinite alternate}.is-powered .data-pulse{animation:pulse 1.4s linear infinite}.is-powered .network-lights{animation:shimmer 1.2s steps(2) infinite}.is-powered .fire{animation:shimmer .4s steps(2) infinite alternate}.is-powered .signal{animation:shimmer 1.6s ease-in-out infinite}.is-powered .stage-beam{animation:shimmer 1.4s ease-in-out infinite alternate}
@keyframes takeoff{0%{transform:translate(0,0)}25%{transform:translate(35px,0)}100%{transform:translate(570px,-210px)}}@keyframes portal{to{opacity:.3;transform:translateY(-5px)}}@keyframes wheel{to{transform:rotate(360deg)}}@keyframes shimmer{from{opacity:.45}to{opacity:1}}@keyframes pulse{to{stroke-dashoffset:-64}}
.world-chapter:not(.is-near) *,.world-chapter.is-paused *{animation-play-state:paused!important}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}.is-powered .aeroplane{transform:translate(120px,-50px)}}
</style>
