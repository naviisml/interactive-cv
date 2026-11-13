import { timeline, eventX } from '../../content/timeline.ts'
import { terrainHeight, type WorldGeometry, type TerrainPoint } from './physics.ts'

// Terrain is the real walkable landscape, in pixels above the shared ground datum.
// Event sites are level clearings. Ramps connect them; no mandatory jumps.
const elevations = [40, 120, 60, 170, 105]
export function createWorld(input: number | { x: number; span: number; course?: boolean }[]): {
  geometry: WorldGeometry
  width: number
} {
  const slots =
    typeof input === 'number'
      ? Array.from({ length: input }, (_, i) => ({ x: eventX(i), span: 920, course: true }))
      : input
  const count = slots.length
  const WORLD_WIDTH = (slots.at(-1)?.x ?? 780) + (slots.at(-1)?.span ?? 920) / 2 + 300
  const terrain: TerrainPoint[] = [
    { x: 0, height: 0 },
    { x: 270, height: 0 },
  ]
  for (let i = 0; i < count; i++) {
    const h = elevations[i % elevations.length]!
    const x = slots[i]!.x
    const half = slots[i]!.span / 2
    terrain.push({ x: x - half + 180, height: h }, { x: x + half - 180, height: h })
    if (i < count - 1) terrain.push({ x: x + half + 80, height: Math.max(15, h - 35) })
  }
  terrain.push({ x: WORLD_WIDTH - 220, height: 15 }, { x: WORLD_WIDTH, height: 15 })
  const worldGeometry: WorldGeometry = { terrain, platforms: [], ladders: [], slides: [] }
  for (let i = 0; i < count - 1; i++) {
    if (i % 4 !== 0 || slots[i]?.course === false) continue
    const x = slots[i]!.x + 270
    const highestGround = Math.max(
      ...Array.from({ length: 30 }, (_, n) => terrainHeight(x + n * 15, terrain)),
    )
    const height = highestGround + 85
    worldGeometry.platforms.push({ id: `deck-${i}`, x, width: 235, height })
    worldGeometry.ladders.push({
      id: `ladder-${i}`,
      x: x + 35,
      bottom: terrainHeight(x + 35, terrain),
      top: height,
    })
    worldGeometry.slides.push({
      id: `slide-${i}`,
      x: x + 235,
      width: 200,
      from: height,
      to: terrainHeight(x + 435, terrain),
    })
  }

  return { geometry: worldGeometry, width: WORLD_WIDTH }
}
export const { geometry: worldGeometry } = createWorld(timeline.length)
export const terrain = worldGeometry.terrain!
