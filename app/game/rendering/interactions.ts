import { Container, Rectangle, type FederatedPointerEvent } from 'pixi.js'
/** Pointer taps share the canvas with swiping; drags must never fire a scene action. */
export function tapTarget(node: Container, action: () => void, area?: Rectangle) {
  let start: { x: number; y: number } | undefined
  node.eventMode = 'static'
  node.cursor = 'pointer'
  if (area) node.hitArea = area
  node.on('pointerdown', (event: FederatedPointerEvent) => {
    start = { x: event.global.x, y: event.global.y }
  })
  node.on('pointerup', (event: FederatedPointerEvent) => {
    if (start && Math.hypot(event.global.x - start.x, event.global.y - start.y) < 9) action()
    start = undefined
  })
  node.on('pointerupoutside', () => {
    start = undefined
  })
  node.on('pointercancel', () => {
    start = undefined
  })
}

/** Press-and-release interaction; holding changes the game-state charge.
 * Release-outside intentionally counts as release to avoid a stuck throttle.
 */
export function holdTarget(
  node: Container,
  start: () => boolean,
  release: () => void,
  area?: Rectangle,
) {
  let active = false
  node.eventMode = 'static'
  node.cursor = 'pointer'
  if (area) node.hitArea = area
  node.on('pointerdown', (event: FederatedPointerEvent) => {
    active = start()
    if (active) event.stopPropagation()
  })
  const finish = () => {
    if (!active) return
    active = false
    release()
  }
  node.on('pointerup', finish)
  node.on('pointerupoutside', finish)
  node.on('pointercancel', finish)
}
