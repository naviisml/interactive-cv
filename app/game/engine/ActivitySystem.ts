import {
  newFootball,
  kickFootball,
  stepFootball,
  traceCircuit,
  stepCode,
  type Football,
} from '../core/worldActivities'
import type { WorldFrame, SceneEntry } from '../rendering/types'
export class ActivitySystem {
  ball: Football = newFootball()
  goals = 0
  turns = [3, 0, 1, 2, 1, 3]
  code = 0
  runes: number[] = []
  private pad = -1
  private scored = false
  command(action: string, index = 0) {
    if (action === 'kick') this.ball = kickFootball(this.ball)
    if (action === 'reset') {
      this.ball = newFootball()
      this.scored = false
    }
    if (action === 'wire') this.turns[index] = ((this.turns[index] ?? 0) + 1) % 4
    if (action === 'code') this.code = stepCode(this.code, ['{', ';', '}'][index] ?? '{')
  }
  update(
    frame: WorldFrame,
    entry: SceneEntry | undefined,
    dt: number,
    ground: number,
    navigating: boolean,
  ) {
    if (frame.paused) return
    this.ball = stepFootball(this.ball, dt)
    if (this.ball.scored && !this.scored) {
      this.goals++
      this.scored = true
    }
    if (!entry) return
    const x = frame.motion.x - entry.x + 300,
      y = 310 + frame.motion.y + ground
    if (
      entry.event.id === 'panta-rhei' &&
      !navigating &&
      Math.abs(x - this.ball.x) < 24 &&
      y > 278 &&
      frame.motion.vx > 15
    )
      this.command('kick')
    if (entry.event.id === 'coding-college') {
      const pad = y > 294 ? [184, 300, 416].findIndex((px) => Math.abs(px - x) < 27) : -1
      if (pad !== this.pad) {
        this.pad = pad
        if (pad >= 0) this.command('code', pad)
      }
    }
    if (entry.event.id === 'gmodstore')
      for (const [i, rune] of [
        { x: 168, y: 235 },
        { x: 300, y: 151 },
        { x: 432, y: 220 },
      ].entries())
        if (
          !this.runes.includes(i) &&
          Math.abs(x - rune.x) < 24 &&
          rune.y >= y - 94 &&
          rune.y <= y - 5
        )
          this.runes.push(i)
  }
  get circuit() {
    return traceCircuit(this.turns)
  }
}
