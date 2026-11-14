import { Container, Graphics, Rectangle } from 'pixi.js'
import { rect, label } from '../drawing'
import { tapTarget } from '../interactions'
import type { WorldFrame } from '../types'
/** A walkable ending, rather than an overlay or a finish screen. */
export class CampsiteScene extends Container {
  private flame = new Graphics()
  private stars = new Graphics()
  private lantern = new Graphics()
  private interactionGlow = new Graphics()
  private lit = true
  private canvas = new Container()
  private tucked = false
  private zip = new Graphics()
  private heatUntil = 0
  private time = 0
  constructor(
    locale: string,
    private onInteraction: (action: string) => void = () => {},
  ) {
    super()
    this.addChild(new Graphics().ellipse(0, 6, 390, 17).fill({ color: 0x6c805c, alpha: 0.3 }))
    const mailbox = new Container()
    rect(mailbox, 365, -70, 7, 70, 0x647c64)
    mailbox.addChild(new Graphics().roundRect(337, -115, 65, 49, 7).fill(0x466c68))
    rect(mailbox, 347, -99, 44, 5, 0x203f37)
    label(mailbox, 'EMAIL', 350, -85, 9, 0xf4e6c1, 48)
    tapTarget(mailbox, () => this.interact('email'), new Rectangle(328, -128, 88, 128))
    this.addChild(mailbox)
    // Tent in three planes, with an opening which can be zipped/unzipped.
    this.canvas.addChild(
      new Graphics()
        .poly([-300, 0, -225, -157, -72, 0])
        .fill(0xb39a67)
        .poly([-225, -157, -118, -134, 28, 0, -72, 0])
        .fill(0x8c8359)
        .poly([-273, 0, -225, -115, -174, 0])
        .fill(0x3b5b48),
    )
    for (const x of [-302, -68, 27]) rect(this.canvas, x, -3, 7, 5, 0xd1bd8b)
    this.canvas.addChild(
      new Graphics()
        .moveTo(-225, -157)
        .lineTo(-326, -3)
        .moveTo(-118, -134)
        .lineTo(61, -3)
        .stroke({ width: 2, color: 0xc5be92 }),
    )
    tapTarget(this.canvas, () => this.interact('tent'), new Rectangle(-310, -165, 360, 170))
    this.canvas.addChild(this.zip)
    this.canvas.x = -130
    this.addChild(this.canvas)
    for (const x of [104, 164]) rect(this, x, -32, 9, 32, 0x8c7e59)
    rect(this, 89, -39, 107, 9, 0xb2a077)
    rect(this, 89, -49, 107, 7, 0xc2ae80)
    for (const a of [-0.45, 0.35]) {
      const log = new Graphics().roundRect(-27, -7, 54, 12, 3).fill(0x796447)
      log.rotation = a
      log.position.set(5, -6)
      this.addChild(log)
    }
    rect(this, 253, -74, 5, 74, 0x8c9a72)
    rect(this, 238, -93, 35, 21, 0xd8c798)
    this.interactionGlow.eventMode = 'none'
    this.addChild(this.flame, this.stars, this.lantern, this.interactionGlow)
    tapTarget(this.lantern, () => this.interact('lantern'), new Rectangle(211, -110, 88, 115))
    tapTarget(this.flame, () => this.interact('fire'), new Rectangle(-43, -80, 88, 88))
  }
  interact(action: string) {
    if (action === 'email') window.location.href = 'mailto:contact@navel.dev'
    else if (action === 'tent') this.tucked = !this.tucked
    else if (action === 'lantern') this.lit = !this.lit
    else if (action === 'fire') this.heatUntil = this.time + 1800
    else return
    this.onInteraction(action)
  }
  setInteractionGlow(action: string | undefined, time: number, reduced: boolean) {
    this.interactionGlow.clear()
    if (!action) return
    const alpha = reduced ? 0.64 : 0.55 + Math.sin(time / 470) * 0.16
    const style = { color: 0xffdf9e, width: 2.8, alpha }
    if (action === 'email') {
      this.interactionGlow.roundRect(336, -116, 67, 51, 7).stroke(style)
    } else if (action === 'tent') {
      this.interactionGlow.poly([-430, 0, -355, -157, -202, 0]).stroke(style)
    } else if (action === 'lantern') {
      this.interactionGlow.roundRect(237, -95, 37, 24, 2).stroke(style)
    } else if (action === 'fire') {
      this.interactionGlow.poly([-25, -6, -10, -49, 15, -6]).stroke(style)
    }
  }
  update(frame: WorldFrame, reduced: boolean) {
    this.time = frame.time
    const heat = Math.max(0, (this.heatUntil - frame.time) / 1800)
    this.flame.scale.y = 1 + heat * 0.45
    const t = reduced ? 0 : frame.time
    this.flame.clear().ellipse(0, -20, 68, 22).fill({ color: 0xdfbc72, alpha: 0.1 })
    for (let i = 0; i < 3; i++) {
      const sway = Math.sin(t / 170 + i) * 5
      this.flame
        .poly([
          -26 + i * 12,
          -6,
          -18 + i * 12 + sway,
          -37 - i * 9,
          -10 + i * 12,
          -11,
          2 + i * 12 + sway,
          -49 + i * 5,
          15 + i * 9,
          -6,
        ])
        .fill(i === 1 ? 0xe8c780 : 0xc99c5e)
    }
    this.stars.clear()
    if (!reduced)
      for (let i = 0; i < (heat > 0 ? 18 : 9); i++) {
        const age = (t / 2200 + i / 9) % 1
        this.stars
          .rect(Math.sin(i + age) * 18, -35 - age * 70, 2, 2)
          .fill({ color: 0xf2d997, alpha: 1 - age })
      }
    this.lantern.clear()
    if (this.lit)
      this.lantern
        .ellipse(255, -81, 43, 51)
        .fill({ color: 0xf3d692, alpha: 0.12 })
        .rect(245, -89, 21, 15)
        .fill(0xf4dea4)
    this.zip.clear()
    if (this.tucked) this.zip.poly([-273, 0, -225, -115, -174, 0]).fill(0xc1a673)
    this.canvas.alpha = this.tucked ? 0.95 : 1
  }
}
