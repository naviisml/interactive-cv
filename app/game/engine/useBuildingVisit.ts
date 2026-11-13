import { advanceVisit, type BuildingVisit } from '../core/buildingVisit'
export function useBuildingVisit(journey: ReturnType<typeof import('./useJourney').useJourney>) {
  const visit = reactive<BuildingVisit>({ index: null, phase: 'outside', progress: 0 })
  const blocking = computed(() => !['outside', 'approaching'].includes(visit.phase))
  let previous = 0
  function enter(index: number) {
    journey.goTo(index)
    Object.assign(visit, { index, phase: 'approaching', progress: 0 })
  }
  function leave() {
    if (visit.phase === 'inside') Object.assign(visit, { phase: 'leaving', progress: 0 })
  }
  function cancel() {
    Object.assign(visit, { index: null, phase: 'outside', progress: 0 })
  }
  const unsubscribe = journey.subscribe(() => {
    const now = performance.now(),
      dt = previous ? Math.min(1, (now - previous) / 1000) : 0
    previous = now
    if (visit.phase === 'approaching' && !journey.running.value && visit.index !== null) {
      if (Math.abs(journey.motion.x - journey.eventPosition(visit.index)) < 4)
        Object.assign(visit, { phase: 'opening', progress: 0 })
      else cancel()
    } else Object.assign(visit, advanceVisit(visit, dt))
  })
  onBeforeUnmount(unsubscribe)
  return { visit, blocking, enter, leave, cancel }
}
