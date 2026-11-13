<script setup lang="ts">
import { useBuildingVisit } from '~/game/engine/useBuildingVisit'
import { isBuilding } from '~/content/buildings'
import { useJourney } from '~/game/engine/useJourney'
import { useWorldViewport } from '~/game/engine/useWorldViewport'
import { companySlides } from '~/content/company'
import { ActivitySystem } from '~/game/engine/ActivitySystem'
import { timeline as cvTimeline, hasDetails, type TimelineFilter } from '~/content/timeline'
import { journeyEvents, levelForEvent, firstInLevel, type LevelId } from '~/content/journey'
import { sceneryTransition } from '~/game/core/sceneryTransition'
import { readingProgress } from '~/game/core/readingProgress'
import { lockSwipeAxis, type SwipeAxis } from '~/game/core/swipeDirection'
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
const sceneChanging = ref(false)
const detailIndex = ref<number | null>(null),
  pendingDetailIndex = ref<number | null>(null)
const detailEvent = computed(() =>
  detailIndex.value === null ? undefined : timeline.value[detailIndex.value],
)
const moneyOpen = ref(false)
const firstCodeOpen = ref(false)
const workshopIndex = ref<number | null>(null)
let interactionOpener: HTMLElement | undefined
function rememberInteractionFocus() {
  const active = document.activeElement
  interactionOpener = active instanceof HTMLElement && active !== document.body
    ? active : undefined
}
async function restoreInteractionFocus() {
  await nextTick()
  if (interactionOpener?.isConnected) interactionOpener.focus({ preventScroll: true })
  else worldRoot.value?.focus({ preventScroll: true })
  interactionOpener = undefined
}
function openFirstComputer() {
  if (listMode.value || firstCodeOpen.value) return
  rememberInteractionFocus()
  stop()
  firstCodeOpen.value = true
}
async function closeFirstComputer() {
  firstCodeOpen.value = false
  await restoreInteractionFocus()
}
let detailOpener: HTMLElement | undefined
const worldRoot = ref<HTMLElement>()
const view = useWorldViewport(worldRoot)
const journey = useJourney(trackIndices, view)
const buildingVisit = useBuildingVisit(journey)
const { visit } = buildingVisit
const activities = markRaw(new ActivitySystem())
const completedWorkshops = ref<string[]>([])
function openWorkshop(index: number) {
  if (listMode.value || workshopIndex.value !== null) return
  rememberInteractionFocus()
  stop()
  workshopIndex.value = index
}
async function closeWorkshop() {
  workshopIndex.value = null
  await restoreInteractionFocus()
}
function finishWorkshop(id: string) {
  activities.completeWorkshop(id)
  completedWorkshops.value = [...activities.completedWorkshops]
}
const exploredSkill = ref({ name: '', count: 0 })
const skillFeedback = computed(() =>
  current.value.category === 'skills'
    ? t(exploredSkill.value.name ? 'activity.skillFound' : 'activity.skillsHint', {
        name: exploredSkill.value.name,
        count: exploredSkill.value.count,
        total: 18,
      })
    : '',
)
const {
  presentation,
  startPresentation,
  exitPresentation,
  seekPresentation,
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
  nearby,
  progress,
  goTo,
  jump,
  stop,
  scrollByDistance,
  endScrollTravel,
} = journey
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

const rendererModel = computed(() => ({
  width: WORLD_WIDTH.value,
  geometry: worldGeometry.value,
  entries: entries.value.map((entry) => ({ ...entry, x: eventPosition(entry.index) })),
  slides: companySlides(localized.cvTimeline.value),
  locale: locale.value,
  tutorial: t('world.route'),
  levelTitles: Object.fromEntries(
    ['about', 'skills', 'work', 'company', 'contact'].map((id) => [id, t('nav.' + id)]),
  ),
}))
function getWorldFrame() {
  return {
    time: performance.now(),
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
    presentation: { ...presentation },
    visit: { ...visit },
    navigating: running.value,
  }
}
// A direct, shareable, no-canvas entry point for recruiters and low-power devices.
const route = useRoute()
const listMode = useState<boolean>('journey-list-mode', () => route.query.view === 'list')
const listActive = useState<number>('journey-list-active', () => 0)
const listProgress = useState<number>('journey-list-progress', () => 0)
watch(
  [listMode, detailIndex, moneyOpen, buildingVisit.blocking, firstCodeOpen, workshopIndex],
  () => {
    paused.value =
      listMode.value ||
      detailIndex.value !== null ||
      moneyOpen.value ||
      firstCodeOpen.value ||
      workshopIndex.value !== null ||
      buildingVisit.blocking.value
  },
  { immediate: true },
)
async function openDetail(index: number, event?: MouseEvent) {
  if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return
  event?.preventDefault()
  if (isBuilding(timeline.value[index]!.id)) {
    if (listMode.value) listMode.value = false
    buildingVisit.enter(index)
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
const destinationTitle = computed(() =>
  destination.value ? timeline.value[destination.value.index]?.title : '',
)
const visitEvent = computed(() => (visit.index === null ? undefined : timeline.value[visit.index]))
const enterable = computed(
  () =>
    isBuilding(current.value.id) && Math.abs(motion.x - eventPosition(nearestIndex.value)) < 200,
)
const current = computed(() => timeline.value[nearestIndex.value]!)
const nearFirstComputer = computed(
  () => current.value.id === 'first-lines' &&
    Math.abs(motion.x - (eventPosition(nearestIndex.value) - 90)) < 210,
)
const nearbyWorkshop = computed(() => {
  if (current.value.id !== 'skills-road') return null
  const offset = motion.x - eventPosition(nearestIndex.value)
  const positions = [-440, 0, 440]
  const closest = positions.reduce((best, x, index) =>
    Math.abs(offset - x) < Math.abs(offset - positions[best]!) ? index : best, 0)
  return Math.abs(offset - positions[closest]!) < 220 ? closest : null
})
const activeLevel = computed(() => levelForEvent(activeIndex.value))
const financeIndex = computed(() =>
  cvTimeline.findIndex((event) => event.id === timeline.value[activeIndex.value]?.id),
)
watch(destination, (value) => {
  if (value || pendingDetailIndex.value === null) return
  const index = pendingDetailIndex.value
  pendingDetailIndex.value = null
  if (Math.abs(motion.x - eventPosition(index)) < 3) detailIndex.value = index
})
async function navigateLevel(id: LevelId) {
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
  if (event.ctrlKey || paused.value) return
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
function interact(event: KeyboardEvent) {
  if (
    !listMode.value &&
    detailIndex.value === null &&
    visit.phase === 'outside' &&
    event.key.toLowerCase() === 'e' &&
    nearby.value &&
    isBuilding(nearby.value.id) &&
    !(event.target as HTMLElement)?.closest('button,a,input')
  )
    openDetail(nearestIndex.value)
}
onMounted(async () => {
  if (
    !listMode.value &&
    (document.activeElement === document.body ||
      document.activeElement === document.documentElement)
  )
    worldRoot.value?.focus({ preventScroll: true })
  paused.value =
    listMode.value || detailIndex.value !== null || moneyOpen.value || firstCodeOpen.value || workshopIndex.value !== null || buildingVisit.blocking.value
  window.addEventListener('keydown', interact)
  window.addEventListener('scroll', queueListUpdate, { passive: true })
  window.addEventListener('resize', queueListUpdate)
  if (listMode.value) {
    await nextTick()
    scrollToEvent(listActive.value)
  }
})
onBeforeUnmount(() => {
  detachTouch(worldRoot.value)
  window.removeEventListener('keydown', interact)
  window.removeEventListener('scroll', queueListUpdate)
  window.removeEventListener('resize', queueListUpdate)
  cancelAnimationFrame(scrollFrame)
})
</script>
<template>
  <main class="journey-shell" :class="{ 'is-list': listMode, 'scene-changing': sceneChanging }">
    <PortfolioHeader
      :active="activeLevel.id"
      :finance-index="financeIndex"
      :context-title="timeline[activeIndex]?.title"
      :list-mode="listMode"
      @navigate="navigateLevel"
      @toggle-list="toggleList"
      @money-toggle="moneyOpen = $event"
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
    <section
      v-if="!listMode"
      ref="worldRoot"
      class="world"
      :style="{ '--ground-y': `${view.groundInset}px` }"
      :class="`level-${activeLevel.id}`"
      tabindex="-1"
      @pointerdown="gestureStart"
      @pointermove="gestureMove"
      @pointerup="gestureEnd"
      @pointercancel="gestureEnd"
      @lostpointercapture="gestureEnd"
      @wheel="wheelTravel"
      :aria-label="t('common.worldLabel')"
    >
      <div class="world-scene" :inert="!!detailEvent || visit.phase === 'inside' || firstCodeOpen || workshopIndex !== null">
        <ClientOnly
          ><GameCanvas
            :model="rendererModel"
            :active-id="current.id"
            :get-frame="getWorldFrame"
            :subscribe="subscribe"
            :activities="activities"
            @skill="(name, count) => (exploredSkill = { name, count })"
            @details="handleSceneDetails"
            @seek="seekPresentation"
            @start-computer="startPresentation"
            @read-fallback="toggleList"
            @open-first-computer="openFirstComputer"
            @open-workshop="openWorkshop"
        /></ClientOnly>
        <ChapterCaption
          :current="current"
          :running="running"
          :destination-title="destinationTitle"
          :feedback="skillFeedback"
          :enterable="enterable"
          @enter="buildingVisit.enter(nearestIndex)"
          @details="openDetail(nearestIndex, $event)"
          @cancel="stop"
        />
        <button
          v-if="nearFirstComputer && !running && !firstCodeOpen"
          class="first-code-launch is-first-code"
          @click="openFirstComputer"
        >
          {{ locale === 'nl' ? 'Open de eerste computer' : 'Open the first computer' }}
        </button>
        <button
          v-if="nearbyWorkshop !== null && !running && workshopIndex === null"
          class="first-code-launch"
          @click="openWorkshop(nearbyWorkshop!)"
        >
          {{ locale === 'nl' ? 'Open de werkbanken' : 'Open the workstations' }}
        </button>
        <CompanyControls
          v-if="presentation.active"
          :progress="presentation.progress"
          :slides="rendererModel.slides"
          @seek="seekPresentation"
          @exit="exitPresentation"
        />
        <MovementControls
          :near-ladder="!!nearLadder"
          :paused="paused"
          @direction="touchDirection = $event"
          @vertical="touchVertical = $event"
          @sprint="touchSprint = $event"
          @jump="jump"
        />
      </div>
      <BuildingInterior
        v-if="visit.phase === 'inside' && visitEvent"
        :event="visitEvent"
        @leave="buildingVisit.leave"
      />
      <ChapterPanel v-if="detailEvent" :event="detailEvent" @close="closeDetail" />
      <FirstCodeLab v-if="firstCodeOpen" @close="closeFirstComputer" />
      <SkillWorkshop
        v-if="workshopIndex !== null"
        :initial-group="workshopIndex"
        :completed="completedWorkshops"
        @complete="finishWorkshop"
        @close="closeWorkshop"
      />
    </section>
    <section v-else ref="listRoot" class="timeline-list" aria-label="Read the timeline">
      <ReadingList
        :entries="entries"
        :projects="
          localized.cvTimeline.value.filter(
            (e) => rendererModel.slides.some((s) => s.id === e.id) && e.id !== 'navel-development',
          )
        "
        :active="listActive"
        @open="openDetail"
        @back="toggleList"
      />
    </section>
    <JourneyTimeline
      :entries="entries"
      :active="activeIndex"
      :progress="displayProgress"
      :list="listMode"
      @navigate="navigateTimeline"
    />
  </main>
</template>

<style scoped>
.first-code-launch {
  position: absolute;
  top: 168px;
  right: clamp(18px, 3vw, 48px);
  z-index: 7;
  min-height: 44px;
  padding: 11px 15px;
  color: #e9e7cc;
  background: #365f4c;
  border: 1px solid #c6cea6;
  border-radius: 6px;
  box-shadow: 0 5px 20px #25473a26, 0 3px 0 #25473a44;
  font: 600 12px 'Space Grotesk', sans-serif;
}
.first-code-launch:hover { background: #284c3f; }
.first-code-launch:focus-visible { outline: 3px solid #e1bc7f; }
@media (max-width: 700px) {
  .first-code-launch { top: 138px; right: 16px; max-width: 185px; }
  .first-code-launch.is-first-code { top: 233px; }
}
</style>
