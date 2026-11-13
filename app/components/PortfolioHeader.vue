<script setup lang="ts">
import {Menu,X,List,Map} from '@lucide/vue'
import {levels,type LevelId} from '~/data/levels'
defineProps<{active:LevelId;financeIndex:number;contextTitle?:string;listMode:boolean}>()
const emit=defineEmits<{navigate:[id:LevelId];toggleList:[];moneyToggle:[open:boolean]}>()
const menuOpen=ref(false)
const labels:Record<LevelId,string>={about:'About',skills:'Skills',work:'Work',company:'Company & projects',contact:'Contact'}
function navigate(id:LevelId){menuOpen.value=false;emit('navigate',id)}
function toggleView(){menuOpen.value=false;emit('toggleList')}
</script>
<template>
 <header class="portfolio-header" @keydown.esc="menuOpen=false">
  <NuxtLink class="wordmark" to="/" aria-label="Navi home">navi<span>®</span></NuxtLink>
  <div class="header-menu">
   <button class="menu-toggle" :aria-expanded="menuOpen" aria-controls="portfolio-menu" @click="menuOpen=!menuOpen"><span>{{menuOpen?'Close':'Menu'}}</span><component :is="menuOpen?X:Menu" :size="18" aria-hidden="true"/></button>
   <nav id="portfolio-menu" class="portfolio-menu" :class="{'is-open':menuOpen}" aria-label="Main navigation">
    <button v-for="level in levels" :key="level.id" :aria-current="active===level.id?'location':undefined" :style="{'--level-color':level.color}" @click="navigate(level.id)">{{labels[level.id]}}</button>
    <button class="view-toggle" @click="toggleView"><component :is="listMode?Map:List" :size="15" aria-hidden="true"/><span>{{listMode?'World view':'List view'}}</span></button>
   </nav>
  </div>
  <MoneyCounter :index="financeIndex" :context-title="contextTitle" @toggle="emit('moneyToggle',$event)"/>
 </header>
</template>
<style scoped>
.portfolio-header{position:relative;z-index:20;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:28px;min-height:86px;padding:12px 3%;background:#f4f1e9;border-bottom:1px solid #cfd4c4}
.header-menu{min-width:0}.portfolio-menu{display:flex;justify-content:center;align-items:center;gap:4px}.portfolio-menu>button{position:relative;white-space:nowrap;padding:14px 10px;font:12px 'Space Grotesk',sans-serif;color:#687c70;border-radius:4px;min-height:44px}.portfolio-menu>button:hover{background:#e7eadf;color:#294a40}.portfolio-menu>button[aria-current]{color:#294a40;background:#e7eadf}.portfolio-menu>button[aria-current]::after{content:'';position:absolute;bottom:5px;height:2px;left:10px;right:10px;background:var(--level-color)}.portfolio-menu>.view-toggle{display:flex;align-items:center;gap:7px}.menu-toggle{display:none}
@media(max-width:1100px){.portfolio-header{gap:12px;padding-inline:3%}.portfolio-menu>button{padding-inline:7px;font-size:11px}.portfolio-header :deep(.money-counter){min-width:0;padding-left:12px;gap:12px}.portfolio-header :deep(.debt-balance strong){font-size:12px}}
@media(max-width:900px){
.portfolio-header{min-height:0;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:44px 36px;column-gap:10px;row-gap:6px;padding:8px 4% 10px}.wordmark{font-size:32px;grid-column:1;grid-row:1;justify-self:start}.header-menu{grid-column:2;grid-row:1;justify-self:end}.menu-toggle{display:flex;align-items:center;justify-content:center;gap:9px;min-height:44px;padding:0 8px;font:12px 'Space Grotesk',sans-serif}
.portfolio-menu{display:none;position:absolute;left:0;right:0;top:100%;padding:12px 4% 18px;box-shadow:0 12px 20px #173d3314;background:#f4f1e9;border-bottom:1px solid #cfd4c4;grid-template-columns:1fr 1fr;gap:6px}.portfolio-menu.is-open{display:grid}.portfolio-menu>button{text-align:left;padding:14px;font-size:14px}.portfolio-menu>button[aria-current]::after{left:14px;right:auto;width:22px}
.portfolio-header :deep(.money-counter){justify-self:stretch;grid-column:1/-1;grid-row:2;min-width:0;width:100%;padding:6px 0 0;border-top:1px solid #cfd4c4;border-left:0;gap:12px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) 24px}.portfolio-header :deep(.debt-balance){min-width:0}.portfolio-header :deep(.debt-balance>span){font-size:7px;letter-spacing:.7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.portfolio-header :deep(.debt-balance strong){font-size:11px;display:block;overflow:hidden;text-overflow:ellipsis}.portfolio-header :deep(.debt-info-button){margin:0;width:24px;height:24px}
}
@media(max-width:380px){.portfolio-header{gap:6px;padding-inline:12px}.wordmark{font-size:29px}.menu-toggle{gap:5px;font-size:11px;padding-inline:5px}.portfolio-header :deep(.money-counter){gap:8px;padding-left:0}.portfolio-header :deep(.debt-balance strong){font-size:10px}}
</style>
