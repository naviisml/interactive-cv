import { terrainHeight, type TerrainPoint } from './physics.ts'
export function terrainPose(x: number, halfWidth: number, terrain: TerrainPoint[]) {
  const left = terrainHeight(x - halfWidth, terrain),
    right = terrainHeight(x + halfWidth, terrain)
  return {
    x,
    height: (left + right) / 2,
    angle: (Math.atan2(left - right, halfWidth * 2) * 180) / Math.PI,
  }
}
export const awayFromTerrainCorners = (x: number, margin: number, terrain: TerrainPoint[]) =>
  terrain.every((point) => Math.abs(point.x - x) > margin)
