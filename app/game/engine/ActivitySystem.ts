import { advanceAction, type SceneAction, type ActionState } from '../core/sceneActivities.ts'
/** Scene state survives culling and locale changes. Renderers never own the score. */
export class ActivitySystem {
  exploredSkills: string[] = []
  actions: Record<string, ActionState> = {}
  switches: Record<string, number[]> = {}
  trigger(id: string, action: SceneAction) {
    const previous = this.actions[id]
    if (previous?.running) return false
    this.actions[id] = { action, age: 0, running: true, completed: previous?.completed ?? 0 }
    return true
  }
  tick(dt: number, paused: boolean) {
    if (paused) return
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
