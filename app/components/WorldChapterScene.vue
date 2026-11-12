<script setup lang="ts">
import {sceneLayout} from '~/data/sceneLayout'
const props=defineProps<{id:string;active:boolean;paused:boolean;playerX:number;playerY:number;velocity:number;navigating?:boolean}>()
const emit=defineEmits<{unlockRoute:[];status:[message:string]}>()
const portalReady=useState('portal-ready',()=>false)
const switched=computed(()=>props.id==='gmodstore'?portalReady.value:props.active)
function unlockPortal(){portalReady.value=true;emit('unlockRoute')}
const scene=computed(()=>props.id.startsWith('skills-')?props.id:props.id)
const school=computed(()=>['panta-rhei','roc-hilversum','coding-college'].includes(scene.value))
</script>
<template>
 <div class="world-chapter" :class="{'is-powered':switched,'is-near':active,'is-paused':paused}" :data-scene="scene" :style="{left:`${-sceneLayout.originX}px`,width:`${sceneLayout.width}px`,height:`${sceneLayout.height}px`}">
 <SchoolWorldScene v-if="school" :id="id" :active="active" :paused="paused" :player-x="playerX" :player-y="playerY" :velocity="velocity" :navigating="navigating" @status="emit('status',$event)" />
 <SkillsWorldScene v-else-if="scene.startsWith('skills-')" :id="scene" :active="active"/>
 <StoryWorldScene v-else :id="id" :active="active" :portal-ready="portalReady"/>
 <PortalWorldActivity v-if="scene==='gmodstore'" :active="active" :paused="paused" :player-x="playerX" :player-y="playerY" @unlock="unlockPortal" @status="emit('status',$event)"/>
 <a v-if="scene==='contact'" class="mailbox-link" href="mailto:contact@navel.dev" :tabindex="active?0:-1" aria-label="Email Navi at contact@navel.dev">contact@navel.dev ↗</a>
 </div>
</template>
<style scoped>
.mailbox-link{position:absolute;left:329px;bottom:105px;pointer-events:auto;font-size:10px;background:#e5ddc4;padding:5px 8px;white-space:nowrap;opacity:0}.is-near .mailbox-link,.mailbox-link:focus-visible{opacity:1}.world-chapter{position:absolute;bottom:0;pointer-events:none}.world-chapter>svg{width:100%;height:100%;overflow:visible}.world-chapter:not(.is-near) :deep(*),.world-chapter.is-paused :deep(*){animation-play-state:paused!important}
</style>
