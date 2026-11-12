export type SwipeAxis = 'pending' | 'horizontal' | 'vertical'
// Decide once. Later diagonal drift must never hand a game swipe to page scrolling.
export function lockSwipeAxis(axis: SwipeAxis, dx: number, dy: number): SwipeAxis {
  if (axis !== 'pending') return axis
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 4) return 'pending'
  return Math.abs(dx) >= Math.abs(dy) ? 'horizontal' : 'vertical'
}
