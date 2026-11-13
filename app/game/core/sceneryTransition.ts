export interface SceneryStop {
  x: number
  urban: number
  technical: number
}
export function smoothRange(value: number, start = 0, end = 1) {
  const t = Math.max(0, Math.min(1, (value - start) / (end - start)))
  return t * t * (3 - 2 * t)
}
// Scenery follows travelled distance, not the nearest chapter or a timer.
// Reversing retraces the same transition; stopping holds the exact frame.
export function sceneryTransition(x: number, stops: SceneryStop[]) {
  if (!stops.length) return { urban: 0, technical: 0 }
  const right = stops.findIndex((stop) => stop.x > x)
  if (right === 0) return { urban: stops[0]!.urban, technical: stops[0]!.technical }
  if (right < 0) {
    const last = stops.at(-1)!
    return { urban: last.urban, technical: last.technical }
  }
  const from = stops[right - 1]!,
    to = stops[right]!
  const t = smoothRange(x, from.x, to.x)
  return {
    urban: from.urban + (to.urban - from.urban) * t,
    technical: from.technical + (to.technical - from.technical) * t,
  }
}
