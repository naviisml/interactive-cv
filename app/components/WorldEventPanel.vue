<script setup lang="ts">
import type {TimelineEvent} from '~/data/timeline'
import {timeline,categoryNames} from '~/data/timeline'
defineProps<{event:TimelineEvent}>()
const emit=defineEmits<{close:[]}>()
const panel=ref<HTMLElement>()
function keydown(event:KeyboardEvent){
 if(event.key==='Escape'){event.preventDefault();event.stopPropagation();emit('close');return}
 if(event.key!=='Tab')return
 const controls=Array.from(panel.value?.querySelectorAll<HTMLElement>('button,a[href],select,input,[tabindex="0"]')??[])
 const first=controls[0],last=controls.at(-1)
 if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}
 else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}
}
onMounted(()=>panel.value?.querySelector<HTMLButtonElement>('button')?.focus())
</script>
<template><div class="world-modal" @click.self="emit('close')"><section ref="panel" data-world-panel class="world-event-panel" role="dialog" aria-modal="true" aria-labelledby="world-event-title" @keydown="keydown" :data-category="event.category"><header><span class="category-badge">{{ categoryNames[event.category] }} · {{ event.period || event.label }}</span><button aria-label="Close chapter details" @click="emit('close')">×</button></header><h2 id="world-event-title">{{ event.title }}</h2><p v-if="event.role" class="panel-role">{{ event.role }}<span v-if="event.location"> · {{ event.location }}</span></p><p v-if="event.via" class="panel-via">Project through {{ event.via }}</p><p class="panel-lead">{{ event.summary }}</p><div class="panel-story"><p v-for="paragraph in event.body" :key="paragraph">{{ paragraph }}</p></div><div v-if="event.tags?.length" class="tech-tags"><span v-for="tag in event.tags" :key="tag">{{ tag }}</span></div><footer><button @click="emit('close')">Back to the journey →</button><NuxtLink v-if="timeline.some(item=>item.id===event.id)" :to="`/events/${event.id}`">Open full page ↗</NuxtLink></footer></section></div></template>
<style scoped>
.world-modal{position:absolute;inset:0;z-index:30;background:#173d38b8;backdrop-filter:blur(3px);display:grid;place-items:center;padding:22px;touch-action:pan-y;user-select:text;-webkit-user-select:text}
.world-event-panel{--category:#467f74;width:min(720px,100%);max-height:100%;overflow:auto;overscroll-behavior:contain;background:#f4f1e7;border-top:4px solid var(--category);color:#2e4e43;padding:22px 28px;box-shadow:0 20px 60px #102e3c55}
.world-event-panel[data-category=work]{--category:#ae7954}.world-event-panel[data-category=school]{--category:#667eaa}
header{display:flex;justify-content:space-between;align-items:center;gap:16px}.category-badge{font:10px 'Space Grotesk';color:var(--category);letter-spacing:.7px}header button{font-size:28px;padding:0 3px}h2{font:500 clamp(25px,3vw,40px)/1.08 'Space Grotesk';letter-spacing:-1px;margin:22px 0 14px}.panel-role{font-size:13px;line-height:1.7}.panel-role span,.panel-via{color:#7a8770}.panel-via{font-size:11px}.panel-lead{font-size:17px;line-height:1.65;padding-bottom:18px;border-bottom:1px solid #ccd2bf}.panel-story p{font-size:13px;line-height:1.9;color:#61775d}footer{margin-top:25px;display:flex;justify-content:space-between;align-items:center;gap:16px}footer button,footer a{font-size:11px;padding:0}footer a{color:#7c8972}
@media(max-width:700px){.world-modal{padding:14px}.world-event-panel{padding:17px 19px}.panel-lead{font-size:15px}.panel-story p{font-size:12px}footer{align-items:flex-start;flex-direction:column;gap:17px}}
</style>
