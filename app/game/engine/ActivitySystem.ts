import { advanceAction, type SceneAction, type ActionState } from '../core/sceneActivities.ts'
/** Scene state survives culling and locale changes. Renderers never own the score. */
export class ActivitySystem {
  exploredSkills: string[] = []
  completedWorkshops: string[] = []
  completeWorkshop(id: string) {
    if (!this.completedWorkshops.includes(id)) this.completedWorkshops.push(id)
  }
  actions: Record<string, ActionState> = {}
  switches: Record<string, number[]> = {}
  charges: Record<string, { holding: boolean; power: number }> = {}
  trigger(id: string, action: SceneAction, power?: number) {
    const previous = this.actions[id]
    if (previous?.running) return false
    const charged = ['basketball', 'departure', 'camera'].includes(action)
    const strength = Math.max(0, Math.min(1, power ?? 0.65))
    const outcome =
      action === 'basketball' ? (strength >= 0.52 && strength <= 0.78 ? 'success' : 'retry')
      : action === 'departure' ? (strength >= 0.72 ? 'success' : 'retry')
      : action === 'camera' ? (strength >= 0.25 && strength <= 0.5 ? 'success' : strength > 0.5 ? 'ticket' : 'retry')
      : 'success'
    this.actions[id] = {
      action,
      age: 0,
      running: true,
      completed: previous?.completed ?? 0,
      successes: previous?.successes ?? 0,
      power: charged ? strength : undefined,
      outcome,
    }
    return true
  }
  beginCharge(id: string) {
    if (this.actions[id]?.running) return false
    this.charges[id] = { holding: true, power: 0 }
    return true
  }
  releaseCharge(id: string, action: SceneAction) {
    const charge = this.charges[id]
    if (!charge?.holding) return false
    charge.holding = false
    return this.trigger(id, action, charge.power)
  }

  tick(dt: number, paused: boolean) {
    if (paused) return
    for (const [id, charge] of Object.entries(this.charges))
      if (charge.holding) charge.power = Math.min(1, charge.power + Math.max(0, dt) / 1.75)
    for (const [id, state] of Object.entries(this.actions))
      this.actions[id] = advanceAction(state, dt)
  }
  toggle(id: string, index: number) {
    const values = this.switches[id] ?? [0, 0, 0]
    values[index] = values[index] ? 0 : 1
    this.switches[id] = values
    return values.every(Boolean)
  }
}
