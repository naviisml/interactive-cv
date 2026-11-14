import type { Container, Rectangle, FederatedPointerEvent} from 'pixi.js';
/** Pointer taps share the canvas with swiping; drags must never fire a scene action. */
export function tapTarget(node: Container, action: () => void, area?: Rectangle) {
  let start: { x: number; y: number; pointerId: number } | undefined
  node.eventMode = 'static'
  node.cursor = 'pointer'
  if (area) node.hitArea = area
  node.on('pointerdown', (event: FederatedPointerEvent) => {
    if (!start) start = { x: event.global.x, y: event.global.y, pointerId: event.pointerId }
  })
  node.on('pointerup', (event: FederatedPointerEvent) => {
    if (start?.pointerId !== event.pointerId) return
    if (Math.hypot(event.global.x - start.x, event.global.y - start.y) < 9) action()
    start = undefined
  })
  node.on('pointerupoutside', (event: FederatedPointerEvent) => {
    if (start?.pointerId === event.pointerId) start = undefined
  })
  node.on('pointercancel', (event: FederatedPointerEvent) => {
    if (start?.pointerId === event.pointerId) start = undefined
  })
}

/** Press-and-release interaction; holding changes the game-state charge.
 * Release-outside intentionally counts as release to avoid a stuck throttle.
 */
export function holdTarget(
  node: Container,
  start: () => boolean,
  release: () => void,
  area: Rectangle | undefined,
  cancel: () => void,
  aim?: (deltaY: number) => void,
) {
  let pointerId: number | undefined
  let lastY = 0
  node.eventMode = 'static'
  node.cursor = 'pointer'
  if (area) node.hitArea = area
  node.on('pointerdown', (event: FederatedPointerEvent) => {
    if (!start()) return
    pointerId = event.pointerId
    lastY = event.global.y
    event.stopPropagation()
    if ('stopPropagation' in event.nativeEvent) event.nativeEvent.stopPropagation()
  })
  node.on('globalpointermove', (event: FederatedPointerEvent) => {
    if (pointerId !== event.pointerId || !aim) return
    aim(event.global.y - lastY)
    lastY = event.global.y
  })
  const finish = (event: FederatedPointerEvent) => {
    if (pointerId !== event.pointerId) return
    pointerId = undefined
    release()
  }
  node.on('pointerup', finish)
  node.on('pointerupoutside', finish)
  node.on('pointercancel', (event: FederatedPointerEvent) => {
    if (pointerId !== event.pointerId) return
    pointerId = undefined
    cancel()
  })
  node.on('destroyed', () => {
    if (pointerId === undefined) return
    pointerId = undefined
    cancel()
  })
}
