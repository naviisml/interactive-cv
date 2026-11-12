import { timeline, eventX, WORLD_WIDTH } from '~/data/timeline'
import { worldGeometry } from '~/data/world'
import { stepMotion, cameraTarget, findLadder, terrainHeight, travelMotion, type Motion } from './physics'
export function useJourney() {
  const saved = useState<Motion>('journey-motion', () => ({ x: 170, y: 0, vx: 0, vy: 0, grounded: true, mode: 'walking' }))
  const motion = reactive<Motion>({ ...saved.value, vx: 0, vy: 0 })
  const camera = ref(0), viewport = ref(1200), facing = ref(1), paused = ref(false)
  const keys = new Set<string>()
  const touchDirection = ref(0), touchVertical = ref(0)
  let frame = 0, previous = 0, jumpQueued = false, scrollDistance = 0
  const nearestIndex = computed(() => timeline.reduce((best, _, i) => Math.abs(eventX(i) - motion.x) < Math.abs(eventX(best) - motion.x) ? i : best, 0))
  const nearby = computed(() => Math.abs(eventX(nearestIndex.value) - motion.x) < 155 ? timeline[nearestIndex.value] : undefined)
  const nearLadder = computed(() => motion.returning ? undefined : findLadder(motion, worldGeometry.ladders))
  const progress = computed(() => Math.round(Math.max(0, Math.min(1, (motion.x - 170) / (eventX(timeline.length - 1) - 170))) * 100))
  function jump() { if (!paused.value) jumpQueued = true }
  function stop() { scrollDistance = 0; keys.clear(); touchDirection.value = 0; touchVertical.value = 0; jumpQueued = false; motion.vx = 0 }
  function goTo(index: number) { if (!timeline[index]) return; stop(); Object.assign(motion, { x: eventX(index), y: -terrainHeight(eventX(index), worldGeometry.terrain), vy: 0, grounded: true, mode: 'walking', returning: false }); saved.value = { ...motion }; camera.value = cameraTarget(motion.x, viewport.value, WORLD_WIDTH) }
  function scrollByDistance(distance: number) {
    if (paused.value || !Number.isFinite(distance)) return
    if (Math.sign(scrollDistance) !== Math.sign(distance)) scrollDistance = 0
    scrollDistance = Math.max(-1200,Math.min(1200,scrollDistance+distance))
    keys.clear(); touchDirection.value=0; touchVertical.value=0
  }
  function resize() { viewport.value = window.innerWidth }
  function keydown(e: KeyboardEvent) {
    if (paused.value || (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')) return
    if (e.key === ' ' && (e.target as HTMLElement)?.closest('button, a')) return
    const key = e.key.toLowerCase()
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(key)) {
      e.preventDefault(); keys.add(key)
      if (!e.repeat && (key === ' ' || (['arrowup', 'w'].includes(key) && !nearLadder.value))) jump()
    }
  }
  function keyup(e: KeyboardEvent) { keys.delete(e.key.toLowerCase()) }
  function visibility() { if (document.hidden) stop() }
  function tick(time: number) {
    const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0
    previous = time
    if (!paused.value) {
      const direction = touchDirection.value || Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'))
      const vertical = touchVertical.value || Number(keys.has('arrowdown') || keys.has('s')) - Number(keys.has('arrowup') || keys.has('w'))
      if (scrollDistance) {
        const travel = scrollDistance
        scrollDistance = 0
        Object.assign(motion, travelMotion(motion,travel,WORLD_WIDTH,worldGeometry))
        facing.value = Math.sign(travel)
      }
      if (direction) facing.value = direction
      Object.assign(motion, stepMotion(motion, direction, jumpQueued, dt, WORLD_WIDTH, worldGeometry, vertical))
      if (motion.mode === 'sliding') facing.value = 1
      const target = cameraTarget(motion.x, viewport.value, WORLD_WIDTH)
      camera.value += (target - camera.value) * (1 - Math.exp(-7 * dt))
    }
    jumpQueued = false
    frame = requestAnimationFrame(tick)
  }
  watch(paused, stop)
  onMounted(() => { resize(); camera.value = cameraTarget(motion.x, viewport.value, WORLD_WIDTH); window.addEventListener('resize', resize); window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', stop); document.addEventListener('visibilitychange', visibility); frame = requestAnimationFrame(tick) })
  onBeforeUnmount(() => { saved.value = { ...motion, vx: 0, vy: 0 }; cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', visibility); stop() })
  return { motion, camera, facing, paused, touchDirection, touchVertical, nearLadder, nearestIndex, nearby, progress, goTo, jump, stop, scrollByDistance }
}
