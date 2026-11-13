/** Persistent learning simulations. Coordinates are cells; presentation belongs to Pixi. */
export const SCHOOL_LAB_OFFSET = 280
export const circuitSeed = [1, 0, 3, 1, 0, 2]
// Bits clockwise: north, east, south, west. The two corners turn the current back.
export function wireMask(index: number, rotation: number) {
  const base = index === 2 || index === 5 ? 12 : 10
  return ((base << rotation) | (base >> (4 - rotation))) & 15
}
export function poweredWires(rotations: number[]) {
  const powered: number[] = []
  if (!(wireMask(0, rotations[0]!) & 8)) return powered
  const pending = [0]
  while (pending.length) {
    const cell = pending.shift()!
    if (powered.includes(cell)) continue
    powered.push(cell)
    const x = cell % 3,
      y = Math.floor(cell / 3)
    const neighbours = [
      [0, -1, 1, 4],
      [1, 0, 2, 8],
      [0, 1, 4, 1],
      [-1, 0, 8, 2],
    ]
    for (const [dx, dy, bit, opposite] of neighbours) {
      const nx = x + dx!,
        ny = y + dy!,
        next = ny * 3 + nx
      if (nx < 0 || nx > 2 || ny < 0 || ny > 1) continue
      if (wireMask(cell, rotations[cell]!) & bit! && wireMask(next, rotations[next]!) & opposite!)
        pending.push(next)
    }
  }
  return powered
}
export function circuitConnected(rotations: number[]) {
  return poweredWires(rotations).includes(3) && !!(wireMask(3, rotations[3]!) & 8)
}
export type RoverCommand = 'step' | 'jump'
export interface RoverState {
  commands: RoverCommand[]
  age: number
  status: 'idle' | 'running' | 'error' | 'success'
}
export function roverTrace(commands: RoverCommand[]) {
  const cells = [0]
  let failed = -1
  for (const [index, command] of commands.entries()) {
    const cell = cells.at(-1)! + (command === 'jump' ? 2 : 1)
    cells.push(cell)
    if ([2, 5].includes(cell) || cell > 7) {
      failed = index
      break
    }
  }
  return { cells, failed, success: failed === -1 && cells.at(-1) === 7 }
}
export function tickRover(state: RoverState, dt: number) {
  if (state.status !== 'running') return
  const trace = roverTrace(state.commands)
  state.age = Math.min(trace.cells.length - 1, state.age + Math.max(0, dt))
  if (state.age >= trace.cells.length - 1) state.status = trace.success ? 'success' : 'error'
}

export interface WorkerQueue {
  workers: number
  queued: number
  processed: number
}
export function advanceQueue(queue: WorkerQueue, dt: number) {
  const incoming = Math.max(0, dt) * 1.8
  const handled = Math.min(queue.queued + incoming, queue.workers * 1.2 * Math.max(0, dt))
  queue.queued = Math.min(80, Math.max(0, queue.queued + incoming - handled))
  queue.processed += handled
}

/** A real four-stage delivery pipeline. Invalid order fails and resets the run. */
export const pipelineSteps = ['commit', 'test', 'build', 'deploy'] as const
export type PipelineStep = (typeof pipelineSteps)[number]
export interface PipelineState {
  completed: number
  errors: number
  status: 'idle' | 'running' | 'error' | 'success'
}
export function advancePipeline(state: PipelineState, step: PipelineStep): boolean {
  if (state.status === 'success') {
    state.completed = 0
    state.status = 'idle'
  }
  if (pipelineSteps[state.completed] !== step) {
    state.completed = 0
    state.errors++
    state.status = 'error'
    return false
  }
  state.completed++
  state.status = state.completed === pipelineSteps.length ? 'success' : 'running'
  return true
}
