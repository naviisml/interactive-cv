import { skillGroups } from '../../content/skills.ts'
import {
  advanceQueue,
  advancePipeline,
  circuitSeed,
  tickRover,
  type RoverCommand,
  type RoverState,
  type PipelineStep,
  type PipelineState,
} from '../core/learningActivities.ts'
import {
  basketballScores,
  advanceAction,
  type SceneAction,
  type ActionState,
} from '../core/sceneActivities.ts'
/** Scene state survives culling and locale changes. Renderers never own the score. */
export class ActivitySystem {
  /** Interaction education is shown once per object, not once per chapter. */
  readonly usedCues = new Set<string>()
  private readonly cuesStorageKey = 'navel:world-cues:v1'
  restoreCues() {
    if (typeof window === 'undefined') return
    try {
      const saved: unknown = JSON.parse(window.localStorage.getItem(this.cuesStorageKey) ?? '[]')
      if (Array.isArray(saved))
        for (const key of saved)
          if (typeof key === 'string' && /^[a-z0-9-]+:[a-z0-9-]+$/.test(key)) this.usedCues.add(key)
    } catch {
      // Storage is optional (including in private browsing).
    }
  }
  wasCueUsed(scene: string, object: string) {
    return this.usedCues.has(`${scene}:${object}`)
  }
  markCueUsed(scene: string, object: string) {
    const key = `${scene}:${object}`
    if (this.usedCues.has(key)) return
    this.usedCues.add(key)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(this.cuesStorageKey, JSON.stringify([...this.usedCues]))
    } catch {
      // Keep session-level behavior when storage is disabled.
    }
  }
  circuit = [...circuitSeed]
  rover: RoverState = { commands: [], age: 0, status: 'idle' }
  editRover(command: RoverCommand | 'undo') {
    if (this.rover.status === 'running') return false
    if (command === 'undo') this.rover.commands.pop()
    else {
      if (this.rover.commands.length >= 8) return false
      this.rover.commands.push(command)
    }
    this.rover.age = 0
    this.rover.status = 'idle'
    return true
  }
  runRover() {
    if (this.rover.status === 'running' || !this.rover.commands.length) return false
    Object.assign(this.rover, { age: 0, status: 'running' })
    return true
  }
  pipeline: PipelineState = { completed: 0, errors: 0, status: 'idle' }
  playPipelineStep(step: PipelineStep) {
    const correct = advancePipeline(this.pipeline, step)
    if (this.pipeline.status === 'success') this.completeStation('tooling')
    return correct
  }
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
  readonly autoPlayed = new Set<string>()
  autoPlayOnce(id: string, action: SceneAction) {
    if (this.autoPlayed.has(id) || this.actions[id]?.running || this.charges[id]?.holding) return false
    this.autoPlayed.add(id)
    return this.actions[id] ? false : this.trigger(id, action, .85)
  }
  charges: Record<string, { holding: boolean; power: number; mode: 'power' | 'arc'; origin?: { x: number; y: number } }> =
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
          ? 'success'
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
  beginCharge(id: string, mode: 'power' | 'arc' = 'power') {
    if (this.charging || this.actions[id]?.running) return false
    this.charges[id] = { holding: true, power: mode === 'arc' ? 0.65 : 0, mode }
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
    for (const charge of Object.values(this.charges))
      if (charge.holding && charge.mode === 'power')
        charge.power = Math.min(1, charge.power + Math.max(0, dt) / 1.75)
    for (const [id, state] of Object.entries(this.actions))
      this.actions[id] = advanceAction(state, dt)
  }
}
