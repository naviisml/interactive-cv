import { terrainHeight, type Motion, type WorldGeometry } from './physics.ts'
export interface JourneyDestination {
  index: number
  fromX: number
  fromY: number
  toX: number
  elapsed: number
  duration: number
}
export function navigationDuration(distance: number) {
  return Math.min(10, Math.max(0.65, Math.abs(distance) / 600 + 0.22))
}
export function advanceDestination(
  nav: JourneyDestination,
  dt: number,
  world: WorldGeometry,
): { motion: Motion; done: boolean } {
  nav.elapsed = Math.min(nav.duration, nav.elapsed + Math.max(0, Math.min(dt, 0.05)))
  const t = nav.elapsed / nav.duration,
    ramp = Math.min(0.22, nav.duration / 3),
    cruise = nav.duration - ramp
  let distance: number, velocity: number
  if (nav.elapsed < ramp) {
    distance = (nav.elapsed * nav.elapsed) / (2 * ramp)
    velocity = nav.elapsed / ramp
  } else if (nav.elapsed > nav.duration - ramp) {
    const remaining = nav.duration - nav.elapsed
    distance = cruise - (remaining * remaining) / (2 * ramp)
    velocity = remaining / ramp
  } else {
    distance = nav.elapsed - ramp / 2
    velocity = 1
  }
  const x = nav.fromX + ((nav.toX - nav.fromX) * distance) / cruise
  const ground = -terrainHeight(x, world.terrain) || 0
  const settle = Math.min(1, nav.elapsed / 0.25)
  const y = nav.fromY + (ground - nav.fromY) * settle
  return {
    motion: {
      x,
      y,
      vx: ((nav.toX - nav.fromX) * velocity) / cruise,
      vy: 0,
      grounded: Math.abs(y - ground) < 0.1,
      mode: 'walking',
      returning: nav.toX < nav.fromX,
    },
    done: t >= 1,
  }
}
