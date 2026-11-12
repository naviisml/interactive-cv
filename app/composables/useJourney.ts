import { timeline,eventX } from '~/data/timeline'
import { createWorld } from '~/data/world'
import {advanceDestination,navigationDuration,type JourneyDestination} from './navigation'
import { addSwipeDistance, consumeSwipeDistance, SWIPE_TIMEOUT } from './swipeTravel'
import { stepMotion, cameraTarget, findLadder, terrainHeight, type Motion } from './physics'
export function useJourney(trackIndices: ComputedRef<number[]>) {
  const scene=computed(()=>createWorld(trackIndices.value.length))
  const worldGeometry=computed(()=>scene.value.geometry)
  const worldWidth=computed(()=>scene.value.width)
  const eventPosition=(index:number)=>eventX(Math.max(0,trackIndices.value.indexOf(index)))
  const destination=ref<JourneyDestination|null>(null)
  const running=computed(()=>!!destination.value)
  const destinationTitle=computed(()=>destination.value ? timeline[destination.value.index]?.title : '')
  const saved = useState<Motion>('journey-motion', () => ({ x: 170, y: 0, vx: 0, vy: 0, grounded: true, mode: 'walking' }))
  const motion = reactive<Motion>({ ...saved.value, vx: 0, vy: 0 })
  const animationFrame = ref(0)
  let strideDistance=0, animationTime=0, lastScrollTime=0
  const camera = ref(0), viewport = ref(1200), facing = ref(1), paused = ref(false)
  const keys = new Set<string>()
  const touchDirection = ref(0), touchVertical = ref(0)
  let frame = 0, previous = 0, jumpQueued = false, scrollDistance = 0
  const nearestIndex = computed(() => trackIndices.value.reduce((best,i)=>Math.abs(eventPosition(i)-motion.x)<Math.abs(eventPosition(best)-motion.x)?i:best,trackIndices.value[0]!))
  const nearby = computed(() => Math.abs(eventPosition(nearestIndex.value) - motion.x) < 155 ? timeline[nearestIndex.value] : undefined)
  const nearLadder = computed(() => motion.returning ? undefined : findLadder(motion, worldGeometry.value.ladders))
  const progress = computed(() => Math.round(Math.max(0, Math.min(1, (motion.x - 170) / (eventX(trackIndices.value.length - 1) - 170))) * 100))
  function jump() { if (!paused.value) { destination.value=null;jumpQueued = true } }
  function stop() { destination.value=null; scrollDistance = 0; keys.clear(); touchDirection.value = 0; touchVertical.value = 0; jumpQueued = false; motion.vx = 0 }
  function goTo(index:number) {
    if(!trackIndices.value.includes(index))return
    stop()
    const toX=eventPosition(index)
    if(Math.abs(toX-motion.x)<2)return
    destination.value={index,fromX:motion.x,fromY:motion.y,toX,elapsed:0,duration:navigationDuration(toX-motion.x)}
  }
  watch(trackIndices,(indices,previous)=>{
    const previousIndex=previous?.reduce((best,i)=>Math.abs(eventX(previous.indexOf(i))-motion.x)<Math.abs(eventX(previous.indexOf(best))-motion.x)?i:best,previous[0]!) ?? 0
    const next=indices.reduce((best,i)=>Math.abs(i-previousIndex)<Math.abs(best-previousIndex)?i:best,indices[0]!)
    stop();motion.x=eventPosition(next);motion.y=-terrainHeight(motion.x,worldGeometry.value.terrain);motion.vy=0;motion.grounded=true;motion.mode='walking'
    camera.value=cameraTarget(motion.x,viewport.value,worldWidth.value)
  })
  function scrollByDistance(distance: number) {
    if (paused.value || !Number.isFinite(distance)) return
    destination.value=null
    scrollDistance = addSwipeDistance(scrollDistance,distance)
    lastScrollTime = performance.now()
    keys.clear(); touchDirection.value=0; touchVertical.value=0
  }
  function endScrollTravel() { scrollDistance=0 }
  function resize() { viewport.value = window.innerWidth }
  function keydown(e: KeyboardEvent) {
    if (paused.value || (e.target as HTMLElement)?.closest('input, textarea, select, [contenteditable]')) return
    if (e.key === ' ' && (e.target as HTMLElement)?.closest('button, a')) return
    const key = e.key.toLowerCase()
    if (['arrowleft', 'arrowright', 'arrowup', 'arrowdown', ' ', 'a', 'd', 'w', 's'].includes(key)) {
      e.preventDefault(); destination.value=null; keys.add(key)
      if (!e.repeat && (key === ' ' || (['arrowup', 'w'].includes(key) && !nearLadder.value))) jump()
    }
  }
  function keyup(e: KeyboardEvent) { keys.delete(e.key.toLowerCase()) }
  function visibility() { if (document.hidden) stop() }
  function tick(time: number) {
    const dt = previous ? Math.min((time - previous) / 1000, 0.05) : 0
    previous = time
    if (!paused.value) {
      if (time-lastScrollTime>SWIPE_TIMEOUT) scrollDistance=0
      const manualDirection = touchDirection.value || Number(keys.has('arrowright') || keys.has('d')) - Number(keys.has('arrowleft') || keys.has('a'))
      const direction = manualDirection || Math.sign(scrollDistance)*.85
      const vertical = touchVertical.value || Number(keys.has('arrowdown') || keys.has('s')) - Number(keys.has('arrowup') || keys.has('w'))
      const oldX=motion.x,oldY=motion.y
      if(destination.value && (manualDirection || scrollDistance || vertical || jumpQueued)) destination.value=null
      if(destination.value) {
        facing.value=Math.sign(destination.value.toX-destination.value.fromX)
        const next=advanceDestination(destination.value,dt,worldGeometry.value)
        Object.assign(motion,next.motion)
        if(next.done){destination.value=null;motion.vx=0}
      } else {
        if(direction)facing.value=Math.sign(direction)
        Object.assign(motion,stepMotion(motion,direction,jumpQueued,dt,worldWidth.value,worldGeometry.value,vertical))
      }
      if (!manualDirection) scrollDistance=consumeSwipeDistance(scrollDistance,motion.x-oldX)
      if (motion.mode==='climbing') strideDistance+=Math.abs(motion.y-oldY)
      else if (motion.grounded && motion.mode!=='sliding') strideDistance+=Math.abs(motion.x-oldX)
      animationTime+=dt
      animationFrame.value = running.value ? Math.floor(animationTime*12)%8 : motion.mode==='climbing' ? Math.floor(strideDistance/12)%4 : motion.grounded && Math.abs(motion.vx)>15 && motion.mode!=='sliding' ? Math.floor(strideDistance/16)%8 : 0
      if (motion.mode === 'sliding') facing.value = 1
      const target = cameraTarget(motion.x, viewport.value, worldWidth.value)
      camera.value += (target - camera.value) * (1 - Math.exp(-7 * dt))
    }
    jumpQueued = false
    frame = requestAnimationFrame(tick)
  }
  watch(paused,value=>{if(value)stop()})
  onMounted(() => { resize(); camera.value = cameraTarget(motion.x, viewport.value, worldWidth.value); window.addEventListener('resize', resize); window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', stop); document.addEventListener('visibilitychange', visibility); frame = requestAnimationFrame(tick) })
  onBeforeUnmount(() => { saved.value = { ...motion, vx: 0, vy: 0 }; cancelAnimationFrame(frame); window.removeEventListener('resize', resize); window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', stop); document.removeEventListener('visibilitychange', visibility); stop() })
  return { trackIndices,worldGeometry,worldWidth,eventPosition,destination,running,destinationTitle,motion, animationFrame, camera, facing, paused, touchDirection, touchVertical, nearLadder, nearestIndex, nearby, progress, goTo, jump, stop, scrollByDistance, endScrollTravel }
}
