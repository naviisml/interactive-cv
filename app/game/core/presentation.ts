export function stepPresentation(progress: number, direction: number, distance: number) {
  return Math.max(0, Math.min(1, progress + (direction * Math.max(0, distance)) / 2200))
}
export function presentationSlide(progress: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)))
}
