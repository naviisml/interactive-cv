import { skillGroups } from '../../content/skills.ts'
import {
  advanceQueue,
  circuitSeed,
  tickRover,
  type RoverState,
} from '../core/learningActivities.ts'
import {
  basketballScores,
  advanceAction,
  type SceneAction,
  type ActionState,
} from '../core/sceneActivities.ts'
/** Scene state survives culling and locale changes. Renderers never own the score. */
export class ActivitySystem {
  circuit = [...circuitSeed]
  rover: RoverState = { commands: [], age: 0, status: 'idle' }
  cloud = { workers: 1, queued: 18, processed: 0 }
  web = { theme: 0, records: 0 }
  exploredSkills: string[] = []
  activatedStations: string[] = []
  completeStation(id: string) {
    if (!this.activatedStations.includes(id)) this.activatedStations.push(id)
  }
  activateSkillGroup(index: number) {
    const group = skillGroups[index]
    if (!group) return false
    if (!this.trigger('skill-' + group.id, 'compile')) return false
    for (const id of group.ids) if (!this.exploredSkills.includes(id)) this.exploredSkills.push(id)
    return true
  }
  actions: Record<string, ActionState> = {}
  charges: Record<string, { holding: boolean; power: number; origin?: { x: number; y: number } }> =
    {}
  get charging() {
    return Object.values(this.charges).some((charge) => charge.holding)
  }
  cancelCharge(id: string) {
    const charge = this.charges[id]
    if (charge) Object.assign(charge, { holding: false, power: 0 })
  }
  cancelCharges() {
    for (const id of Object.keys(this.charges)) this.cancelCharge(id)
  }
  trigger(id: string, action: SceneAction, power?: number) {
    const previous = this.actions[id]
    if (previous?.running) return false
    const charged = ['basketball', 'departure', 'camera'].includes(action)
    const strength = Math.max(0, Math.min(1, power ?? 0.65))
    const outcome =
      action === 'basketball'
        ? basketballScores(strength)
          ? 'success'
          : 'retry'
        : action === 'departure'
          ? strength >= 0.72
            ? 'success'
            : 'retry'
          : action === 'camera'
            ? strength >= 0.25 && strength <= 0.5
              ? 'success'
              : strength > 0.5
                ? 'ticket'
                : 'retry'
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
    if (this.charging || this.actions[id]?.running) return false
    this.charges[id] = { holding: true, power: 0 }
    return true
  }
  releaseCharge(id: string, action: SceneAction) {
    const charge = this.charges[id]
    if (!charge?.holding) return false
    charge.holding = false
    const started = this.trigger(id, action, charge.power)
    if (started && charge.origin) this.actions[id]!.origin = { ...charge.origin }
    return started
  }

  tick(dt: number, paused: boolean) {
    if (paused) {
      this.cancelCharges()
      return
    }
    tickRover(this.rover, dt)
    if (this.actions['skill-systems']) advanceQueue(this.cloud, dt)
    for (const [id, charge] of Object.entries(this.charges))
      if (charge.holding) charge.power = Math.min(1, charge.power + Math.max(0, dt) / 1.75)
    for (const [id, state] of Object.entries(this.actions))
      this.actions[id] = advanceAction(state, dt)
  }
}
