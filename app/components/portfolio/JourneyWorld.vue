<script setup lang="ts">
import { useBuildingVisit } from '~/game/engine/useBuildingVisit'
import { canEnterBuilding } from '~/content/buildings'
import { JOURNEY_START_X, useJourney } from '~/game/engine/useJourney'
import { useWorldViewport } from '~/game/engine/useWorldViewport'
import { companySlides } from '~/content/company'
import { ActivitySystem } from '~/game/engine/ActivitySystem'
import { hasDetails, type TimelineFilter } from '~/content/timeline'
import { journeyEvents, levelForEvent, firstInLevel, type LevelId } from '~/content/journey'
import { sceneryTransition } from '~/game/core/sceneryTransition'
import { readingProgress } from '~/game/core/readingProgress'
import { lockSwipeAxis, type SwipeAxis } from '~/game/core/swipeDirection'
import type { ScreenViewport } from '~/game/core/monitorSurface'
const visibleHeight = useVisibleViewport()
const screenViewport = shallowRef<ScreenViewport | null>(null)
const monitorStyle = computed(() =>
  screenViewport.value
    ? {
        left: `${screenViewport.value.x}px`,
        top: `${screenViewport.value.y}px`,
        width: `${screenViewport.value.width}px`,
        height: `${screenViewport.value.height}px`,
      }
    : {},
)
const { t, locale } = useI18n()
const localized = usePortfolioContent()
const timeline = computed(() => localized.timeline.value)
const selectedFilter = useState<TimelineFilter>('journey-category', () => 'all')
const filteredIndexes = (filter: TimelineFilter) =>
  journeyEvents.flatMap((event, index) =>
    filter === 'all' || event.category === filter ? [index] : [],
  )
const trackIndices = computed(() => filteredIndexes(selectedFilter.value))
const entries = computed(() =>
  trackIndices.value.map((index) => ({ event: timeline.value[index]!, index })),
)
const filters = ['all', 'work', 'projects', 'school', 'skills'] as const
const worldCanvas = ref<{ interactNearest: () => boolean }>()
const sceneChanging = ref(false)
const worldReady = ref(false)
const rendererUnavailable = ref(false)
const detailIndex = ref<number | null>(null),
  pendingDetailIndex = ref<number | null>(null)
const detailEvent = computed(() =>
  detailIndex.value === null ? undefined : timeline.value[detailIndex.value],
)
const firstCodeOpen = ref(false)
const aboutOpen = ref(false)
let interactionOpener: HTMLElement | undefined
async function restoreInteractionFocus() {
  await nextTick()
  if (interactionOpener?.isConnected) interactionOpener.focus({ preventScroll: true })
  else worldRoot.value?.focus({ preventScroll: true })
  interactionOpener = undefined
}
function dismissIntro() {
  goTo(0)
  worldRoot.value?.focus()
}
function openFirstComputer(event?: MouseEvent) {
  if (listMode.value || firstCodeOpen.value) return
  interactionOpener =
    event?.currentTarget instanceof HTMLElement ? event.currentTarget : worldRoot.value
  stop()
  firstCodeOpen.value = true
}
async function closeFirstComputer() {
  firstCodeOpen.value = false
  await restoreInteractionFocus()
}
let aboutOpener: HTMLElement | undefined
async function openAbout(event?: MouseEvent) {
  if (aboutOpen.value) return
  if (selectedFilter.value !== 'all') await changeFilter('all')
  if (listMode.value) {
    listMode.value = false
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'instant' })
  }
  buildingVisit.cancel()
  detailIndex.value = null
  pendingDetailIndex.value = null
  stop()
  aboutOpener = event?.currentTarget instanceof HTMLElement ? event.currentTarget : worldRoot.value
  aboutOpen.value = true
}
async function closeAbout() {
  aboutOpen.value = false
  await nextTick()
  if (aboutOpener?.isConnected) aboutOpener.focus({ preventScroll: true })
  else worldRoot.value?.focus({ preventScroll: true })
  aboutOpener = undefined
}
async function goFromAboutToComputer() {
  await closeAbout()
  goTo(firstInLevel('about'))
}
let detailOpener: HTMLElement | undefined
const worldRoot = ref<HTMLElement>()
const view = useWorldViewport(worldRoot)
const journey = useJourney(trackIndices, view)
const buildingVisit = useBuildingVisit(journey)
const { visit } = buildingVisit
const activities = markRaw(new ActivitySystem())
const exploredSkill = ref({ name: '', count: 0 })
const skillFeedback = computed(() =>
  current.value.category === 'skills' && exploredSkill.value.name
    ? t('activity.skillFound', {
        name: exploredSkill.value.name,
        count: exploredSkill.value.count,
        total: 18,
      })
    : '',
)
const {
  subscribe,
  sprinting,
  touchSprint,
  cameraY,
  worldGeometry,
  worldWidth: WORLD_WIDTH,
  eventPosition,
  destination,
  running,
  motion,
  animationFrame,
  camera,
  facing,
  paused,
  touchDirection,
  touchVertical,
  nearLadder,
  nearestIndex,
  progress,
  goTo,
  jump,
  stop,
  scrollByDistance,
  endScrollTravel,
} = journey
const introOpacity = computed(() => 1 - Math.min(1, Math.max(0, (motion.x - JOURNEY_START_X) / 160)))
const introDismissed = computed(() => introOpacity.value < .02)
const scenery = computed(() =>
  sceneryTransition(
    motion.x,
    entries.value.map(({ event, index }) => ({
      x: eventPosition(index),
      urban: event.level === 'work' || event.level === 'company' ? 1 : 0,
      technical: event.level === 'skills' ? 1 : 0,
    })),
  ),
)

const projects = computed(() => companySlides(localized.cvTimeline.value))
const rendererModel = computed(() => ({
  width: WORLD_WIDTH.value,
  geometry: worldGeometry.value,
  entries: entries.value.map((entry) => ({ ...entry, x: eventPosition(entry.index) })),
  locale: locale.value,
  tutorial: t('world.route'),
  levelTitles: Object.fromEntries(
    ['about', 'skills', 'work', 'company', 'contact'].map((id) => [id, t('nav.' + id)]),
  ),
}))
function getWorldFrame() {
  return {
    time: performance.now(),
    codeOpen: firstCodeOpen.value,
    motion: { ...motion },
    camera: camera.value,
    cameraY: cameraY.value,
    scale: view.value.scale,
    groundInset: view.value.groundInset,
    animationFrame: animationFrame.value,
    facing: facing.value,
    running: running.value || sprinting.value,
    paused: paused.value,
    urban: scenery.value.urban,
    technical: scenery.value.technical,
    activeId: timeline.value[nearestIndex.value]?.id ?? '',
    visit: { ...visit },
    navigating: running.value,
  }
}
// A direct, shareable, no-canvas entry point for recruiters and low-power devices.
const router = useRouter()
const listMode = useState<boolean>('journey-list-mode', () => false)
const tooltipsEnabled = useState<boolean>('journey-tooltips-enabled', () => true)
function setTooltips(enabled: boolean) {
  tooltipsEnabled.value = enabled
  try {
    localStorage.setItem('navel:tooltips-enabled', String(enabled))
  } catch {
    // Settings still work for the current session when storage is unavailable.
  }
}
const listActive = useState<number>('journey-list-active', () => 0)
const listProgress = useState<number>('journey-list-progress', () => 0)
watch(
  [listMode, detailIndex, buildingVisit.blocking, firstCodeOpen, aboutOpen, rendererUnavailable],
  () => {
    paused.value =
      listMode.value ||
      rendererUnavailable.value ||
      detailIndex.value !== null ||
      firstCodeOpen.value ||
      aboutOpen.value ||
      buildingVisit.blocking.value
  },
  { immediate: true },
)
async function openDetail(index: number, event?: MouseEvent) {
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
  event?.preventDefault()
  if (timeline.value[index]?.category === 'school' && !listMode.value) {
    goTo(index)
    return
  }
  if (canEnterBuilding(timeline.value[index]!.id)) {
    enterBuilding(index, event)
    return
  }
  if (!hasDetails(timeline.value[index]!)) return
  detailOpener = (event?.currentTarget as HTMLElement) || worldRoot.value
  if (listMode.value) {
    if (selectedFilter.value !== 'all') await changeFilter('all')
    listMode.value = false
    pendingDetailIndex.value = index
    goTo(index)
    if (!destination.value) {
      pendingDetailIndex.value = null
      detailIndex.value = index
    }
  } else {
    stop()
    detailIndex.value = index
  }
}
function handleSceneDetails(index: number) {
  if (timeline.value[index]?.id === 'navel-development') goTo(index)
  else void openDetail(index)
}
async function closeDetail() {
  detailIndex.value = null
  await nextTick()
  if (detailOpener?.isConnected) detailOpener.focus()
  else worldRoot.value?.focus()
}
async function changeFilter(filter: TimelineFilter) {
  if (filter === selectedFilter.value || sceneChanging.value) return
  buildingVisit.cancel()
  detailIndex.value = null
  sceneChanging.value = true
  stop()
  await new Promise((resolve) => setTimeout(resolve, 130))
  selectedFilter.value = filter
  await nextTick()
  listActive.value = nearestIndex.value
  if (listMode.value) {
    await nextTick()
    scrollToEvent(listActive.value)
  }
  await new Promise((resolve) => setTimeout(resolve, 40))
  sceneChanging.value = false
}
const listRoot = ref<HTMLElement>()
const activeIndex = computed(() => (listMode.value ? listActive.value : nearestIndex.value))
const displayProgress = computed(() => (listMode.value ? listProgress.value : progress.value))

const visitEvent = computed(() => (visit.index === null ? undefined : timeline.value[visit.index]))
const current = computed(() => timeline.value[nearestIndex.value]!)
const activeLevel = computed(() => levelForEvent(activeIndex.value))
const worldPanelOpen = computed(
  () =>
    !!detailEvent.value ||
    buildingVisit.blocking.value ||
    firstCodeOpen.value ||
    aboutOpen.value,
)
let buildingOpener: HTMLElement | undefined
function enterBuilding(index: number, event?: MouseEvent) {
  buildingOpener =
    event?.currentTarget instanceof HTMLElement ? event.currentTarget : worldRoot.value
  if (listMode.value) listMode.value = false
  buildingVisit.enter(index)
}
watch(
  () => visit.phase,
  async (phase, previous) => {
    if (phase !== 'outside' || previous !== 'closing') return
    await nextTick()
    if (buildingOpener?.isConnected) buildingOpener.focus({ preventScroll: true })
    else worldRoot.value?.focus({ preventScroll: true })
    buildingOpener = undefined
  },
)

watch(destination, (value) => {
  if (value || pendingDetailIndex.value === null) return
  const index = pendingDetailIndex.value
  pendingDetailIndex.value = null
  if (Math.abs(motion.x - eventPosition(index)) < 3) detailIndex.value = index
})
async function navigateLevel(id: LevelId) {
  if (id === 'about') {
    await openAbout()
    return
  }
  buildingVisit.cancel()
  if (selectedFilter.value !== 'all') {
    await changeFilter('all')
    await nextTick()
  }
  const index = firstInLevel(id)
  if (listMode.value) scrollToEvent(index)
  else goTo(index)
}
let gesture:
  { id: number; startX: number; startY: number; lastX: number; horizontal: boolean } | undefined
function gestureStart(event: PointerEvent) {
  if (
    activities.charging ||
    paused.value ||
    event.pointerType !== 'pen' ||
    !event.isPrimary ||
    (event.target as HTMLElement)?.closest(
      'button,a,input,[role="button"],[data-world-activity],[data-world-panel]',
    )
  )
    return
  gesture = {
    id: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    lastX: event.clientX,
    horizontal: false,
  }
}
function gestureMove(event: PointerEvent) {
  if (!gesture || gesture.id !== event.pointerId) return
  if (!gesture.horizontal) {
    const dx = event.clientX - gesture.startX,
      dy = event.clientY - gesture.startY
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
      gesture = undefined
      return
    }
    if (Math.abs(dx) < 8) return
    gesture.horizontal = true
    ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  }
  if (event.cancelable) event.preventDefault()
  scrollByDistance(gesture.lastX - event.clientX)
  gesture.lastX = event.clientX
}
function gestureEnd(event: PointerEvent) {
  if (gesture?.id === event.pointerId) {
    gesture = undefined
    endScrollTravel()
  }
}
// Native touchmove must be non-passive before the gesture starts: cancelling a
// PointerEvent alone does not consistently cancel Safari's page-scrolling touch.
let touchGesture:
  { id: number; startX: number; startY: number; lastX: number; axis: SwipeAxis } | undefined
function touchStart(event: TouchEvent) {
  if (activities.charging || paused.value) return
  touchGesture = undefined
  endScrollTravel()
  if (
    event.touches.length !== 1 ||
    (event.target as Element)?.closest('button,a,input,textarea,select,[data-world-panel]')
  )
    return
  const touch = event.touches[0]!
  touchGesture = {
    id: touch.identifier,
    startX: touch.clientX,
    startY: touch.clientY,
    lastX: touch.clientX,
    axis: 'pending',
  }
}
function touchMove(event: TouchEvent) {
  if (activities.charging) {
    if (event.cancelable) event.preventDefault()
    touchGesture = undefined
    return
  }
  if (!touchGesture) return
  if (event.touches.length !== 1) {
    touchEnd()
    return
  }
  const touch = Array.from(event.touches).find((t) => t.identifier === touchGesture!.id)
  if (!touch) {
    touchGesture = undefined
    return
  }
  touchGesture.axis = lockSwipeAxis(
    touchGesture.axis,
    touch.clientX - touchGesture.startX,
    touch.clientY - touchGesture.startY,
  )
  if (touchGesture.axis !== 'horizontal') return
  // Keep cancelling every move after horizontal lock, even when Y drifts later.
  if (event.cancelable) event.preventDefault()
  scrollByDistance(touchGesture.lastX - touch.clientX)
  touchGesture.lastX = touch.clientX
}
function touchEnd() {
  touchGesture = undefined
  endScrollTravel()
}
function detachTouch(element?: HTMLElement) {
  if (!element) return
  element.removeEventListener('touchstart', touchStart)
  element.removeEventListener('touchmove', touchMove)
  element.removeEventListener('touchend', touchEnd)
  element.removeEventListener('touchcancel', touchEnd)
  touchEnd()
}
watch(
  worldRoot,
  (element, previous) => {
    detachTouch(previous)
    if (!element) return
    element.addEventListener('touchstart', touchStart, { passive: true })
    element.addEventListener('touchmove', touchMove, { passive: false })
    element.addEventListener('touchend', touchEnd, { passive: true })
    element.addEventListener('touchcancel', touchEnd, { passive: true })
  },
  { flush: 'post' },
)
function wheelTravel(event: WheelEvent) {
  if (
    event.ctrlKey ||
    paused.value ||
    activities.charging ||
    (event.target as HTMLElement)?.closest('[data-world-panel]')
  )
    return
  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  event.preventDefault()
  scrollByDistance(delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1), 'wheel')
}
let scrollFrame = 0
function updateListProgress() {
  scrollFrame = 0
  if (!listMode.value || !listRoot.value) return
  const rows = [...listRoot.value.querySelectorAll<HTMLElement>('[data-timeline-index]')]
  const focus = Math.min(window.innerHeight * 0.4, 270)
  const positions = rows.map((row) => row.getBoundingClientRect().top)
  const atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  const reading = readingProgress(positions, focus, atEnd)
  listActive.value = entries.value[reading.active]?.index ?? trackIndices.value[0]!
  listProgress.value = reading.progress
}
function queueListUpdate() {
  if (listMode.value && !scrollFrame) scrollFrame = requestAnimationFrame(updateListProgress)
}
function scrollToEvent(index: number) {
  const target = listRoot.value?.querySelector<HTMLElement>(`[data-timeline-index="${index}"]`)
  if (target)
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY - 160,
      behavior: 'instant',
    })
  queueListUpdate()
}
async function toggleList() {
  aboutOpen.value = false
  buildingVisit.cancel()
  detailIndex.value = null
  pendingDetailIndex.value = null
  if (listMode.value) {
    const returnIndex = listActive.value
    if (selectedFilter.value !== 'all') await changeFilter('all')
    goTo(returnIndex)
    listMode.value = false
    paused.value = false
    await nextTick()
    window.scrollTo({ top: 0, behavior: 'instant' })
  } else {
    listActive.value = nearestIndex.value
    listMode.value = true
    paused.value = true
    await nextTick()
    scrollToEvent(listActive.value)
  }
}
function navigateTimeline(index: number) {
  buildingVisit.cancel()
  if (listMode.value) scrollToEvent(index)
  else goTo(index)
}
function aimKeyboard(event: KeyboardEvent) {
  const ball = activities.charges['panta-rhei']
  if (ball?.holding && ['ArrowUp', 'ArrowDown'].includes(event.key)) {
    event.preventDefault()
    event.stopImmediatePropagation()
    ball.power = Math.max(0, Math.min(1, ball.power + (event.key === 'ArrowUp' ? 0.06 : -0.06)))
    return
  }
}
function interact(event: KeyboardEvent) {
  if (
    paused.value ||
    event.defaultPrevented ||
    event.repeat ||
    listMode.value ||
    visit.phase !== 'outside' ||
    event.key.toLowerCase() !== 'e' ||
    (event.target as HTMLElement)?.closest('button,a,input,textarea,select,[contenteditable]')
  )
    return
  // A world interaction is chosen by proximity to an actual object, not by
  // whichever chapter happened to be selected in the HTML header.
  if (worldCanvas.value?.interactNearest()) event.preventDefault()
}
let worldDisposed = false
onNuxtReady(async () => {
  if (worldDisposed) return
  try {
    const saved = localStorage.getItem('navel:tooltips-enabled')
    if (saved === 'true' || saved === 'false') tooltipsEnabled.value = saved === 'true'
  } catch {
    // Storage is optional.
  }
  // A static export shares one SSR payload across query strings. Resolve the
  // reading-mode URL before mounting Pixi, rather than reusing its world payload.
  if (
    router.currentRoute.value.query.view === 'list' ||
    new URLSearchParams(window.location.search).get('view') === 'list'
  )
    listMode.value = true
  worldReady.value = true
  if (!listMode.value && router.currentRoute.value.query.chapter === 'first-lines') goTo(firstInLevel('about'))
  if (
    !listMode.value &&
    (document.activeElement === document.body ||
      document.activeElement === document.documentElement)
  )
    worldRoot.value?.focus({ preventScroll: true })
  paused.value =
    listMode.value ||
    rendererUnavailable.value ||
    detailIndex.value !== null ||
    firstCodeOpen.value ||
    aboutOpen.value ||
    buildingVisit.blocking.value
  window.addEventListener('keydown', aimKeyboard, true)
  window.addEventListener('keydown', interact)
  window.addEventListener('scroll', queueListUpdate, { passive: true })
  window.addEventListener('resize', queueListUpdate)
  if (listMode.value) {
    await nextTick()
    scrollToEvent(listActive.value)
  }
})
onBeforeUnmount(() => {
  worldDisposed = true
  detachTouch(worldRoot.value)
  window.removeEventListener('keydown', aimKeyboard, true)
  window.removeEventListener('keydown', interact)
  window.removeEventListener('scroll', queueListUpdate)
  window.removeEventListener('resize', queueListUpdate)
  cancelAnimationFrame(scrollFrame)
})
</script>
<template>
  <main
    :style="{ '--visible-viewport-height': visibleHeight ? `${visibleHeight}px` : undefined }"
    class="journey-shell"
    :class="{ 'is-list': listMode, 'scene-changing': sceneChanging }"
  >
    <PortfolioHeader
      :inert="worldPanelOpen"
      :active="activeLevel.id"
      :list-mode="listMode"
      :tooltips-enabled="tooltipsEnabled"
      @navigate="navigateLevel"
      @toggle-list="toggleList"
      @toggle-tooltips="setTooltips"
    />
    <nav v-if="listMode" class="journey-filters" aria-label="Timeline categories">
      <button
        v-for="filter in filters"
        :key="filter"
        :aria-pressed="selectedFilter === filter"
        :data-category="filter"
        @click="changeFilter(filter)"
      >
        <i /><span>{{ t('category.' + filter) }}</span
        ><small>{{ filteredIndexes(filter).length }}</small>
      </button>
    </nav>
    <div v-if="!listMode" class="explore-stage" :class="{ 'intro-dismissed': introDismissed, 'about-visible': aboutOpen }">
      <aside :style="{ opacity: aboutOpen ? 0 : introOpacity }" class="intro-hero" :inert="aboutOpen || introDismissed" :aria-hidden="aboutOpen || introDismissed">
        <div class="intro-copy">
          <p class="eyebrow">NAVARONE ISMAIL / SOFTWARE DEVELOPER</p>
          <h1>{{ locale === 'nl' ? 'Welkom in mijn portfolio.' : 'Welcome to my portfolio.' }}</h1>
          <p class="intro-description">
            <span class="intro-long">{{
              locale === 'nl'
                ? 'Een loopbaan is meer dan een lijst functies. Daarom kun je door mijn verhaal lopen: ontdek wat ik bouwde, hoe ik leerde en de mensen en projecten onderweg.'
                : 'A career is more than a list of job titles. So I made mine a place to explore. Walk through my story, try what I built, and discover the projects along the way.'
            }}</span>
            <span class="intro-short">{{
              locale === 'nl'
                ? 'Ontdek hoe ik leerde, bouwde en teams leidde.'
                : 'Explore how I learned, built and led teams.'
            }}</span>
          </p>
          <p class="intro-desktop">
            <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd>
            {{ locale === 'nl' ? 'lopen' : 'walk' }} · <kbd>Space</kbd>
            {{ locale === 'nl' ? 'springen' : 'jump' }} · <kbd>E</kbd>
            {{ locale === 'nl' ? 'ontdekken' : 'interact' }}
          </p>
          <p class="intro-touch">
            {{
              locale === 'nl'
                ? 'Veeg door de wereld of gebruik de pijlen. Tik op objecten om ze te ontdekken.'
                : 'Swipe through the world or use the arrows. Tap objects to discover what they do.'
            }}
          </p>
          <button type="button" class="intro-story" @click="openAbout">{{ locale === 'nl' ? 'Lees mijn verhaal' : 'Read my story' }}</button>
          <button class="intro-start" @click="dismissIntro">
            {{ locale === 'nl' ? 'Begin met ontdekken' : 'Start exploring' }} →
          </button>
        </div>
      </aside>
      <section
        ref="worldRoot"
        class="world"
        :style="{ '--ground-y': `${view.groundInset}px` }"
        :class="`level-${activeLevel.id}`"
        tabindex="-1"
        :aria-label="t('common.worldLabel')"
        @pointerdown="gestureStart"
        @pointermove="gestureMove"
        @pointerup="gestureEnd"
        @pointercancel="gestureEnd"
        @lostpointercapture="gestureEnd"
        @wheel="wheelTravel"
        @click.self="aboutOpen && closeAbout()"
      >
        <div class="world-scene" :inert="worldPanelOpen">
          <ClientOnly
            ><GameCanvas
              v-if="worldReady"
              ref="worldCanvas"
              :model="rendererModel"
              :active-id="current.id"
              :show-tooltips="tooltipsEnabled"
              :get-frame="getWorldFrame"
              :subscribe="subscribe"
              :activities="activities"
              @availability="rendererUnavailable = !$event"
              @screen="screenViewport = $event"
              @skill="(name, count) => (exploredSkill = { name, count })"
              @details="handleSceneDetails"
              @read-fallback="toggleList"
              @open-first-computer="openFirstComputer"
          /></ClientOnly>
          <div class="world-chrome" :inert="rendererUnavailable">
            <p class="world-chapter-announcement" role="status" aria-live="polite">
              {{ current.title }}. {{ skillFeedback }}
            </p>
            <MovementControls
              :near-ladder="!!nearLadder"
              :paused="paused"
              @direction="touchDirection = $event"
              @vertical="touchVertical = $event"
              @sprint="touchSprint = $event"
              @jump="jump"
            />
          </div>
        </div>
        <BuildingInterior
          v-if="visit.phase === 'inside' && visitEvent"
          :event="visitEvent"
          @leave="buildingVisit.leave"
        />
        <ChapterPanel v-if="detailEvent" :event="detailEvent" @close="closeDetail" />
        <AboutStoryPanel v-if="aboutOpen" @close="closeAbout" @first-computer="goFromAboutToComputer" />
        <div
          v-if="screenViewport && (firstCodeOpen || screenViewport.kind === 'projects')"
          class="monitor-app"
          :data-computer="screenViewport.kind"
          :style="monitorStyle"
          data-world-panel
        >
          <FirstCodeLab v-if="firstCodeOpen && screenViewport.ready" @close="closeFirstComputer" />
          <ProjectScreen v-if="screenViewport.kind === 'projects' && screenViewport.ready" :slides="projects" />
        </div>
      </section>
    </div>
    <section v-else ref="listRoot" class="timeline-list" aria-label="Read the timeline">
      <ReadingList
        :entries="entries"
        :projects="
          localized.cvTimeline.value.filter(
            (e) => projects.some((s) => s.id === e.id) && e.id !== 'navel-development',
          )
        "
        :active="listActive"
        @open="openDetail"
        @back="toggleList"
      />
    </section>
    <JourneyTimeline
      :inert="worldPanelOpen"
      :entries="entries"
      :active="activeIndex"
      :progress="displayProgress"
      :list="listMode"
      @navigate="navigateTimeline"
    />
  </main>
</template>

<style scoped>
.monitor-app {
  position: absolute;
  z-index: 28;
  overflow: hidden;
  contain: layout paint;
  clip-path: inset(0);
  transform: translateZ(0);
  background: #e8ecdf;
  touch-action: pan-y;
}
.explore-stage {
  position: relative;
  display: flex;
  min-height: 0;
  overflow: hidden;
  background: #ded5be;
}
.explore-stage > .world {
  flex: 1;
  min-width: 0;
}
.intro-hero {
  position: absolute;
  inset: 0 auto 0 0;
  width: 66%;
  min-height: 0;
  pointer-events: none;
  min-width: 0;
  display: grid;
  align-items: center;
  overflow: visible;
  z-index: 2;
  background: none;
  transition: opacity 0.18s ease;
}
.intro-hero::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #f8f5edf5 8%, #f8f5eddd 48%, #f8f5ed00 100%);
}
.intro-copy {
  position: relative;
  z-index: 1;
  width: min(640px, 90%);
  min-width: 0;
  padding: 28px clamp(24px, 4vw, 72px);
  box-sizing: border-box;
}
.intro-copy h1 {
  font:
    600 clamp(32px, 4vw, 65px)/1.06 'Space Grotesk',
    sans-serif;
  letter-spacing: -0.05em;
  margin: 22px 0;
  color: #294e40;
  text-wrap: balance;
}
.intro-copy > p:not(.eyebrow) {
  font-size: 15px;
  line-height: 1.8;
  color: #4f695b;
  max-width: 470px;
}
.intro-copy .intro-desktop {
  font-size: 12px !important;
  margin-top: 26px;
}
.intro-touch,
.intro-short {
  display: none;
}
.intro-story { display: inline-flex; align-items: center; min-height: 44px; margin-right: 14px; padding: 0; pointer-events: auto; text-align: left; text-decoration: underline; }
.intro-start {
  pointer-events: auto;
  min-height: 46px;
  padding: 10px 16px;
  border: 1px solid #587b64;
  border-radius: 6px;
  margin-top: 8px;
  background: #315747;
  color: #f8f5ed;
  font-size: 13px;
}
.about-visible .intro-hero,
.intro-dismissed .intro-hero {
  opacity: 0;
  pointer-events: none;
}
@media (pointer: coarse) {
  .intro-desktop {
    display: none;
  }
  .intro-touch {
    display: block;
  }
}
@media (max-width: 700px) {
  .intro-hero {
    width: 100%;
    inset: 0 0 auto;
    background: none;
    align-items: start;
  }
  .intro-hero::before {
    bottom: -72px;
    background: linear-gradient(115deg, #f8f5edf2 5%, #f8f5edcc 60%, #f8f5ed00);
    mask-image: linear-gradient(#000 55%, transparent 100%);
    -webkit-mask-image: linear-gradient(#000 55%, transparent 100%);
  }
  .intro-copy {
    width: 100%;
    min-width: 0;
    padding: 12px 22px 18px;
  }
  .intro-copy .eyebrow {
    font-size: 8px;
    margin: 0;
  }
  .intro-copy h1 {
    font-size: clamp(25px, 7vw, 36px);
    margin: 9px 0;
  }
  .intro-copy > p:not(.eyebrow) {
    font-size: 12px;
    line-height: 1.5;
    margin: 8px 0;
  }
  .intro-copy .intro-desktop {
    display: none;
  }
  .intro-touch {
    display: block;
  }
  .intro-start {
    margin: 0;
    min-height: 44px;
    padding: 7px 12px;
    font-size: 12px;
  }
}
@media (max-height: 740px) and (max-width: 700px) {
  .intro-hero {
    max-height: 55%;
  }
  .intro-long {
    display: none;
  }
  .intro-short {
    display: inline;
  }
}
@media (prefers-reduced-motion: reduce) {
  .intro-hero {
    transition: none;
  }
}

.world-chapter-announcement {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-height: 500px) {
  .intro-copy {
    padding: 12px 22px;
  }
  .intro-copy h1 {
    font-size: 27px;
    margin: 8px 0;
  }
  .intro-copy > p:nth-of-type(2) {
    display: none;
  }
  .intro-copy > p:not(.eyebrow) {
    font-size: 11px !important;
    margin: 6px 0;
  }
}
</style>
