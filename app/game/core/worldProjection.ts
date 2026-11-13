import { sceneLayout } from './sceneLayout.ts'
export function worldProjection(width: number, height: number) {
  const scale = Math.max(
    0.42,
    Math.min(width >= 900 ? 1.3 : 1, (width - 24) / 460, (height - 165) / sceneLayout.height),
  )
  return { scale, viewport: Math.max(1, width) / scale, groundInset: height < 440 ? 56 : 76 }
}
export function renderWindow(camera: number, viewport: number, world: number, overscan = 360) {
  const start = Math.max(0, Math.floor(camera - overscan)),
    end = Math.min(world, Math.ceil(camera + viewport + overscan))
  return { start, end, width: Math.max(1, end - start) }
}
export function parallaxTiles(viewport: number, tile = 1200) {
  const copies = Math.ceil(viewport / tile) + 1
  return { tile, copies, width: copies * tile }
}
export function parallaxOffset(camera: number, speed: number, tile = 1200) {
  return -((((camera * speed) % tile) + tile) % tile)
}
