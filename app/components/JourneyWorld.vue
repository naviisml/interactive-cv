<script setup lang="ts">
import {timeline as cvTimeline,isBriefEvent,categoryNames,categoryColors,type TimelineFilter} from '~/data/timeline'
import {journeyEvents as timeline,levels,levelForEvent,firstInLevel,type LevelId} from '~/data/levels'
import {sceneLayout} from '~/data/sceneLayout'
import { terrainHeight, shadowSurface } from '~/composables/physics'
import { readingProgress } from '~/composables/readingProgress'
import { lockSwipeAxis, type SwipeAxis } from '~/composables/swipeDirection'
const selectedFilter=useState<TimelineFilter>('journey-category',()=> 'all')
const filteredIndexes=(filter:TimelineFilter)=>timeline.flatMap((event,index)=>filter==='all'||event.category===filter?[index]:[])
const trackIndices=computed(()=>filteredIndexes(selectedFilter.value))
const entries=computed(()=>trackIndices.value.map(index=>({event:timeline[index]!,index})))
const filters=['all','work','projects','school','skills'] as const
const sceneChanging=ref(false)
const detailIndex=ref<number|null>(null),pendingDetailIndex=ref<number|null>(null)
const detailEvent=computed(()=>detailIndex.value===null?undefined:timeline[detailIndex.value])
const moneyOpen=ref(false)
let detailOpener:HTMLElement|undefined
const worldRoot = ref<HTMLElement>()
const view=useWorldViewport(worldRoot)
const activityHints=reactive<Record<string,string>>({})
const levelNavigation=ref<HTMLElement>()
const journey = useJourney(trackIndices,view)
const { cameraY,unlockRoute,worldGeometry,worldWidth:WORLD_WIDTH,eventPosition,destination,running,destinationTitle,motion, animationFrame, camera, facing, paused, touchDirection, touchVertical, nearLadder, nearestIndex, nearby, progress, goTo, jump, stop, scrollByDistance, endScrollTravel } = journey
const listMode = useState<boolean>('journey-list-mode', () => false)
const listActive = useState<number>('journey-list-active', () => 0)
const listProgress = useState<number>('journey-list-progress', () => 0)
watch([listMode,detailIndex,moneyOpen],()=>{paused.value=listMode.value||detailIndex.value!==null||moneyOpen.value},{immediate:true})
async function openDetail(index:number,event?:MouseEvent){
 if(event&&(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey))return
 event?.preventDefault()
 if(isBriefEvent(timeline[index]!)||timeline[index]!.id==='contact')return
 detailOpener=(event?.currentTarget as HTMLElement)||worldRoot.value
 if(listMode.value){if(selectedFilter.value!=='all')await changeFilter('all');listMode.value=false;pendingDetailIndex.value=index;goTo(index);if(!destination.value){pendingDetailIndex.value=null;detailIndex.value=index}}else{stop();detailIndex.value=index}
}
async function closeDetail(){detailIndex.value=null;await nextTick();if(detailOpener?.isConnected)detailOpener.focus();else worldRoot.value?.focus()}
async function changeFilter(filter:TimelineFilter){
 if(filter===selectedFilter.value||sceneChanging.value)return
 detailIndex.value=null;sceneChanging.value=true;stop()
 await new Promise(resolve=>setTimeout(resolve,130))
 selectedFilter.value=filter
 await nextTick()
 listActive.value=nearestIndex.value
 if(listMode.value){await nextTick();scrollToEvent(listActive.value)}
 await new Promise(resolve=>setTimeout(resolve,40))
 sceneChanging.value=false
}
const listRoot = ref<HTMLElement>()
const timelineScroll = ref<HTMLElement>()
const activeIndex = computed(() => listMode.value ? listActive.value : nearestIndex.value)
const displayProgress = computed(() => listMode.value ? listProgress.value : progress.value)
const current = computed(() => timeline[nearestIndex.value]!)
const activeLevel=computed(()=>levelForEvent(activeIndex.value))
watch(activeLevel,async()=>{await nextTick();const nav=levelNavigation.value,button=nav?.querySelector<HTMLElement>('[aria-current="step"]');if(nav&&button)nav.scrollTo({left:button.offsetLeft-(nav.clientWidth-button.offsetWidth)/2,behavior:'smooth'})})
const financeIndex=computed(()=>cvTimeline.findIndex(event=>event.id===timeline[activeIndex.value]?.id))
watch(destination,value=>{if(value||pendingDetailIndex.value===null)return;const index=pendingDetailIndex.value;pendingDetailIndex.value=null;if(Math.abs(motion.x-eventPosition(index))<3)detailIndex.value=index})
async function navigateLevel(id:LevelId){if(selectedFilter.value!=='all'){await changeFilter('all');await nextTick()}const index=firstInLevel(id);if(listMode.value)scrollToEvent(index);else goTo(index)}
const walking = computed(() => Math.abs(motion.vx) > 15 && motion.grounded && motion.mode !== 'sliding')
const shadowY = computed(() => shadowSurface(motion,worldGeometry.value))
const shadowDistance = computed(() => Math.max(0,shadowY.value-motion.y))
let gesture: { id: number; startX: number; startY: number; lastX: number; horizontal: boolean } | undefined
function gestureStart(event: PointerEvent) {
  if (event.pointerType !== 'pen' || !event.isPrimary || (event.target as HTMLElement)?.closest('button,a,input,[role="button"],[data-world-activity],[data-world-panel]')) return
  gesture = { id:event.pointerId,startX:event.clientX,startY:event.clientY,lastX:event.clientX,horizontal:false }
}
function gestureMove(event: PointerEvent) {
  if (!gesture || gesture.id !== event.pointerId) return
  if (!gesture.horizontal) {
    const dx=event.clientX-gesture.startX,dy=event.clientY-gesture.startY
    if (Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>8) { gesture=undefined; return }
    if (Math.abs(dx)<8) return
    gesture.horizontal=true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  if (event.cancelable) event.preventDefault()
  scrollByDistance(gesture.lastX-event.clientX)
  gesture.lastX=event.clientX
}
function gestureEnd(event: PointerEvent) { if (gesture?.id===event.pointerId) { gesture=undefined; endScrollTravel() } }
// Native touchmove must be non-passive before the gesture starts: cancelling a
// PointerEvent alone does not consistently cancel Safari's page-scrolling touch.
let touchGesture: { id: number; startX: number; startY: number; lastX: number; axis: SwipeAxis } | undefined
function touchStart(event: TouchEvent) {
  touchGesture=undefined
  endScrollTravel()
  if (event.touches.length!==1 || (event.target as Element)?.closest('button,a,input,textarea,select,[data-world-panel]')) return
  const touch=event.touches[0]!
  touchGesture={id:touch.identifier,startX:touch.clientX,startY:touch.clientY,lastX:touch.clientX,axis:'pending'}
}
function touchMove(event: TouchEvent) {
  if (!touchGesture) return
  if (event.touches.length!==1) { touchEnd(); return }
  const touch=Array.from(event.touches).find(t=>t.identifier===touchGesture!.id)
  if (!touch) { touchGesture=undefined; return }
  touchGesture.axis=lockSwipeAxis(touchGesture.axis,touch.clientX-touchGesture.startX,touch.clientY-touchGesture.startY)
  if (touchGesture.axis!=='horizontal') return
  // Keep cancelling every move after horizontal lock, even when Y drifts later.
  if (event.cancelable) event.preventDefault()
  scrollByDistance(touchGesture.lastX-touch.clientX)
  touchGesture.lastX=touch.clientX
}
function touchEnd() { touchGesture=undefined; endScrollTravel() }
function detachTouch(element?: HTMLElement) {
  if (!element) return
  element.removeEventListener('touchstart',touchStart)
  element.removeEventListener('touchmove',touchMove)
  element.removeEventListener('touchend',touchEnd)
  element.removeEventListener('touchcancel',touchEnd)
  touchEnd()
}
watch(worldRoot,(element,previous)=>{
  detachTouch(previous)
  if (!element) return
  element.addEventListener('touchstart',touchStart,{passive:true})
  element.addEventListener('touchmove',touchMove,{passive:false})
  element.addEventListener('touchend',touchEnd,{passive:true})
  element.addEventListener('touchcancel',touchEnd,{passive:true})
},{flush:'post'})
function wheelTravel(event: WheelEvent) {
  if (event.ctrlKey || paused.value) return
  if (Math.abs(event.deltaX)<=Math.abs(event.deltaY) && !event.shiftKey) return
  const delta=event.shiftKey && !event.deltaX ? event.deltaY : event.deltaX
  event.preventDefault()
  scrollByDistance(delta*(event.deltaMode===1 ? 16 : event.deltaMode===2 ? 400 : 1))
}
watch(activeIndex, async () => {
  await nextTick()
  const rail = timelineScroll.value
  const button = rail?.querySelector<HTMLElement>('[aria-current="step"]')
  if (rail && button) rail.scrollTo({ left: button.offsetLeft - rail.clientWidth/2 + button.clientWidth/2, behavior: 'instant' })
})
let scrollFrame = 0
function updateListProgress() {
  scrollFrame = 0
  if (!listMode.value || !listRoot.value) return
  const rows = [...listRoot.value.querySelectorAll<HTMLElement>('[data-timeline-index]')]
  const focus = Math.min(window.innerHeight * .4, 270)
  const positions = rows.map(row => row.getBoundingClientRect().top)
  const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  const reading = readingProgress(positions, focus, atEnd)
  listActive.value = entries.value[reading.active]?.index ?? trackIndices.value[0]!
  listProgress.value = reading.progress
}
function queueListUpdate() { if (listMode.value && !scrollFrame) scrollFrame = requestAnimationFrame(updateListProgress) }
function scrollToEvent(index: number) {
  const target = listRoot.value?.querySelector<HTMLElement>(`[data-timeline-index="${index}"]`)
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 135, behavior: 'instant' })
  queueListUpdate()
}
async function toggleList() {
  detailIndex.value=null;pendingDetailIndex.value=null
  if (listMode.value) {
    const returnIndex=listActive.value
    if(selectedFilter.value!=='all')await changeFilter('all')
    goTo(returnIndex); listMode.value = false; paused.value = false
    await nextTick(); window.scrollTo({ top: 0, behavior: 'instant' })
  } else {
    listActive.value = nearestIndex.value; listMode.value = true; paused.value = true
    await nextTick(); scrollToEvent(listActive.value)
  }
}
function navigateTimeline(index: number) { if (listMode.value) scrollToEvent(index); else goTo(index) }
function press(direction: number, event: PointerEvent) { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); touchDirection.value = direction }
function climb(direction: number, event: PointerEvent) { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); touchVertical.value = direction }
function interact(event:KeyboardEvent){if(!listMode.value&&detailIndex.value===null&&event.key.toLowerCase()==='e'&&nearby.value&&!isBriefEvent(nearby.value)&&!(event.target as HTMLElement)?.closest('button,a,input'))openDetail(nearestIndex.value)}
onMounted(async () => {
  paused.value = listMode.value || detailIndex.value!==null || moneyOpen.value
  window.addEventListener('keydown', interact)
  window.addEventListener('scroll', queueListUpdate, { passive: true })
  window.addEventListener('resize', queueListUpdate)
  if (listMode.value) { await nextTick(); scrollToEvent(listActive.value) }
})
onBeforeUnmount(() => { detachTouch(worldRoot.value); window.removeEventListener('keydown', interact); window.removeEventListener('scroll', queueListUpdate); window.removeEventListener('resize', queueListUpdate); cancelAnimationFrame(scrollFrame) })
</script>
<template>
  <main class="journey-shell" :class="{ 'is-list': listMode,'scene-changing':sceneChanging }">
    <header class="topbar"><NuxtLink class="wordmark" to="/">navi<span>®</span></NuxtLink><span class="topbar-caption">DEVELOPER. BUILDER. STILL CURIOUS.</span><MoneyCounter :index="financeIndex" :context-title="timeline[activeIndex]?.title" @toggle="moneyOpen=$event"/><button class="text-button" @click="toggleList">{{ listMode ? '← Back to world' : 'List view' }}</button></header>
    <nav ref="levelNavigation" class="level-navigation" aria-label="Portfolio levels"><button v-for="(level,index) in levels" :key="level.id" :class="{active:activeLevel.id===level.id}" :style="{'--level-color':level.color}" :aria-current="activeLevel.id===level.id?'step':undefined" @click="navigateLevel(level.id)"><span>{{ String(index+1).padStart(2,'0') }}</span>{{ level.title }}</button></nav>
    <nav v-if="listMode" class="journey-filters" aria-label="Timeline categories"><button v-for="filter in filters" :key="filter" :aria-pressed="selectedFilter===filter" :data-category="filter" @click="changeFilter(filter)"><i/><span>{{ filter==='all'?'All':categoryNames[filter] }}</span><small>{{ filteredIndexes(filter).length }}</small></button></nav>
    <section v-if="!listMode" ref="worldRoot" class="world" :style="{'--ground-y':`${view.groundInset}px`}" :class="`level-${activeLevel.id}`" tabindex="-1" @pointerdown="gestureStart" @pointermove="gestureMove" @pointerup="gestureEnd" @pointercancel="gestureEnd" @lostpointercapture="gestureEnd" @wheel="wheelTravel" aria-label="Interactive life timeline. Use left and right arrows to walk, Space to jump, up and down to climb ladders, and E to open a nearby event.">
      <div class="world-scene" :inert="!!detailEvent">
      <WorldAtmosphere :camera="camera" :world-width="WORLD_WIDTH" :level="activeLevel.id" />
      <header class="world-caption" :class="{'is-intro':!nearby}">
        <p class="caption-meta"><CategoryBadge :category="current.category"/><span v-if="current.label!=='SKILLS'&&current.category!=='contact'">{{current.label}}</span></p>
        <div class="caption-title"><h1>{{nearby?current.title:activeLevel.title}}</h1><button v-if="nearby&&!isBriefEvent(current)&&current.id!=='contact'" class="caption-details" @click="openDetail(nearestIndex)">Details <span aria-hidden="true">↗&#xfe0e;</span></button></div>
        <p class="caption-summary">{{nearby?current.summary:activeLevel.subtitle}}</p>
        <p v-if="running" class="caption-travel" role="status"><span>Running to {{destinationTitle}}</span><button @click="stop">Cancel</button></p>
        <p v-else-if="nearby&&activityHints[current.id]" class="caption-activity" role="status">{{activityHints[current.id]}}</p>
      </header>
      <div class="world-content" :style="{ transform: `translate3d(${-camera*view.scale}px,${cameraY*view.scale}px,0) scale(${view.scale})`, width: `${WORLD_WIDTH}px` }">
        <WorldTerrain :geometry="worldGeometry" :width="WORLD_WIDTH" />
        <WorldCourse :geometry="worldGeometry" :width="WORLD_WIDTH" />
        <div v-for="(level,index) in levels" :key="`gateway-${level.id}`" class="level-gateway" :style="{left:`${eventPosition(firstInLevel(level.id))-440}px`,bottom:`calc(var(--ground-y) + ${terrainHeight(eventPosition(firstInLevel(level.id))-440,worldGeometry.terrain)}px)`,'--level-color':level.color}"><span>LEVEL {{ String(index+1).padStart(2,'0') }}</span><strong>{{ level.title }}</strong></div>
        <div v-for="{event,index} in entries" :key="event.id" class="event-stop" :data-category="event.category" :class="{ active: nearby?.id === event.id }" :style="{ left: `${eventPosition(index)}px`, '--accent': categoryColors[event.category], bottom: `calc(var(--ground-y) + ${terrainHeight(eventPosition(index),worldGeometry.terrain)}px)` }">

          <WorldChapterScene :id="event.id" :active="nearby?.id===event.id" :paused="paused" :player-x="motion.x-eventPosition(index)+sceneLayout.originX" :player-y="sceneLayout.height+motion.y+terrainHeight(eventPosition(index),worldGeometry.terrain)" :velocity="motion.vx" @unlock-route="unlockRoute(event.id)" @status="activityHints[event.id]=$event" />

        </div>
        <div class="player-shadow" :style="{ left: `${motion.x}px`, bottom: `calc(var(--ground-y) - ${shadowY}px)`, transform: `translateX(-50%) scale(${Math.max(.38,1-shadowDistance/330)})`, opacity: Math.max(.12,.4-shadowDistance/650) }" aria-hidden="true" />
        <div class="player" :style="{ left: `${motion.x}px`,width:`${sceneLayout.actorWidth}px`,height:`${sceneLayout.actorHeight}px`, transform: `translate(-50%, ${motion.y}px)` }"><PixelCharacter :running="running" :falling="motion.vy>=0" :frame="animationFrame" :walking="walking" :facing="facing" :airborne="!motion.grounded" :climbing="motion.mode==='climbing'" :sliding="motion.mode==='sliding'"/></div>

      </div>
      <div class="ground" aria-hidden="true" />


      <div class="movement-hint"><span class="touch-instruction">{{nearLadder?'Use ↑ ↓ to climb':'Swipe to walk · ↑ to jump'}}</span><span class="desktop-instruction">← → Walk · Space Jump<span v-if="nearLadder"> · ↑ ↓ Climb</span></span></div>
      <div class="touch-controls" aria-label="Movement controls">
        <button aria-label="Walk left" @pointerdown.prevent="press(-1,$event)" @pointerup="touchDirection=0" @pointercancel="touchDirection=0" @lostpointercapture="touchDirection=0">←</button>
        <button aria-label="Walk right" @pointerdown.prevent="press(1,$event)" @pointerup="touchDirection=0" @pointercancel="touchDirection=0" @lostpointercapture="touchDirection=0">→</button>
        <button aria-label="Jump" @pointerdown.prevent="jump">↑</button>
        <div v-if="nearLadder" class="climb-controls"><button aria-label="Climb up" @pointerdown.prevent="climb(-1,$event)" @pointerup="touchVertical=0" @pointercancel="touchVertical=0" @lostpointercapture="touchVertical=0">↑</button><button aria-label="Climb down" @pointerdown.prevent="climb(1,$event)" @pointerup="touchVertical=0" @pointercancel="touchVertical=0" @lostpointercapture="touchVertical=0">↓</button></div>
      </div>
      </div>
      <WorldEventPanel v-if="detailEvent" :event="detailEvent" @close="closeDetail"/>
    </section>
    <section v-else ref="listRoot" class="timeline-list" aria-label="Read the timeline">
      <div class="list-intro"><p class="eyebrow">THE STORY SO FAR</p><h1>A few moments<br>that made me.</h1><p>Same journey. At your own pace.<br>Scroll to follow the story.</p></div>
      <article v-for="{event,index} in entries" :key="event.id" :data-timeline-index="index" :id="`chapter-${event.id}`" class="reading-event" :data-category="event.category" :class="{ 'is-current': index===listActive, 'is-past': index<listActive }" :style="{ '--accent': categoryColors[event.category] }">
        <div class="reading-rail"><i/><span>{{ String(trackIndices.indexOf(index)+1).padStart(2,'0') }}</span></div>
        <div class="reading-content"><p class="eyebrow">{{ categoryNames[event.category] }} / {{ event.label }} / {{ event.chapter }}</p><h2>{{ event.title }}</h2><p v-if="event.role" class="reading-role">{{ event.role }}<br><span>{{ event.period }}<template v-if="event.location"> · {{ event.location }}</template><template v-if="event.via"> · via {{ event.via }}</template></span></p><p class="reading-summary">{{ event.summary }}</p><template v-if="!isBriefEvent(event)"><p v-for="paragraph in event.body" :key="paragraph">{{ paragraph }}</p></template><div v-if="event.tags?.length" class="tech-tags"><span v-for="tag in event.tags" :key="tag">{{ tag }}</span></div><button v-if="!isBriefEvent(event) && event.id!=='contact'" class="reading-link" @click="openDetail(index)">{{ event.category==='projects' ? 'View project' : event.category==='skills' ? 'View skills' : 'Read experience' }} ↗</button></div>
      </article>
      <div class="list-ending"><span class="eyebrow">THE NEXT CHAPTER</span><h2>Let’s write<br>it together.</h2><p>Have a project in mind? Let’s talk.</p><a class="reading-link" href="mailto:contact@navel.dev">Get in touch ↗</a><br><button class="text-button" @click="toggleList">Step back into the world →</button></div>
    </section>
    <footer class="journey-footer"><div class="footer-heading"><span class="eyebrow">YOUR JOURNEY</span><span>{{ displayProgress }}% {{ listMode ? 'READ' : 'EXPLORED' }}</span></div><div ref="timelineScroll" class="timeline-scroll"><nav class="timeline-nav" aria-label="Jump to a timeline event" :style="{ '--timeline-progress': `${displayProgress}%`, minWidth: `${entries.length*104}px` }"><button v-for="{event,index} in entries" :key="event.id" :aria-label="`${event.title}, ${event.period || event.label}`" :data-category="event.category" :class="{selected:index===activeIndex, visited:trackIndices.indexOf(index)<trackIndices.indexOf(activeIndex)}" :aria-current="index===activeIndex ? 'step' : undefined" @click="navigateTimeline(index)"><i/><span :title="`${event.title} · ${event.period || event.label}`">{{ event.category==='skills'?event.title:event.label }}</span></button></nav></div><div class="footer-meta"><span>{{timeline[activeIndex]?.title}}</span><span>{{String(trackIndices.indexOf(activeIndex)+1).padStart(2,'0')}} / {{entries.length}}</span></div></footer>
  </main>
</template>
