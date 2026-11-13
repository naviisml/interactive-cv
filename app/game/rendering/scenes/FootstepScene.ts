import { Graphics } from 'pixi.js'
import { shadowSurface } from '../../core/physics'
import type { WorldFrame, WorldModel } from '../types'
export class FootstepScene extends Graphics {
  private dust: { x: number; y: number; time: number; direction: number }[] = []
  private previousX = 0
  private grounded = true
  update(frame: WorldFrame, model: WorldModel, reduced: boolean) {
    if (reduced) {
      this.clear()
      return
    }
    const support = shadowSurface(frame.motion, model.geometry)
    if (
      frame.motion.grounded &&
      Math.abs(frame.motion.vx) > 40 &&
      Math.abs(frame.motion.x - this.previousX) > 18
    ) {
      this.previousX = frame.motion.x
      this.dust.push({
        x: frame.motion.x - frame.facing * 9,
        y: support,
        time: frame.time,
        direction: frame.facing,
      })
    }
    if (frame.motion.grounded && !this.grounded)
      for (let i = 0; i < 5; i++)
        this.dust.push({
          x: frame.motion.x + i * 4 - 8,
          y: support,
          time: frame.time - i * 30,
          direction: i % 2 ? 1 : -1,
        })
    this.grounded = frame.motion.grounded
    this.dust = this.dust.filter((p) => frame.time - p.time < 450).slice(-24)
    this.clear()
    for (const p of this.dust) {
      const age = (frame.time - p.time) / 450
      this.rect(p.x - p.direction * age * 15, p.y - 3 - Math.sin(age * Math.PI) * 7, 3, 3).fill({
        color: 0xb6b58d,
        alpha: (1 - age) * 0.35,
      })
    }
  }
}
