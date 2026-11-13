export interface JourneySlot {
  index: number
  x: number
  span: number
  start: number
  end: number
}
export function journeyLayout(
  indices: number[],
  spanFor: (index: number) => number,
): JourneySlot[] {
  let edge = 320
  return indices.map((index) => {
    const span = Math.max(920, spanFor(index)),
      start = edge
    edge += span
    return { index, x: start + span / 2, span, start, end: edge }
  })
}
export function currentSlot(x: number, slots: JourneySlot[]) {
  return slots.find((slot) => x < slot.end) ?? slots.at(-1)
}
