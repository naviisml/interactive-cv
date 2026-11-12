export interface Motion { x: number; y: number; vx: number; vy: number; grounded: boolean; mode?: 'walking' | 'climbing' | 'sliding' }
export interface Platform { id: string; x: number; width: number; height: number }
export interface Ladder { id: string; x: number; bottom: number; top: number }
export interface Slide { id: string; x: number; width: number; from: number; to: number }
export interface TerrainPoint { x: number; height: number }
export interface WorldGeometry { terrain?: TerrainPoint[]; platforms: Platform[]; ladders: Ladder[]; slides: Slide[] }
const emptyWorld: WorldGeometry = { platforms: [], ladders: [], slides: [] }
export function terrainHeight(x: number, points: TerrainPoint[] = []): number {
  if (!points.length) return 0
  if (x <= points[0]!.x) return points[0]!.height
  for (let i = 1; i < points.length; i++) {
    const a = points[i-1]!, b = points[i]!
    if (x <= b.x) return a.height + (b.height-a.height) * (x-a.x)/(b.x-a.x)
  }
  return points[points.length-1]!.height
}
export const motionConfig = { speed: 265, acceleration: 1250, friction: 1550, gravity: 1600, jump: 590, climb: 145, slide: 340 }
export const slideSurface = (slide: Slide, x: number) => -(slide.from + (slide.to - slide.from) * Math.max(0, Math.min(1, (x - slide.x) / slide.width)))
export function findLadder(state: Motion, ladders: Ladder[]) {
  return ladders.find(l => Math.abs(state.x - l.x) <= 30 && state.y >= -l.top - 5 && state.y <= -l.bottom + 5)
}
export function stepMotion(state: Motion, direction: number, jump: boolean, dt: number, width: number, world: WorldGeometry = emptyWorld, vertical = 0): Motion {
  dt = Math.min(Math.max(dt, 0), 0.05)
  const ladder = findLadder(state, world.ladders)
  if (ladder && !jump && !direction && (vertical || state.mode === 'climbing')) {
    const y = Math.max(-ladder.top, Math.min(-ladder.bottom, state.y + vertical * motionConfig.climb * dt)) || 0
    const endpoint = y === -ladder.top || y === -ladder.bottom
    return { x: ladder.x, y, vx: 0, vy: 0, grounded: endpoint, mode: endpoint ? 'walking' : 'climbing' }
  }
  const onSlide = world.slides.find(s => state.x >= s.x - 1 && state.x < s.x + s.width && Math.abs(state.y - slideSurface(s, state.x)) < 6 && state.grounded)
  if (onSlide && !jump) {
    const x = Math.min(width - 45, state.x + motionConfig.slide * dt)
    const y = slideSurface(onSlide, x)
    return { x, y, vx: motionConfig.slide, vy: 0, grounded: true, mode: x < onSlide.x + onSlide.width ? 'sliding' : 'walking' }
  }
  const target = direction * motionConfig.speed
  const amount = (direction ? motionConfig.acceleration : motionConfig.friction) * dt
  let vx = state.vx + Math.sign(target - state.vx) * Math.min(Math.abs(target - state.vx), amount)
  let vy = jump && (state.grounded || state.mode === 'climbing') ? -motionConfig.jump : state.vy
  vy += motionConfig.gravity * dt
  let y = state.y + vy * dt
  let grounded = false
  const x = Math.max(45, Math.min(width - 45, state.x + vx * dt))
  if (x === 45 || x === width - 45) vx = 0
  const ground = -terrainHeight(x, world.terrain) || 0
  const previousGround = -terrainHeight(state.x, world.terrain) || 0
  if (!jump && state.grounded && Math.abs(state.y-previousGround)<.1) {
    return { x, y: ground, vx, vy: 0, grounded: true, mode: 'walking' }
  }
  // Sweep the feet across all surface tops; never snap upward from underneath.
  const surfaces = [ground]
  for (const p of world.platforms) if (x >= p.x && x <= p.x + p.width) surfaces.push(-p.height)
  for (const s of world.slides) if (x >= s.x && x <= s.x + s.width) surfaces.push(slideSurface(s, x))
  if (vy >= 0) {
    const landing = surfaces.filter(surface => state.y <= surface + .01 && y >= surface).sort((a,b) => a-b)[0]
    if (landing !== undefined) { y = landing; vy = 0; grounded = true }
  }
  if (y > ground) { y = ground; vy = 0; grounded = true }
  return { x, y, vx, vy, grounded, mode: 'walking' }
}
export const cameraTarget = (x: number, viewport: number, world: number) => Math.max(0, Math.min(world - viewport, x - viewport * 0.38))
