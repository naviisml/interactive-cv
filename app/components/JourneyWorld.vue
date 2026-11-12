<script setup lang="ts">
import { timeline, eventX, WORLD_WIDTH, isBriefEvent } from '~/data/timeline'
import { worldGeometry } from '~/data/world'
import { terrainHeight, shadowSurface } from '~/composables/physics'
import { readingProgress } from '~/composables/readingProgress'
import { lockSwipeAxis, type SwipeAxis } from '~/composables/swipeDirection'
const journey = useJourney()
const { motion, animationFrame, camera, facing, paused, touchDirection, touchVertical, nearLadder, nearestIndex, nearby, progress, goTo, jump, stop, scrollByDistance, endScrollTravel } = journey
const listMode = useState<boolean>('journey-list-mode', () => false)
const listActive = useState<number>('journey-list-active', () => 0)
const listProgress = useState<number>('journey-list-progress', () => 0)
const listRoot = ref<HTMLElement>()
const worldRoot = ref<HTMLElement>()
const timelineScroll = ref<HTMLElement>()
const activeIndex = computed(() => listMode.value ? listActive.value : nearestIndex.value)
const displayProgress = computed(() => listMode.value ? listProgress.value : progress.value)
const current = computed(() => timeline[nearestIndex.value]!)
const walking = computed(() => Math.abs(motion.vx) > 15 && motion.grounded && motion.mode !== 'sliding')
const shadowY = computed(() => shadowSurface(motion,worldGeometry))
const shadowDistance = computed(() => Math.max(0,shadowY.value-motion.y))
let gesture: { id: number; startX: number; startY: number; lastX: number; horizontal: boolean } | undefined
function gestureStart(event: PointerEvent) {
  if (event.pointerType !== 'pen' || !event.isPrimary || (event.target as HTMLElement)?.closest('button,a,input')) return
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
  if (event.touches.length!==1 || (event.target as Element)?.closest('button,a,input,textarea,select')) return
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
  listActive.value = reading.active
  listProgress.value = reading.progress
}
function queueListUpdate() { if (listMode.value && !scrollFrame) scrollFrame = requestAnimationFrame(updateListProgress) }
function scrollToEvent(index: number) {
  const target = listRoot.value?.querySelector<HTMLElement>(`[data-timeline-index="${index}"]`)
  if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 135, behavior: 'instant' })
  queueListUpdate()
}
async function toggleList() {
  if (listMode.value) {
    goTo(listActive.value); listMode.value = false; paused.value = false
    await nextTick(); window.scrollTo({ top: 0, behavior: 'instant' })
  } else {
    listActive.value = nearestIndex.value; listMode.value = true; paused.value = true
    await nextTick(); scrollToEvent(listActive.value)
  }
}
function navigateTimeline(index: number) { if (listMode.value) scrollToEvent(index); else goTo(index) }
function press(direction: number, event: PointerEvent) { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); touchDirection.value = direction }
function climb(direction: number, event: PointerEvent) { (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); touchVertical.value = direction }
function interact(event: KeyboardEvent) { if (!listMode.value && event.key.toLowerCase() === 'e' && nearby.value && !isBriefEvent(nearby.value) && !(event.target as HTMLElement)?.closest('button,a,input')) navigateTo(`/events/${nearby.value.id}`) }
onMounted(async () => {
  paused.value = listMode.value
  window.addEventListener('keydown', interact)
  window.addEventListener('scroll', queueListUpdate, { passive: true })
  window.addEventListener('resize', queueListUpdate)
  if (listMode.value) { await nextTick(); scrollToEvent(listActive.value) }
})
onBeforeUnmount(() => { detachTouch(worldRoot.value); window.removeEventListener('keydown', interact); window.removeEventListener('scroll', queueListUpdate); window.removeEventListener('resize', queueListUpdate); cancelAnimationFrame(scrollFrame) })
</script>
<template>
  <main class="journey-shell" :class="{ 'is-list': listMode }">
    <header class="topbar"><NuxtLink class="wordmark" to="/">navi<span>®</span></NuxtLink><span class="topbar-caption">DEVELOPER. BUILDER. STILL CURIOUS.</span><MoneyCounter :index="activeIndex" @toggle="paused=listMode || $event"/><button class="text-button" @click="toggleList">{{ listMode ? '← Back to world' : 'Explore as a list ↗' }}</button></header>
    <section v-if="!listMode" ref="worldRoot" class="world" @pointerdown="gestureStart" @pointermove="gestureMove" @pointerup="gestureEnd" @pointercancel="gestureEnd" @lostpointercapture="gestureEnd" @wheel="wheelTravel" aria-label="Interactive life timeline. Use left and right arrows to walk, Space to jump, up and down to climb ladders, and E to open a nearby event.">
      <WorldAtmosphere :camera="camera" />
      <div class="intro-copy" :style="{ opacity: Math.max(0, 1-camera/500), transform: `translateX(${-camera*.45}px)` }"><p class="eyebrow">THE INTERACTIVE PORTFOLIO</p><h1>A life<br>in progress<span>.</span></h1><p>I’m Navi, a senior software developer<br>from Amsterdam. This is my journey.</p><div class="start-hint">Swipe ↔ or use ← →</div></div>
      <div class="world-content" :style="{ transform: `translate3d(${-camera}px,0,0)`, width: `${WORLD_WIDTH}px` }">
        <WorldTerrain />
        <WorldCourse />
        <div v-for="(event, index) in timeline" :key="event.id" class="event-stop" :class="{ active: nearby?.id === event.id }" :style="{ left: `${eventX(index)}px`, '--accent': event.accent, bottom: `calc(var(--ground-y) + ${terrainHeight(eventX(index),worldGeometry.terrain)}px)` }">
          <div class="event-label"><span>{{ event.label }}</span><h2>{{ event.title }}</h2></div>
          <ChapterLandmark :kind="event.landmark" :name="event.title.toUpperCase()" />
          <div class="marker"><i/></div>
          <div v-if="isBriefEvent(event) && nearby?.id===event.id" class="event-tooltip" role="status" :aria-label="event.title"><strong>{{ event.period || event.label }}<template v-if="event.location"> · {{ event.location }}</template></strong><p>{{ event.summary }}</p></div>
          <NuxtLink v-if="!isBriefEvent(event)" class="event-open" :to="`/events/${event.id}`" :tabindex="nearby?.id===event.id ? 0 : -1"><span>{{ event.kind==='project' ? 'Explore project' : 'Read the story' }}</span><kbd>E</kbd><span>↗</span></NuxtLink>
        </div>
        <div class="player-shadow" :style="{ left: `${motion.x}px`, bottom: `calc(var(--ground-y) - ${shadowY}px)`, transform: `translateX(-50%) scale(${Math.max(.38,1-shadowDistance/330)})`, opacity: Math.max(.12,.4-shadowDistance/650) }" aria-hidden="true" />
        <div class="player" :style="{ left: `${motion.x}px`, transform: `translate(-50%, ${motion.y}px)` }"><PixelCharacter :frame="animationFrame" :walking="walking" :facing="facing" :airborne="!motion.grounded" :climbing="motion.mode==='climbing'" :sliding="motion.mode==='sliding'"/></div>
        <div class="end-sign" :style="{ left: `${WORLD_WIDTH-390}px` }"><p>THE NEXT CHAPTER</p><h2>Let’s write<br>it together.</h2><a class="world-contact" href="mailto:contact@navel.dev">contact@navel.dev ↗</a><button @click="goTo(0)">Back to the beginning ↺</button></div>
      </div>
      <svg class="canopy-foreground" :style="{ transform: `translate3d(${-camera*1.08}px,0,0)`, width: `${WORLD_WIDTH+1700}px` }" :viewBox="`0 0 ${WORLD_WIDTH+1700} 640`" preserveAspectRatio="none" aria-hidden="true"><g v-for="n in Math.ceil(WORLD_WIDTH/1150)+2" :key="n" :transform="`translate(${(n-1)*1150-38} 0)`" fill="#183c3c"><path d="M0 640V0h45l-7 155 20 38-11 9-14-24-9 216 17 36-8 19-11-18-6 209Z"/><path d="M12 55 85 84l55 65-12 5-53-51-60-12ZM25 145l80-36 20-44 10 5-15 53-90 49Z"/><path d="M0 0h170v20h-26v22h-34v22H65v20H20Z" fill="#244c45"/><path d="M10 25h100v14H80v20H40v13H10Z" fill="#355a47"/></g></svg>
      <div class="ground" aria-hidden="true" />
      <aside class="chapter-card"><span class="eyebrow">CHAPTER {{ String(nearestIndex+1).padStart(2,'0') }} / {{ String(timeline.length).padStart(2,'0') }}</span><h3>{{ current.chapter }}</h3><p>{{ current.summary }}</p></aside>
      <div class="movement-hint">{{ nearLadder ? '↑ / ↓ Climb the ladder' : motion.mode==='sliding' ? 'Enjoy the ride' : 'Swipe ↔ · Space / ↥ to jump' }}</div>
      <div class="touch-controls" aria-label="Movement controls">
        <button aria-label="Walk left" @pointerdown.prevent="press(-1,$event)" @pointerup="touchDirection=0" @pointercancel="touchDirection=0" @lostpointercapture="touchDirection=0">←</button>
        <button aria-label="Walk right" @pointerdown.prevent="press(1,$event)" @pointerup="touchDirection=0" @pointercancel="touchDirection=0" @lostpointercapture="touchDirection=0">→</button>
        <button aria-label="Jump" @pointerdown.prevent="jump">↥</button>
        <div class="climb-controls" :class="{ available: nearLadder }"><button aria-label="Climb up" @pointerdown.prevent="climb(-1,$event)" @pointerup="touchVertical=0" @pointercancel="touchVertical=0" @lostpointercapture="touchVertical=0">↑</button><button aria-label="Climb down" @pointerdown.prevent="climb(1,$event)" @pointerup="touchVertical=0" @pointercancel="touchVertical=0" @lostpointercapture="touchVertical=0">↓</button></div>
      </div>
    </section>
    <section v-else ref="listRoot" class="timeline-list" aria-label="Read the timeline">
      <div class="list-intro"><p class="eyebrow">THE STORY SO FAR</p><h1>A few moments<br>that made me.</h1><p>Same journey. At your own pace.<br>Scroll to follow the story.</p></div>
      <article v-for="(event,index) in timeline" :key="event.id" :data-timeline-index="index" :id="`chapter-${event.id}`" class="reading-event" :class="{ 'is-current': index===listActive, 'is-past': index<listActive }" :style="{ '--accent': event.accent }">
        <div class="reading-rail"><i/><span>{{ String(index+1).padStart(2,'0') }}</span></div>
        <div class="reading-content"><p class="eyebrow">{{ event.label }} / {{ event.chapter }}</p><h2>{{ event.title }}</h2><p v-if="event.role" class="reading-role">{{ event.role }}<br><span>{{ event.period }}<template v-if="event.location"> · {{ event.location }}</template><template v-if="event.via"> · via {{ event.via }}</template></span></p><p class="reading-summary">{{ event.summary }}</p><template v-if="!isBriefEvent(event)"><p v-for="paragraph in event.body" :key="paragraph">{{ paragraph }}</p></template><div v-if="event.tags?.length" class="tech-tags"><span v-for="tag in event.tags" :key="tag">{{ tag }}</span></div><NuxtLink v-if="!isBriefEvent(event)" class="reading-link" :to="`/events/${event.id}`">{{ event.kind==='project' ? 'Explore the project' : 'Open this chapter' }} ↗</NuxtLink></div>
      </article>
      <div class="list-ending"><span class="eyebrow">THE NEXT CHAPTER</span><h2>Let’s write<br>it together.</h2><p>Have a project in mind? Let’s talk.</p><a class="reading-link" href="mailto:contact@navel.dev">Get in touch ↗</a><br><button class="text-button" @click="toggleList">Step back into the world →</button></div>
    </section>
    <footer class="journey-footer"><div class="footer-heading"><span class="eyebrow">YOUR JOURNEY</span><span>{{ displayProgress }}% {{ listMode ? 'READ' : 'EXPLORED' }}</span></div><div ref="timelineScroll" class="timeline-scroll"><nav class="timeline-nav" aria-label="Jump to a timeline event" :style="{ '--timeline-progress': `${displayProgress}%`, minWidth: `${timeline.length*88}px` }"><button v-for="(event,index) in timeline" :key="event.id" :aria-label="`${event.title}, ${event.period || event.label}`" :class="{selected:index===activeIndex, visited:index<activeIndex}" :aria-current="index===activeIndex ? 'step' : undefined" @click="navigateTimeline(index)"><i/><span :title="`${event.title} · ${event.period || event.label}`">{{ event.label }}</span></button></nav></div><div class="footer-meta"><span v-if="listMode">SCROLL TO FOLLOW THE STORY · {{ timeline[activeIndex]?.chapter }}</span><span v-else><kbd>←</kbd> <kbd>→</kbd> Walk <span class="desktop-instruction"> · <kbd>SPACE</kbd> Jump · <kbd>↑↓</kbd> Climb</span></span><span>NAVARONE ISMAIL <span class="spark">✳</span></span></div></footer>
  </main>
</template>
