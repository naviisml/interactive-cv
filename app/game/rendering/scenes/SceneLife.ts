import { Container, Graphics, Rectangle } from 'pixi.js'
import { tapTarget } from '../interactions'
/** Small animated parts belong to the scene, rather than running CSS over a bitmap. */
export class SceneLife extends Container {
  private ink = new Graphics()
  private boostUntil = 0
  constructor(private id: string) {
    super()
    this.addChild(this.ink)
    if (id === 'fletcher')
      tapTarget(
        this,
        () => {
          this.boostUntil = performance.now() + 2200
        },
        new Rectangle(-182, -155, 110, 155),
      )
  }
  update(time: number, playerNear: boolean, reduced: boolean) {
    this.ink.clear()
    const t = reduced ? 0 : time,
      boost = t < this.boostUntil ? 1.4 : 1
    if (this.id === 'fletcher')
      for (let i = 0; i < 15; i++) {
        const phase = (t / 1100 + i / 15) % 1,
          x = -120 + Math.sin(i * 2.4) * phase * 42,
          y = -114 - boost * Math.sin(phase * Math.PI) * 22 + phase * 92
        this.ink.rect(x, y, 2, 4).fill({ color: 0xd9e4c4, alpha: 0.8 - phase * 0.4 })
      }
    else if (this.id === 'contact') {
      for (let i = 0; i < 12; i++) {
        const age = (t / 1300 + i / 12) % 1
        this.ink
          .rect(-117 + Math.sin(i * 2.1 + age) * 18, -30 - age * 70, 2, 3)
          .fill({ color: 0xe8ce8b, alpha: 1 - age })
      }
      this.ink
        .ellipse(-116, -18, 29, 22)
        .fill({ color: 0xe5c17b, alpha: 0.07 + (reduced ? 0 : Math.sin(t / 180) * 0.025) })
    } else if (this.id === 'navel-cloud') {
      for (let i = 0; i < 8; i++) {
        const x = i < 4 ? -177 : 124,
          y = -117 + (i % 4) * 29
        this.ink.rect(x, y, 4, 4).fill({
          color: 0xede2ac,
          alpha: reduced ? 0.7 : 0.35 + (Math.sin(t / 230 + i) * 0.5 + 0.5) * 0.65,
        })
      }
      for (let i = 0; i < 4; i++) {
        const phase = (t / 2200 + i / 4) % 1
        this.ink.rect(-95 + phase * 197, -12, 5, 4).fill(0xd7dda0)
      }
    } else if (this.id === 'first-lines') {
      for (let i = 0; i < 4; i++)
        this.ink
          .rect(-111, -112 + i * 7, ((Math.floor(t / 120) + i * 7) % 27) + 4, 2)
          .fill({ color: 0xd5dcac, alpha: 0.7 })
      if (reduced || Math.floor(t / 550) % 2 === 0) this.ink.rect(-89, -91, 4, 5).fill(0xecdfaa)
    } else if (this.id === 'get-e') {
      this.ink
        .circle(-66, -35, 2)
        .fill({ color: 0xf0e0a2, alpha: reduced ? 0.8 : 0.3 + Math.sin(t / 250) * 0.3 })
      for (let i = 0; i < 5; i++) {
        const phase = (t / 1200 + i / 5) % 1
        this.ink
          .rect(-176 - phase * 30, -26 - Math.sin(phase * Math.PI) * 5, 4 + phase * 3, 2)
          .fill({ color: 0xb4c5b4, alpha: (1 - phase) * 0.3 })
      }
    } else if (this.id === 'q-lite') {
      for (let i = 0; i < 3; i++) {
        const r = 6 + ((t / 80 + i * 7) % 22)
        this.ink
          .arc(159, -84, r, -0.7, 0.7)
          .stroke({ width: 1, color: 0xd6d4a7, alpha: reduced ? 0.2 : (1 - r / 30) * 0.5 })
      }
    } else if (this.id === 'shopify') {
      for (let i = 0; i < 3; i++) {
        const phase = (t / 2200 + i / 3) % 1
        this.ink
          .rect(-120 + i * 90, -145 - Math.sin(phase * Math.PI) * 4, 6, 3)
          .fill({ color: 0xe6d5a5, alpha: 0.4 })
      }
    } else if (playerNear) {
      for (let i = 0; i < 3; i++) {
        const phase = (t / 2800 + i / 3) % 1
        this.ink
          .rect(-190 + phase * 370, -18 - Math.sin(phase * Math.PI) * 65, 2, 2)
          .fill({ color: 0xe5deb2, alpha: Math.sin(phase * Math.PI) * 0.45 })
      }
    }
  }
}
