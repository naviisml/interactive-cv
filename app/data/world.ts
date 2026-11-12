import { timeline, eventX, WORLD_WIDTH } from './timeline'
import { terrainHeight, type WorldGeometry, type TerrainPoint } from '../composables/physics'

// Terrain is the real walkable landscape, in pixels above the shared ground datum.
// Event sites are level clearings. Ramps connect them; no mandatory jumps.
const elevations = [40, 120, 60, 170, 105]
export const terrain: TerrainPoint[] = [{ x: 0, height: 0 }, { x: 270, height: 0 }]
for (let i = 0; i < timeline.length; i++) {
  const h = elevations[i % elevations.length]!
  const x = eventX(i)
  terrain.push({ x: x - 230, height: h }, { x: x + 210, height: h })
  if (i < timeline.length - 1) terrain.push({ x: x + 540, height: Math.max(15, h - 35) })
}
terrain.push({ x: WORLD_WIDTH - 220, height: 15 }, { x: WORLD_WIDTH, height: 15 })
export const worldGeometry: WorldGeometry = { terrain, platforms: [], ladders: [], slides: [] }
for (let i = 0; i < timeline.length - 1; i++) {
  if (i % 4 !== 0) continue
  const x = eventX(i) + 270
  const highestGround = Math.max(...Array.from({length:30},(_,n)=>terrainHeight(x+n*15,terrain)))
  const height = highestGround + 85
  worldGeometry.platforms.push({ id: `deck-${i}`, x, width: 235, height })
  worldGeometry.ladders.push({ id: `ladder-${i}`, x: x + 35, bottom: terrainHeight(x+35, terrain), top: height })
  worldGeometry.slides.push({ id: `slide-${i}`, x: x+235, width: 200, from: height, to: terrainHeight(x+435, terrain) })
}
