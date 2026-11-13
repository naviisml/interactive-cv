import { SCHOOL_LAB_OFFSET } from '../core/learningActivities'
import { COMPUTER_WATCH_OFFSET } from '~/content/company'
import { journeyLayout, currentSlot } from '../core/journeyLayout'
import { frameSteps } from '../core/frameTiming'
import { eventX } from '~/content/timeline'
import { journeyEvents as timeline } from '~/content/journey'
import { createWorld } from '~/game/core/world'
import { advanceDestination, navigationDuration, type JourneyDestination } from '../core/navigation'
import { addSwipeDistance, consumeSwipeDistance, SWIPE_TIMEOUT } from '../core/swipeTravel'
import { skillTerrain, skillDecks } from '../core/sceneActivities'
import {
  stepMotion,
  cameraTarget,
  findLadder,
  terrainHeight,
  motionConfig,
  type Motion,
} from '../core/physics'
export function useJourney(
  trackIndices: ComputedRef<number[]>,
  view?: ComputedRef<{ viewport: number; scale: number }>,
) {
  const slots = computed(() =>
    journeyLayout(trackIndices.value, (index) => timeline[index]?.span ?? 920),
  )
  const scene = computed(() =>
    createWorld(
      slots.value.map((slot) => ({
        ...slot,
        ending: timeline[slot.index]?.id === 'contact',
        course:
          timeline[slot.index]?.category !== 'skills' &&
          timeline[slot.index]?.id !== 'navel-development',
      })),
    ),
  )
  const worldGeometry = computed(() => {
    const geometry = scene.value.geometry
    const skill = slots.value.find((slot) => timeline[slot.index]?.id === 'skills-road')
    return skill
      ? {
          ...geometry,
          terrain: skillTerrain(
            geometry.terrain ?? [],
            skill.x,
            terrainHeight(skill.x, geometry.terrain),
          ),
        }
      : geometry
  })
  const worldWidth = computed(() => scene.value.width)
  const eventPosition = (index: number) =>
    slots.value.find((slot) => slot.index === index)?.x ?? 780
  const presentation = reactive({ active: false, started: false, progress: 0, center: 0 })
  const seekPresentation = (progress: number) => {
    presentation.progress = Math.max(0, Math.min(1, progress))
  }
  const destination = ref<JourneyDestination | null>(null)
  const running = computed(() => !!destination.value)
  const destinationTitle = computed(() =>
    destination.value ? timeline[destination.value.index]?.title : '',
  )
  const saved = useState<Motion>('journey-motion', () => ({
    x: 170,
    y: 0,
    vx: 0,
    vy: 0,
    grounded: true,
    mode: 'walking',
  }))
  const motion = reactive<Motion>({ ...saved.value, vx: 0, vy: 0 })
  const animationFrame = ref(0)
  let strideDistance = 0,
    lastScrollTime = 0,
    scrollTimeout = SWIPE_TIMEOUT
  const camera = ref(0),
    cameraY = ref(0),
    viewport = ref(1200),
    facing = ref(1),
    paused = ref(false)
  const keys = new Set<string>()
  const touchDirection = ref(0),
    touchVertical = ref(0),
    touchSprint = ref(false),
    sprintHeld = ref(false)
  const sprinting = computed(
    () =>
      (sprintHeld.value || touchSprint.value) &&
      Math.abs(motion.vx) > motionConfig.speed + 5 &&
      motion.grounded,
  )
  const renderListeners = new Set<() => void>()
  const subscribe = (callback: () => void) => {
    renderListeners.add(callback)
    return () => {
      renderListeners.delete(callback)
    }
  }
  let frame = 0,
    previous = 0,
    jumpQueued = false,
    scrollDistance = 0
  const nearestIndex = computed(() => currentSlot(motion.x, slots.value)?.index ?? 0)
  const nearby = computed(() =>
    Math.abs(eventPosition(nearestIndex.value) - motion.x) < 155
      ? timeline[nearestIndex.value]
      : undefined,
  )
  const nearLadder = computed(() => findLadder(motion, worldGeometry.value.ladders))
  const progress = computed(() =>
    Math.round(
      Math.max(0, Math.min(1, (motion.x - 170) / ((slots.value.at(-1)?.x ?? 780) - 170))) * 100,
    ),
  )
  function startPresentation() {
    const index = timeline.findIndex((event) => event.id === 'navel-development')
    if (index < 0) return
    if (presentation.progress >= 1) presentation.progress = 0
    presentation.started = true
    goTo(index)
  }
  function exitPresentation() {
    presentation.started = false
    presentation.active = false
    presentation.progress = 1
    stop()
  }
  function jump() {
    if (!paused.value) {
      destination.value = null
      jumpQueued = true
    }
  }
  function stop() {
    sprintHeld.value = false
    touchSprint.value = false
    destination.value = null
    scrollDistance = 0
    keys.clear()
    touchDirection.value = 0
    touchVertical.value = 0
    jumpQueued = false
    motion.vx = 0
  }
  function goTo(index: number, exactX?: number) {
    if (timeline[index]?.id !== 'navel-development') presentation.started = false
    if (!trackIndices.value.includes(index)) return
    stop()
    const toX =
      exactX ??
      eventPosition(index) +
        (timeline[index]?.id === 'navel-development'
          ? COMPUTER_WATCH_OFFSET
          : timeline[index]?.id === 'contact'
            ? 65
            : ['roc-hilversum', 'coding-college'].includes(timeline[index]?.id ?? '')
              ? SCHOOL_LAB_OFFSET
              : timeline[index]?.id === 'skills-road'
                ? skillDecks[0]!.center
                : 0)
    if (Math.abs(toX - motion.x) < 2) return
    destination.value = {
      index,
      fromX: motion.x,
      fromY: motion.y,
      toX,
      elapsed: 0,
      duration: navigationDuration(toX - motion.x),
    }
  }
  watch(trackIndices, (indices, previous) => {
    const previousSlots = journeyLayout(previous ?? [], (index) => timeline[index]?.span ?? 920)
    const previousIndex = currentSlot(motion.x, previousSlots)?.index ?? 0
    const next = indices.reduce(
      (best, i) => (Math.abs(i - previousIndex) < Math.abs(best - previousIndex) ? i : best),
      indices[0]!,
    )
    stop()
    motion.x = eventPosition(next)
    motion.y = -terrainHeight(motion.x, worldGeometry.value.terrain)
    motion.vy = 0
    motion.grounded = true
    motion.mode = 'walking'
    camera.value = cameraTarget(motion.x, viewport.value, worldWidth.value)
    cameraY.value = Math.max(0, terrainHeight(motion.x, worldGeometry.value.terrain) - 30)
  })
  function scrollByDistance(distance: number, source: 'swipe' | 'wheel' = 'swipe') {
    if (paused.value || !Number.isFinite(distance)) return
    destination.value = null
    scrollDistance = addSwipeDistance(scrollDistance, distance / (view?.value.scale ?? 1))
    lastScrollTime = performance.now()
    scrollTimeout = source === 'wheel' ? 550 : SWIPE_TIMEOUT
    keys.clear()
    touchDirection.value = 0
    touchVertical.value = 0
  }
  function endScrollTravel() {
    scrollDistance = 0
  }
  function resize() {
    viewport.value = view?.value.viewport ?? window.innerWidth
  }
  if (view) watch(view, resize)
  function keydown(e: KeyboardEvent) {
    if (
      paused.value ||
      presentation.active ||
      (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')
    )
      return
    const key = e.key.toLowerCase()
    if (key === ' ' && (e.target as HTMLElement)?.closest('.canvas-accessibility')) return
    if (key === 'shift') {
      sprintHeld.value = true
      return
    }
    if (
      ['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(key)
    ) {
      sprintHeld.value = e.shiftKey
      e.preventDefault()
      destination.value = null
      keys.add(key)
      if (!e.repeat && (key === ' ' || (['arrowup', 'w'].includes(key) && !nearLadder.value)))
        jump()
    }
  }
  function keyup(e: KeyboardEvent) {
    keys.delete(e.key.toLowerCase())
    if (e.key === 'Shift') sprintHeld.value = false
  }
  function visibility() {
    if (document.hidden) stop()
  }
  function tick(time: number) {
    const steps = frameSteps(previous ? (time - previous) / 1000 : 0)
    previous = time
    for (const dt of paused.value ? [] : steps) {
      if (time - lastScrollTime > scrollTimeout) scrollDistance = 0
      const manualDirection =
        touchDirection.value ||
        Number(keys.has('arrowright') || keys.has('d')) -
          Number(keys.has('arrowleft') || keys.has('a'))
      const direction = manualDirection || Math.sign(scrollDistance) * 0.85
      const vertical =
        touchVertical.value ||
        Number(keys.has('arrowdown') || keys.has('s')) -
          Number(keys.has('arrowup') || keys.has('w'))
      const oldX = motion.x,
        oldY = motion.y
      const company = slots.value.find((slot) => timeline[slot.index]?.id === 'navel-development')
      const watchX = (company?.x ?? 0) + COMPUTER_WATCH_OFFSET
      const atComputer =
        company &&
        presentation.started &&
        !destination.value &&
        Math.abs(motion.x - watchX) < Math.max(18, Math.abs(motion.vx) * dt + 4) &&
        motion.grounded &&
        !jumpQueued
      presentation.active = !!atComputer
      if (company) presentation.center = company.x
      if (destination.value && (manualDirection || scrollDistance || vertical || jumpQueued))
        destination.value = null
      if (destination.value) {
        facing.value = Math.sign(destination.value.toX - destination.value.fromX)
        const next = advanceDestination(destination.value, dt, worldGeometry.value)
        Object.assign(motion, next.motion)
        if (next.done) {
          destination.value = null
          motion.vx = 0
        }
      } else if (atComputer) {
        // The character stays at the workstation. Projects are selected in the
        // actual archive UI instead of being cycled by walking or swiping.
        Object.assign(motion, {
          x: watchX,
          y: -terrainHeight(watchX, worldGeometry.value.terrain),
          vx: 0,
          vy: 0,
          grounded: true,
          mode: 'walking',
        })
        facing.value = 1
      } else {
        if (direction) facing.value = Math.sign(direction)
        Object.assign(
          motion,
          stepMotion(
            motion,
            direction,
            jumpQueued,
            dt,
            worldWidth.value,
            worldGeometry.value,
            vertical,
            sprintHeld.value || touchSprint.value,
          ),
        )
      }
      if (!manualDirection)
        scrollDistance = consumeSwipeDistance(scrollDistance, motion.x - oldX)
      if (motion.mode === 'climbing') strideDistance += Math.abs(motion.y - oldY)
      else if (motion.grounded && motion.mode !== 'sliding')
        strideDistance += Math.min(Math.abs(motion.x - oldX), motionConfig.sprint * dt)
      animationFrame.value = running.value
        ? Math.floor(strideDistance / 12)
        : motion.mode === 'climbing'
          ? Math.floor(strideDistance / 12)
          : motion.grounded && Math.abs(motion.vx) > 15 && motion.mode !== 'sliding'
            ? Math.floor(strideDistance / 12)
            : 0
      if (motion.mode === 'sliding') facing.value = 1
      const target = cameraTarget(motion.x, viewport.value, worldWidth.value)
      camera.value += (target - camera.value) * (1 - Math.exp(-7 * dt))
      const verticalTarget = Math.max(0, terrainHeight(motion.x, worldGeometry.value.terrain) - 30)
      cameraY.value += (verticalTarget - cameraY.value) * (1 - Math.exp(-4 * dt))
      jumpQueued = false
    }
    jumpQueued = false
    for (const render of renderListeners) render()
    frame = requestAnimationFrame(tick)
  }
  watch(paused, (value) => {
    if (value) stop()
  })
  onMounted(() => {
    resize()
    cameraY.value = Math.max(0, terrainHeight(motion.x, worldGeometry.value.terrain) - 30)
    camera.value = cameraTarget(motion.x, viewport.value, worldWidth.value)
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', keydown, true)
    window.addEventListener('keyup', keyup)
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    frame = requestAnimationFrame(tick)
  })
  onBeforeUnmount(() => {
    saved.value = { ...motion, vx: 0, vy: 0 }
    cancelAnimationFrame(frame)
    window.removeEventListener('resize', resize)
    window.removeEventListener('keydown', keydown, true)
    window.removeEventListener('keyup', keyup)
    window.removeEventListener('blur', stop)
    document.removeEventListener('visibilitychange', visibility)
    stop()
  })
  return {
    presentation,
    startPresentation,
    exitPresentation,
    seekPresentation,
    subscribe,
    sprinting,
    touchSprint,
    cameraY,
    trackIndices,
    worldGeometry,
    worldWidth,
    eventPosition,
    destination,
    running,
    destinationTitle,
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
  }
}
