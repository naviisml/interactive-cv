export interface SurfaceRect {
  x: number
  y: number
  width: number
  height: number
}
export interface ScreenViewport extends SurfaceRect {
  ready: boolean
  kind: 'projects' | 'code'
}
export const projectScreen: SurfaceRect = { x: -296, y: -350, width: 640, height: 211 }
export const firstCodeScreen: SurfaceRect = { x: 97, y: -168, width: 105, height: 65 }
/** Both the Pixi bezel and the DOM app use this exact rectangle. */
export function approachSurface(
  current: SurfaceRect,
  target: SurfaceRect,
  dt: number,
  reduced = false,
) {
  const ease = reduced ? 1 : 1 - Math.exp(-12 * Math.max(0, dt))
  const next = { ...current }
  for (const key of ['x', 'y', 'width', 'height'] as const)
    next[key] =
      Math.abs(target[key] - current[key]) < 0.15
        ? target[key]
        : current[key] + (target[key] - current[key]) * ease
  return next
}
export function surfaceDistance(a: SurfaceRect, b: SurfaceRect) {
  return Math.max(
    ...(['x', 'y', 'width', 'height'] as const).map((key) => Math.abs(a[key] - b[key])),
  )
}
