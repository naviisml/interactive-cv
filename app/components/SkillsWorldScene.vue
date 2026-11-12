<script setup lang="ts">
defineProps<{id:string;active:boolean}>()
</script>
<template>
 <svg viewBox="0 0 600 310" fill="none" shape-rendering="crispEdges" aria-hidden="true">
  <g v-if="id==='skills-backend'">
   <!-- Two complete grounded objects, with the walking lane between them. -->
   <polygon points="116,182 210,182 222,173 128,173" fill="#92a38b"/>
   <polygon points="210,182 222,173 222,310 210,310" fill="#2d4948"/>
   <rect x="116" y="182" width="94" height="128" fill="#4d6c66"/>
   <rect x="122" y="189" width="82" height="113" fill="#304e4b"/>
   <g v-for="n in 5" :key="n"><rect x="128" :y="194+(n-1)*20" width="70" height="16" fill="#5f8072"/><rect x="134" :y="199+(n-1)*20" width="5" height="5" :fill="active?'#ead299':'#92a28b'"/><path :d="`M148 ${201+(n-1)*20}h40m-40 5h40`" stroke="#294b49" stroke-width="2"/></g>
   <rect x="126" y="302" width="7" height="8" fill="#243f3b"/><rect x="196" y="302" width="7" height="8" fill="#243f3b"/>
   <path d="M222 298H344V272H382" stroke="#899f82" stroke-width="5"/>
   <rect x="382" y="202" width="100" height="96" fill="#74988b"/>
   <ellipse cx="432" cy="298" rx="50" ry="12" fill="#688b7c"/>
   <ellipse cx="432" cy="202" rx="50" ry="12" fill="#9ab6a0"/>
   <ellipse cx="432" cy="202" rx="42" ry="8" fill="#4b776d"/>
   <path d="M382 225Q432 249 482 225M382 251Q432 275 482 251M382 277Q432 301 482 277" stroke="#b1c2a4" stroke-width="3"/>
   <rect x="390" y="215" width="4" height="71" fill="#aec2a2" opacity=".45"/>
   <text x="163" y="165" fill="#e6dfbf" font-size="10" text-anchor="middle" font-family="monospace">API</text><text x="432" y="177" fill="#e6dfbf" font-size="10" text-anchor="middle" font-family="monospace">DATABASE</text>
  </g>
  <g v-else-if="id==='skills-frontend'">
   <rect x="110" y="247" width="154" height="9" fill="#ac9470"/><rect x="119" y="256" width="6" height="54" fill="#82745b"/><rect x="248" y="256" width="6" height="54" fill="#82745b"/>
   <rect x="126" y="141" width="126" height="91" fill="#9bac94"/><rect x="132" y="147" width="114" height="78" fill="#2d4f50"/>
   <rect x="138" y="154" width="102" height="9" fill="#6a9382"/><rect x="138" y="170" width="28" height="47" fill="#86a68f"/>
   <rect x="173" y="170" width="67" height="12" fill="#d6c89e"/><rect x="173" y="189" width="53" height="4" fill="#a8b99c"/><rect x="173" y="200" width="61" height="4" fill="#a8b99c"/><rect x="173" y="210" width="41" height="4" fill="#a8b99c"/>
   <rect x="181" y="232" width="13" height="15" fill="#80957e"/><rect x="160" y="241" width="54" height="6" fill="#819880"/>
   <rect x="388" y="281" width="103" height="9" fill="#a68e68"/><rect x="398" y="290" width="6" height="20" fill="#82745b"/><rect x="475" y="290" width="6" height="20" fill="#82745b"/>
   <rect x="406" y="189" width="52" height="92" fill="#a6b79a"/><rect x="412" y="198" width="40" height="70" fill="#355a56"/><rect x="417" y="205" width="30" height="15" fill="#c7be95"/><rect x="417" y="228" width="30" height="34" fill="#86a68f"/><rect x="427" y="273" width="10" height="3" fill="#5f7d6b"/>
  </g>
  <g v-else-if="id==='skills-infrastructure'">
   <path d="M116 308L169 163L214 308M131 264H199M143 225H185M155 189H174" stroke="#a4af93" stroke-width="6"/>
   <rect x="110" y="304" width="22" height="6" fill="#687f69"/><rect x="198" y="304" width="22" height="6" fill="#687f69"/>
   <polygon points="136,132 198,111 193,140 169,163" fill="#95aa94"/><polygon points="136,132 157,148 169,163 153,155" fill="#607f72"/><path d="M169 145L186 120" stroke="#3f6760" stroke-width="4"/>
   <g :opacity="active?1:.3" stroke="#ded1a4" stroke-width="3"><path d="M214 108Q239 117 243 141M224 88Q261 101 269 137M234 68Q285 86 296 131"/></g>
   <rect x="386" y="219" width="91" height="91" fill="#537b6e"/><polygon points="386,219 398,210 489,210 477,219" fill="#92a98f"/><polygon points="477,219 489,210 489,310 477,310" fill="#355b52"/>
   <rect x="398" y="234" width="66" height="33" fill="#264b47"/><rect x="404" y="240" width="54" height="21" :fill="active?'#b8c79a':'#7d9c88'"/><path d="M402 280H461M402 289H461M402 298H461" stroke="#2e554b" stroke-width="3"/>
  </g>
  <g v-else>
   <rect x="111" y="129" width="145" height="108" fill="#95a98f"/><rect x="116" y="134" width="135" height="98" fill="#31574e"/>
   <path d="M137 216V153M137 186H164L184 157H218M164 186L184 214H226" stroke="#9fb99b" stroke-width="3"/>
   <g fill="#e4cf96"><rect x="133" y="150" width="8" height="8"/><rect x="133" y="182" width="8" height="8"/><rect x="160" y="182" width="8" height="8"/><rect x="214" y="153" width="8" height="8"/><rect x="222" y="210" width="8" height="8"/></g>
   <rect x="123" y="237" width="5" height="73" fill="#7c8d72"/><rect x="240" y="237" width="5" height="73" fill="#7c8d72"/>
   <g v-for="(label,i) in ['lint','test','build']" :key="label"><rect :x="113+i*49" y="103" width="44" height="20" :fill="active?'#91a987':'#6f8a76'"/><text :x="135+i*49" y="116" fill="#f0dfad" text-anchor="middle" font-size="8" font-family="monospace">{{label}}</text></g>
   <rect x="383" y="238" width="109" height="63" fill="#6e8770"/><rect x="380" y="232" width="115" height="7" fill="#a4a67e"/><rect x="391" y="247" width="92" height="16" fill="#3c6052"/><rect x="391" y="270" width="92" height="21" fill="#526e58"/><path d="M422 252H450M422 278H450" stroke="#b4b18a" stroke-width="3"/><rect x="392" y="301" width="9" height="9" fill="#2b4d41"/><rect x="477" y="301" width="9" height="9" fill="#2b4d41"/>
   <path d="M403 230V211M415 230V202M429 230V215" stroke="#b5ae89" stroke-width="5"/>
  </g>
 </svg>
</template>
