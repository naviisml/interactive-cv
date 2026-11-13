import { Container, Graphics, Rectangle } from 'pixi.js'
import { tapTarget } from '../interactions'
import { label, rect } from '../drawing'
/** A readable CRT and desk, drawn in the same coordinate system as its hit area. */
export class FirstLinesScene extends Container {
  private pixels = new Graphics()
  private screenGlow = new Graphics()
  constructor(open: () => void) {
    super()
    // Desk feet sit on y=0. The actual screen is the target.
    rect(this, 52, -70, 204, 9, 0xb49a6d)
    for (const x of [62, 238]) {
      rect(this, x, -61, 8, 61, 0x73876b)
      rect(this, x + 2, -61, 2, 57, 0xa8b288)
    }
    this.addChild(
      new Graphics()
        .poly([90, -184, 209, -184, 221, -172, 221, -84, 88, -84, 80, -94, 80, -173])
        .fill(0x9fae8e)
        .rect(88, -176, 124, 83)
        .fill(0xcccfad)
        .rect(97, -168, 105, 65)
        .fill(0x153d35),
    )
    rect(this, 140, -84, 24, 10, 0x859a7e)
    rect(this, 124, -75, 57, 5, 0xa7b491)
    rect(this, 105, -69, 96, 4, 0xd4c49a)
    for (let i = 0; i < 12; i++) rect(this, 109 + i * 7, -69, 4, 2, 0x8c9b7b)
    rect(this, 207, -66, 18, 4, 0xc8c4a0)
    const caption = label(this, '2011 / RETRONET', 153, -219, 15, 0x2b4c3d, 245)
    caption.anchor.x = 0.5
    const hint = label(this, 'HTML + CSS', 153, -198, 11, 0x4a6d56, 210)
    hint.anchor.x = 0.5
    this.screenGlow.eventMode = 'none'
    this.addChild(this.pixels, this.screenGlow)
    const screen = new Container()
    tapTarget(screen, open, new Rectangle(82, -181, 140, 105))
    screen.cursor = 'pointer'
    this.addChild(screen)
  }
  setInteractionGlow(active: boolean, time: number, reduced: boolean) {
    this.screenGlow.clear()
    if (!active) return
    const alpha = reduced ? 0.7 : 0.54 + Math.sin(time / 480) * 0.16
    this.screenGlow
      .roundRect(85, -180, 131, 91, 4)
      .stroke({ color: 0xffe0a2, width: 3, alpha })
      .rect(98, -168, 104, 65)
      .fill({ color: 0xf6d38b, alpha: 0.045 })
  }
  update(time: number, reduced: boolean) {
    this.pixels.clear()
    for (let i = 0; i < 5; i++)
      this.pixels
        .rect(105, -157 + i * 10, reduced ? 44 : 24 + ((Math.floor(time / 190) + i * 17) % 60), 3)
        .fill(i % 2 ? 0xa6c7a0 : 0xddc58b)
    this.pixels.rect(196, -98, 3, 2).fill(0xcfde93)
  }
}
