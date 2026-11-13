// Catch up ordinary slow frames without a single unsafe physics jump.
// Discard long inactive-tab gaps instead of replaying seconds of missed input.
export function frameSteps(elapsed: number) {
  const duration = Math.min(0.2, Math.max(0, Number.isFinite(elapsed) ? elapsed : 0))
  if (!duration) return []
  const count = Math.ceil(duration / 0.05)
  return Array.from({ length: count }, () => duration / count)
}
