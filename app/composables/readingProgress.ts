// Positions are DOM row tops relative to the viewport, in narrative order.
export function readingProgress(positions: number[], focus: number, atEnd: boolean) {
  if (!positions.length) return { active: 0, progress: 0 }
  if (atEnd) return { active: positions.length - 1, progress: 100 }
  let active = 0
  positions.forEach((top, i) => { if (top <= focus) active = i })
  const first = positions[0]!, last = positions[positions.length - 1]!
  const progress = Math.round(Math.max(0, Math.min(1, (focus-first)/Math.max(1,last-first))) * 100)
  return { active, progress }
}
