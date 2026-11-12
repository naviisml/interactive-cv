<script setup lang="ts">
import { timeline, eventX, WORLD_WIDTH, isBriefEvent } from '~/data/timeline'
import { worldGeometry } from '~/data/world'
import { terrainHeight, shadowSurface } from '~/composables/physics'
import { readingProgress } from '~/composables/readingProgress'
const journey = useJourney()
const { motion, camera, facing, paused, touchDirection, touchVertical, nearLadder, nearestIndex, nearby, progress, goTo, jump, stop, scrollByDistance } = journey
const listMode = useState<boolean>('journey-list-mode', () => false)
const listActive = useState<number>('journey-list-active', () => 0)
const listProgress = useState<number>('journey-list-progress', () => 0)
const listRoot = ref<HTMLElement>()
const timelineScroll = ref<HTMLElement>()
const activeIndex = computed(() => listMode.value ? listActive.value : nearestIndex.value)
const displayProgress = computed(() => listMode.value ? listProgress.value : progress.value)
const current = computed(() => timeline[nearestIndex.value]!)
const walking = computed(() => Math.abs(motion.vx) > 15 && motion.grounded && motion.mode !== 'sliding')
const shadowY = computed(() => shadowSurface(motion,worldGeometry))
const shadowDistance = computed(() => Math.max(0,shadowY.value-motion.y))
let gesture: { id: number; startX: number; startY: number; lastX: number; horizontal: boolean } | undefined
function gestureStart(event: PointerEvent) {
  if (event.pointerType === 'mouse' || !event.isPrimary || (event.target as HTMLElement)?.closest('button,a,input')) return
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
  scrollByDistance((gesture.lastX-event.clientX)*1.4)
  gesture.lastX=event.clientX
}
function gestureEnd(event: PointerEvent) { if (gesture?.id===event.pointerId) gesture=undefined }
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
onBeforeUnmount(() => { window.removeEventListener('keydown', interact); window.removeEventListener('scroll', queueListUpdate); window.removeEventListener('resize', queueListUpdate); cancelAnimationFrame(scrollFrame) })
</script>
<template>
  <main class="journey-shell" :class="{ 'is-list': listMode }">
    <header class="topbar"><NuxtLink class="wordmark" to="/">navi<span>®</span></NuxtLink><span class="topbar-caption">DEVELOPER. BUILDER. STILL CURIOUS.</span><button class="text-button" @click="toggleList">{{ listMode ? '← Back to world' : 'Explore as a list ↗' }}</button></header>
    <section v-if="!listMode" class="world" @pointerdown="gestureStart" @pointermove="gestureMove" @pointerup="gestureEnd" @pointercancel="gestureEnd" @lostpointercapture="gestureEnd" @wheel="wheelTravel" aria-label="Interactive life timeline. Use left and right arrows to walk, Space to jump, up and down to climb ladders, and E to open a nearby event.">
      <WorldAtmosphere :camera="camera" />
      <div class="intro-copy" :style="{ opacity: Math.max(0, 1-camera/500), transform: `translateX(${-camera*.45}px)` }"><p class="eyebrow">THE INTERACTIVE PORTFOLIO</p><h1>A life<br>in progress<span>.</span></h1><p>I’m Navi, a senior software developer<br>from Amsterdam. This is my journey.</p><div class="start-hint"><span>→</span> Every story starts with a step.</div></div>
      <div class="world-content" :style="{ transform: `translate3d(${-camera}px,0,0)`, width: `${WORLD_WIDTH}px` }">
        <WorldTerrain />
        <div class="route-scenery" aria-hidden="true">
          <div v-for="platform in worldGeometry.platforms" :key="platform.id" class="route-platform" :style="{ left: `${platform.x}px`, width: `${platform.width}px`, bottom: `calc(var(--ground-y) + ${platform.height}px - 12px)`, '--deck-height': `${platform.height}px` }"><i/><b/></div>
          <div v-for="ladder in worldGeometry.ladders" :key="ladder.id" class="route-ladder" :style="{ left: `${ladder.x}px`, bottom: `calc(var(--ground-y) + ${ladder.bottom}px)`, height: `${ladder.top-ladder.bottom}px` }" />
          <svg v-for="slide in worldGeometry.slides" :key="slide.id" class="route-slide" :style="{ left: `${slide.x}px`, bottom: `calc(var(--ground-y) + ${slide.to}px)`, width: `${slide.width}px`, height: `${slide.from-slide.to+15}px` }" :viewBox="`0 0 ${slide.width} ${slide.from-slide.to+15}`" preserveAspectRatio="none">
            <path :d="`M 0 15 L ${slide.width} ${slide.from-slide.to+15} L 0 ${slide.from-slide.to+15} Z`" fill="#47665d" opacity=".12"/>
            <path :d="`M 0 15 L ${slide.width} ${slide.from-slide.to+15}`" fill="none" stroke="#657d70" stroke-width="12"/>
            <path :d="`M 0 10 L ${slide.width} ${slide.from-slide.to+10}`" fill="none" stroke="#c8a67a" stroke-width="7"/>
            <path :d="`M 0 0 L ${slide.width} ${slide.from-slide.to}`" fill="none" stroke="#e4c9a0" stroke-width="3"/>
          </svg>
          <div class="route-sign tutorial-sign" :style="{ left: '410px', bottom: `calc(var(--ground-y) + ${terrainHeight(410,worldGeometry.terrain)+25}px)` }"><strong>TUTORIAL</strong><span>↔</span> Walk or swipe<br>Space / ↥ to jump<br>↑ ↓ to climb<br><small>Going back? Walk freely.</small></div>
        </div>
        <div v-for="(event, index) in timeline" :key="event.id" class="event-stop" :class="{ active: nearby?.id === event.id }" :style="{ left: `${eventX(index)}px`, '--accent': event.accent, bottom: `calc(var(--ground-y) + ${terrainHeight(eventX(index),worldGeometry.terrain)}px)` }">
          <div class="event-label"><span>{{ event.label }}</span><h2>{{ event.title }}</h2></div>
          <ChapterLandmark :kind="event.landmark" :name="event.title.toUpperCase()" />
          <div class="marker"><i/></div>
          <div v-if="isBriefEvent(event) && nearby?.id===event.id" class="event-tooltip" role="status" :aria-label="event.title"><strong>{{ event.period || event.label }}<template v-if="event.location"> · {{ event.location }}</template></strong><p>{{ event.summary }}</p></div>
          <NuxtLink v-if="!isBriefEvent(event)" class="event-open" :to="`/events/${event.id}`" :tabindex="nearby?.id===event.id ? 0 : -1"><span>{{ event.kind==='project' ? 'Explore project' : 'Read the story' }}</span><kbd>E</kbd><span>↗</span></NuxtLink>
        </div>
        <div class="player-shadow" :style="{ left: `${motion.x}px`, bottom: `calc(var(--ground-y) - ${shadowY}px)`, transform: `translateX(-50%) scale(${Math.max(.38,1-shadowDistance/330)})`, opacity: Math.max(.12,.4-shadowDistance/650) }" aria-hidden="true" />
        <div class="player" :style="{ left: `${motion.x}px`, transform: `translate(-50%, ${motion.y}px)` }"><div class="player-tag">{{ motion.mode==='sliding' ? 'WHEEE!' : motion.mode==='climbing' ? 'GOING UP' : 'YOU ARE HERE' }}</div><PixelCharacter :walking="walking" :facing="facing" :airborne="!motion.grounded" :climbing="motion.mode==='climbing'" :sliding="motion.mode==='sliding'"/></div>
        <div class="end-sign" :style="{ left: `${WORLD_WIDTH-390}px` }"><p>THE NEXT CHAPTER</p><h2>Let’s write<br>it together.</h2><a class="world-contact" href="mailto:contact@navel.dev">contact@navel.dev ↗</a><button @click="goTo(0)">Back to the beginning ↺</button></div>
      </div>
      <svg class="canopy-foreground" :style="{ transform: `translate3d(${-camera*1.08}px,0,0)`, width: `${WORLD_WIDTH+1700}px` }" :viewBox="`0 0 ${WORLD_WIDTH+1700} 640`" preserveAspectRatio="none" aria-hidden="true"><g v-for="n in Math.ceil(WORLD_WIDTH/1150)+2" :key="n" :transform="`translate(${(n-1)*1150-38} 0)`" fill="#183c3c"><path d="M0 640V0h45l-7 155 20 38-11 9-14-24-9 216 17 36-8 19-11-18-6 209Z"/><path d="M12 55 85 84l55 65-12 5-53-51-60-12ZM25 145l80-36 20-44 10 5-15 53-90 49Z"/><path d="M0 0h170v20h-26v22h-34v22H65v20H20Z" fill="#244c45"/><path d="M10 25h100v14H80v20H40v13H10Z" fill="#355a47"/></g></svg>
      <div class="ground" aria-hidden="true" />
      <aside class="chapter-card"><span class="eyebrow">CHAPTER {{ String(nearestIndex+1).padStart(2,'0') }} / {{ String(timeline.length).padStart(2,'0') }}</span><h3>{{ current.chapter }}</h3><p>{{ nearby ? nearby.summary : 'Keep walking. There’s more to discover.' }}</p></aside>
      <div class="movement-hint">{{ nearLadder ? '↑ / ↓ Climb the ladder' : motion.mode==='sliding' ? 'Enjoy the ride' : 'Swipe ↔ or walk · free return path' }}</div>
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
