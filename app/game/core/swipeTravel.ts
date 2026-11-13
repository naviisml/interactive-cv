// Swipes request movement; only the normal, elapsed-time physics loop moves the player.
export const SWIPE_BUFFER = 72
export const SWIPE_TIMEOUT = 120
export function addSwipeDistance(current: number, delta: number): number {
  if (!Number.isFinite(delta)) return current
  if (Math.sign(current) !== Math.sign(delta)) current = 0
  return Math.max(-SWIPE_BUFFER, Math.min(SWIPE_BUFFER, current + delta))
}
export function consumeSwipeDistance(budget: number, moved: number): number {
  if (!budget || Math.sign(budget) !== Math.sign(moved)) return budget
  return Math.sign(budget) * Math.max(0, Math.abs(budget) - Math.abs(moved)) || 0
}
