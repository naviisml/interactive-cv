<script setup lang="ts">
defineProps<{id:string;active:boolean;portalReady:boolean}>()
</script>
<template>
 <svg viewBox="0 0 600 310" fill="none" shape-rendering="crispEdges" aria-hidden="true">
  <g v-if="id==='first-lines'">
   <rect x="105" y="157" width="9" height="153" fill="#746a52"/><polygon points="64,158 64,115 81,115 81,93 127,93 127,106 153,106 153,151 135,151 135,172 83,172 83,158" fill="#6c8763"/><polygon points="80,123 95,123 95,105 123,105 123,120 140,120 140,145 112,145 112,156 80,156" fill="#96a578"/>
   <rect x="156" y="249" width="108" height="8" fill="#b09a72"/><rect x="164" y="257" width="6" height="53" fill="#86765a"/><rect x="251" y="257" width="6" height="53" fill="#86765a"/>
   <rect x="173" y="179" width="74" height="56" fill="#8fa18b"/><rect x="179" y="185" width="62" height="43" :fill="active?'#80aa92':'#365b54'"/><path v-if="active" d="M193 197L186 204L193 211M224 197L231 204L224 211M213 195L206 214" stroke="#e1d5a6" stroke-width="2"/>
   <rect x="204" y="235" width="11" height="14" fill="#7c927b"/><rect x="186" y="244" width="48" height="5" fill="#90a186"/><rect x="256" y="218" width="8" height="30" fill="#4a6d5e"/>
   <rect x="393" y="272" width="98" height="8" fill="#ac946d"/><rect x="401" y="280" width="6" height="30" fill="#7f7056"/><rect x="477" y="280" width="6" height="30" fill="#7f7056"/><rect x="397" y="249" width="91" height="7" fill="#b6a27d"/><rect x="402" y="256" width="5" height="16" fill="#7f7056"/><rect x="478" y="256" width="5" height="16" fill="#7f7056"/>
  </g>
  <g v-else-if="id==='gmodstore'">
   <polygon points="123,310 123,200 139,200 139,177 156,177 156,158 224,158 224,177 241,177 241,200 257,200 257,310 236,310 236,207 220,181 160,181 144,207 144,310" fill="#61747c"/>
   <polyline points="137,199 151,199 151,180 166,180 166,169 215,169 215,180 230,180 230,199 244,199" stroke="#a4afb0" stroke-width="7"/>
   <polygon points="148,310 148,209 163,185 217,185 232,209 232,310" :fill="portalReady?'#8e9db4':'#36575f'"/>
   <path v-if="portalReady" d="M173 202L205 226L179 255L210 280L184 307" stroke="#d2c5df" stroke-width="5" class="portal-light"/>
   <rect x="391" y="241" width="66" height="69" fill="#4e6770"/><rect x="385" y="192" width="78" height="49" fill="#8b8b9b"/><rect x="392" y="199" width="64" height="30" :fill="portalReady?'#cbb7d4':'#526c78'"/><rect x="398" y="205" width="52" height="18" fill="#9db5ac"/>
   <path d="M403 258H425M414 247V270" stroke="#d9c89c" stroke-width="4"/><circle cx="443" cy="260" r="5" fill="#ceaa88"/><rect x="401" y="292" width="44" height="6" fill="#2b4b52"/>
  </g>
  <g v-else-if="id==='get-e'">
   <rect x="102" y="303" width="398" height="7" fill="#657b72"/><path d="M112 299H149M164 299H200M215 299H251" stroke="#e0d4ae" stroke-width="2"/>
   <polygon points="113,264 233,264 267,277 233,290 127,290 108,244 119,244 135,264" fill="#cdd6c1"/><polygon points="163,266 193,225 207,225 193,266" fill="#b6c4b3"/><polygon points="172,286 210,308 191,308 155,286" fill="#94b1a7"/>
   <polygon points="231,269 247,275 231,279 218,279 218,269" fill="#537c81"/><path d="M146 274H152M160 274H166M174 274H180M188 274H194" stroke="#64868a" stroke-width="4"/><rect x="140" y="289" width="4" height="12" fill="#56726b"/><rect x="234" y="289" width="4" height="12" fill="#56726b"/><circle cx="142" cy="303" r="7" fill="#34564e"/><circle cx="236" cy="303" r="7" fill="#34564e"/>
   <polygon points="367,267 427,267 460,283 460,302 367,302" fill="#91a98f"/><rect x="374" y="274" width="36" height="15" fill="#c6d0b2"/><polygon points="418,274 426,274 447,284 418,284" fill="#c6d0b2"/><circle cx="383" cy="302" r="8" fill="#34564e"/><circle cx="446" cy="302" r="8" fill="#34564e"/><rect x="468" y="278" width="26" height="26" fill="#b7a178"/><rect x="474" y="273" width="14" height="6" fill="#8c8162"/><circle cx="473" cy="307" r="3" fill="#4d6757"/><circle cx="489" cy="307" r="3" fill="#4d6757"/>
   <rect x="112" y="204" width="4" height="60" fill="#8a9274"/><polygon points="116,205 146,212 116,220" fill="#c6ac7f"/>
  </g>
  <g v-else-if="id==='fletcher'">
   <rect x="110" y="291" width="137" height="19" fill="#819a89"/><rect x="117" y="296" width="123" height="9" fill="#84b2a4"/><rect x="172" y="234" width="16" height="57" fill="#a0b09a"/>
   <polygon points="145,230 214,230 207,243 152,243" fill="#b3c0a4"/><rect x="151" y="230" width="57" height="4" fill="#87b5aa"/><rect x="177" y="199" width="6" height="31" fill="#acbba0"/><ellipse cx="180" cy="197" rx="23" ry="6" fill="#c4cdb0"/>
   <g class="fountain-water" stroke="#c2d8bf" stroke-width="2" :opacity="active?1:.35"><path d="M174 196Q150 178 140 296M186 196Q211 178 220 296M180 191V172"/></g>
   <polygon points="364,228 379,214 486,214 500,228" fill="#c9ba90"/><rect x="369" y="228" width="6" height="82" fill="#8e8263"/><rect x="489" y="228" width="6" height="82" fill="#8e8263"/>
   <rect x="383" y="278" width="99" height="7" fill="#b19b70"/><rect x="390" y="285" width="5" height="25" fill="#887b5a"/><rect x="470" y="285" width="5" height="25" fill="#887b5a"/><rect x="388" y="259" width="89" height="6" fill="#baa881"/><rect x="391" y="265" width="4" height="13" fill="#887b5a"/><rect x="469" y="265" width="4" height="13" fill="#887b5a"/>
   <rect x="333" y="282" width="22" height="26" fill="#aa8a63"/><path d="M338 282V275H350V282M343 286V304" stroke="#6d684d" stroke-width="2"/><circle cx="337" cy="308" r="2" fill="#45614d"/><circle cx="351" cy="308" r="2" fill="#45614d"/>
  </g>
  <g v-else-if="id==='q-lite'">
   <polygon points="108,173 127,157 255,157 267,173" fill="#b2bd9f"/><rect x="119" y="173" width="5" height="137" fill="#698675"/><rect x="250" y="173" width="5" height="137" fill="#698675"/>
   <rect x="139" y="189" width="93" height="74" fill="#315751"/><rect x="146" y="197" width="79" height="58" fill="#648774"/>
   <text x="154" y="213" fill="#e4d3a1" font-family="monospace" font-size="9">12  3 min</text><text x="154" y="229" fill="#e4d3a1" font-family="monospace" font-size="9">24  8 min</text><rect x="153" y="242" width="45" height="3" fill="#b7c39b"/>
   <rect x="158" y="281" width="53" height="5" fill="#a7ab87"/><rect x="167" y="286" width="4" height="24" fill="#637e69"/><rect x="201" y="286" width="4" height="24" fill="#637e69"/>
   <rect x="390" y="269" width="102" height="7" fill="#a5a47d"/><rect x="397" y="276" width="5" height="34" fill="#6f8265"/><rect x="479" y="276" width="5" height="34" fill="#6f8265"/><rect x="395" y="249" width="91" height="6" fill="#afaf88"/><rect x="397" y="255" width="5" height="14" fill="#6f8265"/><rect x="479" y="255" width="5" height="14" fill="#6f8265"/>
   <rect x="386" y="178" width="5" height="132" fill="#78917a"/><rect x="372" y="178" width="32" height="36" fill="#7c9b84"/><polygon points="380,193 386,193 394,187 394,205 386,199 380,199" fill="#d9d8b0"/><path d="M400 191Q405 197 400 203" stroke="#d9d8b0" stroke-width="2"/>
  </g>
  <g v-else-if="id==='shopify'">
   <g v-for="(x,i) in [108,365]" :key="x"><rect :x="x+5" y="213" width="5" height="97" fill="#8b795a"/><rect :x="x+117" y="213" width="5" height="97" fill="#8b795a"/><polygon :points="`${x},213 ${x+19},179 ${x+109},179 ${x+128},213`" :fill="i?'#b28e72':'#88a07c'"/><rect :x="x" y="213" width="128" height="10" :fill="i?'#c7a483':'#a9b596'"/><rect :x="x+6" y="272" width="116" height="8" fill="#b7a37c"/><g v-for="n in 4" :key="n"><rect :x="x+17+(n-1)*24" y="250" width="18" height="22" :fill="n%2?'#d0bd8f':'#9eaf89'"/><rect :x="x+21+(n-1)*24" y="246" width="10" height="4" fill="#879774"/></g><rect :x="x+12" y="280" width="104" height="20" fill="#927e5d"/><path :d="`M${x+22} 287h84m-84 7h84`" stroke="#b1a078" stroke-width="2"/></g>
  </g>
  <g v-else-if="id==='fifty-five'">
   <rect x="126" y="155" width="129" height="110" fill="#a5b297"/><rect x="132" y="161" width="117" height="98" fill="#436759"/><rect x="142" y="173" width="42" height="52" fill="#c5bb93"/><rect x="190" y="173" width="49" height="10" fill="#d9c79d"/><rect x="190" y="191" width="44" height="4" fill="#9eb492"/><rect x="190" y="203" width="38" height="4" fill="#9eb492"/><g v-for="(colour,i) in ['#c7b08d','#84a08c','#6b8b7b','#d3c79f']" :key="i"><rect :x="143+i*24" y="236" width="19" height="12" :fill="colour"/></g><rect x="138" y="265" width="5" height="45" fill="#768c70"/><rect x="239" y="265" width="5" height="45" fill="#768c70"/>
   <rect x="389" y="270" width="108" height="8" fill="#af9970"/><rect x="397" y="278" width="5" height="32" fill="#8a7858"/><rect x="484" y="278" width="5" height="32" fill="#8a7858"/><rect x="396" y="246" width="94" height="7" fill="#baa780"/><rect x="397" y="253" width="5" height="17" fill="#8a7858"/><rect x="484" y="253" width="5" height="17" fill="#8a7858"/><rect x="350" y="285" width="28" height="25" fill="#9a8a65"/><path d="M364 285V254M364 267L352 255M364 274L377 260" stroke="#8da075" stroke-width="5"/>
  </g>
  <g v-else-if="id==='aquablu'">
   <rect x="122" y="202" width="96" height="108" fill="#a4bdb0"/><rect x="130" y="210" width="80" height="91" fill="#7b9f96"/><rect x="143" y="222" width="54" height="29" fill="#c3d1b9"/><rect x="139" y="263" width="61" height="31" fill="#476e65"/><rect x="151" y="278" width="10" height="16" fill="#a5c8bd"/><rect x="177" y="278" width="10" height="16" fill="#a5c8bd"/>
   <rect x="399" y="222" width="78" height="77" fill="#7aa295"/><ellipse cx="438" cy="299" rx="39" ry="11" fill="#658d7c"/><ellipse cx="438" cy="222" rx="39" ry="11" fill="#bed0b5"/><ellipse cx="438" cy="222" rx="31" ry="6" fill="#8db9ac"/><path d="M399 246Q438 266 477 246M399 272Q438 292 477 272" stroke="#abc8af" stroke-width="3"/>
   <path d="M218 297H347V275H399" stroke="#82aa9a" stroke-width="7"/><circle cx="346" cy="297" r="10" fill="#537f71"/><path d="M340 297H352M346 291V303" stroke="#d0d7ac" stroke-width="2"/>
  </g>
  <g v-else-if="id==='appjection'">
   <rect x="155" y="117" width="290" height="88" fill="#92a88f"/><rect x="160" y="122" width="280" height="78" fill="#355a51"/><path d="M195 154H405M300 154V185" stroke="#9eb99b" stroke-width="3"/>
   <g v-for="(x,i) in [195,300,405]" :key="x"><rect :x="x-18" y="133" width="36" height="34" :fill="['#a7bea0','#b6a9be','#c7ae88'][i]"/><text :x="x" y="154" fill="#35564c" font-size="11" text-anchor="middle" font-family="monospace">{{['A','B','C'][i]}}</text></g>
   <rect x="266" y="177" width="68" height="15" fill="#85a38a"/><text x="300" y="188" text-anchor="middle" font-size="8" font-family="monospace" fill="#e6ddb6">PLATFORM</text><rect x="165" y="205" width="5" height="105" fill="#73866a"/><rect x="430" y="205" width="5" height="105" fill="#73866a"/>
   <rect x="110" y="264" width="35" height="46" fill="#637e6b"/><rect x="455" y="254" width="39" height="56" fill="#637e6b"/><path d="M116 275H138M116 285H138M462 269H487M462 280H487" stroke="#2e554b" stroke-width="4"/>
  </g>
  <g v-else-if="id==='navel-development'">
   <rect x="117" y="251" width="147" height="9" fill="#b29a72"/><rect x="126" y="260" width="6" height="50" fill="#847559"/><rect x="251" y="260" width="6" height="50" fill="#847559"/>
   <rect x="133" y="174" width="112" height="66" fill="#94aa91"/><rect x="139" y="180" width="100" height="53" fill="#31574e"/><path d="M150 192H179M150 202H219M150 212H207M150 222H193" stroke="#b1c19c" stroke-width="3"/><rect x="182" y="240" width="15" height="11" fill="#7d967b"/>
   <rect x="385" y="187" width="107" height="123" fill="#7f9679"/><rect x="393" y="195" width="91" height="29" fill="#375c4c"/><rect x="393" y="233" width="91" height="29" fill="#436753"/><rect x="393" y="271" width="91" height="30" fill="#375c4c"/><path d="M418 207H458M418 246H458M418 285H458" stroke="#c0b58c" stroke-width="3"/>
  </g>
  <g v-else-if="id==='navel-cloud'">
   <g v-for="x in [110,411]" :key="x"><rect :x="x" y="178" width="79" height="132" fill="#547d6c"/><polygon :points="`${x},178 ${x+9},170 ${x+88},170 ${x+79},178`" fill="#9bad8e"/><polygon :points="`${x+79},178 ${x+88},170 ${x+88},310 ${x+79},310`" fill="#325a4d"/><g v-for="n in 4" :key="n"><rect :x="x+7" :y="186+(n-1)*29" width="65" height="23" fill="#365e50"/><rect :x="x+13" :y="193+(n-1)*29" width="4" height="4" :fill="active?'#ead09a':'#8da887'"/><path :d="`M${x+24} ${196+(n-1)*29}h38`" stroke="#7f9e7c" stroke-width="2"/></g></g>
   <path d="M198 300H402M225 300V180H375V300M300 180V147" stroke="#8bad89" stroke-width="4"/>
   <polygon points="260,147 260,128 272,128 272,115 293,115 293,108 314,108 314,120 335,120 335,134 346,134 346,147" fill="#b8cab0"/><rect x="293" y="133" width="16" height="8" fill="#5f8d76"/>
  </g>
  <g v-else-if="id==='contact'">
   <rect x="130" y="295" width="103" height="7" fill="#836c4e"/><polygon points="151,294 162,272 173,278 182,250 194,273 204,263 216,294" :fill="active?'#d2a96c':'#8b8965'"/><polygon points="169,294 179,278 185,286 191,271 203,294" fill="#e6c58b"/>
   <rect x="389" y="273" width="107" height="8" fill="#ad9970"/><rect x="398" y="281" width="5" height="29" fill="#827357"/><rect x="480" y="281" width="5" height="29" fill="#827357"/><rect x="394" y="249" width="96" height="7" fill="#b9a77d"/><rect x="398" y="256" width="5" height="17" fill="#827357"/><rect x="480" y="256" width="5" height="17" fill="#827357"/>
   <rect x="345" y="202" width="6" height="108" fill="#7c8264"/><rect x="327" y="179" width="45" height="29" fill="#92a78c"/><rect x="333" y="185" width="32" height="17" fill="#d7cba4"/><polyline points="333,185 349,195 365,185" stroke="#8d9876" stroke-width="2"/>
  </g>
 </svg>
</template>
<style scoped>
.portal-light{animation:portal-light 1.8s ease-in-out infinite alternate}.fountain-water{animation:water-light 1.5s ease-in-out infinite alternate}@keyframes portal-light{to{opacity:.45}}@keyframes water-light{to{opacity:.5}}@media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
