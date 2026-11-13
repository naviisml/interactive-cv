/** Coordinates and time in seconds; presentation is separate from Pixi and input. */
export const actionDurations = {
  basketball: 2.5,
  departure: 6,
  camera: 4.5,
  luggage: 4,
  circuit: 1.4,
  compile: 2,
} as const
export type SceneAction = keyof typeof actionDurations
export interface ActionState {
  action: SceneAction
  age: number
  running: boolean
  completed: number
  /** Power recorded at release. All three motor/ball activities are controllable. */
  power?: number
  outcome?: 'success' | 'retry' | 'ticket'
  successes?: number
}
export function advanceAction(state: ActionState, dt: number): ActionState {
  if (!state.running) return state
  const age = Math.min(actionDurations[state.action], state.age + Math.max(0, dt))
  const finished = age >= actionDurations[state.action]
  return {
    ...state,
    age,
    running: !finished,
    completed: state.completed + Number(finished),
    successes: (state.successes ?? 0) + Number(finished && state.outcome !== 'retry' && state.outcome !== 'ticket'),
  }
}
export function aircraftPose(age: number) {
  const taxi = Math.min(age, 1.4),
    flight = Math.max(0, age - 1.4)
  return {
    x: 130 + taxi * taxi * 28 + flight * 190,
    y: -22 - Math.pow(flight, 1.5) * 41,
    angle: -Math.min(12, flight * 8),
    scale: Math.max(0.48, 1 - flight * 0.075),
  }
}
export function cameraCarPose(age: number, speed = 62) {
  // The chosen speed changes when the car reaches the actual camera, not just its label.
  const x = -280 + age * 155 * (0.4 + speed / 100)
  return { x, flash: speed > 50 && x >= 125 && x < 180 }
}
export function basketballPose(age: number, power = 0.65) {
  const deviation = (power - 0.65) * 360
  if (age <= 1.1) {
    const t = age / 1.1
    return { x: -90 + (290 + deviation) * t, y: -10 - 120 * t - (80 + deviation * 0.2) * 4 * t * (1 - t) }
  }
  if (age <= 1.5) return { x: 200 + deviation, y: -130 + (age - 1.1) * 115 }
  const t = Math.min(1, (age - 1.5) / 0.7)
  return { x: 200 + deviation + 30 * t, y: -84 + 74 * t - 18 * Math.sin(t * Math.PI) }
}
export const skillDecks = [
  { id: 'tooling-bench', offset: -530, width: 190, height: 35 },
  { id: 'web-bridge', offset: -80, width: 210, height: 66 },
  { id: 'cloud-deck', offset: 365, width: 190, height: 43 },
] as const
export function skillTerrain(
  terrain: { x: number; height: number }[],
  center: number,
  ground: number,
) {
  const inside = [{ x: center - 650, height: ground }]
  for (const deck of skillDecks)
    inside.push(
      { x: center + deck.offset - 65, height: ground },
      { x: center + deck.offset, height: ground + deck.height },
      { x: center + deck.offset + deck.width, height: ground + deck.height },
      { x: center + deck.offset + deck.width + 55, height: ground },
    )
  inside.push({ x: center + 650, height: ground })
  return [
    ...terrain.filter((p) => p.x < center - 650),
    ...inside,
    ...terrain.filter((p) => p.x > center + 650),
  ].sort((a, b) => a.x - b.x)
}

export const buildingActions: Record<string, SceneAction> = {
  'panta-rhei': 'basketball',
  'roc-hilversum': 'circuit',
  'coding-college': 'compile',
  fletcher: 'luggage',
  'get-e': 'departure',
  appjection: 'camera',
}
