export type VisitPhase =
  'outside' | 'approaching' | 'opening' | 'entering' | 'inside' | 'leaving' | 'closing'
export interface BuildingVisit {
  index: number | null
  phase: VisitPhase
  progress: number
}
const durations = { opening: 0.35, entering: 0.7, leaving: 0.7, closing: 0.35 }
/** One reversible door/actor transition, shared by pointer, keyboard and list entry. */
export function advanceVisit(visit: BuildingVisit, dt: number): BuildingVisit {
  if (!(visit.phase in durations)) return visit
  const phase = visit.phase as keyof typeof durations
  const progress = Math.min(1, visit.progress + Math.max(0, dt) / durations[phase])
  if (progress < 1) return { ...visit, progress }
  const next = {
    opening: 'entering',
    entering: 'inside',
    leaving: 'closing',
    closing: 'outside',
  } as const
  return { index: phase === 'closing' ? null : visit.index, phase: next[phase], progress: 0 }
}
export function doorOpenness(visit: BuildingVisit) {
  if (visit.phase === 'opening') return visit.progress
  if (visit.phase === 'closing') return 1 - visit.progress
  return ['entering', 'inside', 'leaving'].includes(visit.phase) ? 1 : 0
}
export function actorEntry(visit: BuildingVisit) {
  if (visit.phase === 'entering') return visit.progress
  if (visit.phase === 'leaving') return 1 - visit.progress
  return visit.phase === 'inside' ? 1 : 0
}
