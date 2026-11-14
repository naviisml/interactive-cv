import { Container, Graphics } from 'pixi.js'
import type { SurfaceRect } from '../../core/monitorSurface'
import { label, rect } from '../drawing'
export class ComputerSprite extends Container {
  private screen = new Container()
  private bezel = new Graphics()

  constructor(locale: string) {
    super()
    // Desk, legs, tower, keyboard and mouse establish scale before the monitor wakes.
    rect(this, -337, -80, 785, 12, 0xa99b72)
    this.addChild(new Graphics().poly([-337, -80, -310, -94, 426, -94, 448, -80]).fill(0xc0ad7d))
    for (const x of [-310, 408]) {
      rect(this, x, -68, 12, 68, 0x6e7e60)
      rect(this, x + 9, -68, 5, 68, 0x3c5b49)
    }
    rect(this, 374, -207, 59, 112, 0x304d43)
    rect(this, 380, -200, 45, 93, 0x47695b)
    rect(this, 387, -189, 31, 4, 0x8ba58d)
    for (let y = -155; y < -117; y += 8) rect(this, 389, y, 27, 2, 0x294a3f)
    this.addChild(this.bezel)
    rect(this, 0, -121, 55, 31, 0x718e7b)
    rect(this, -54, -92, 166, 7, 0x8fa58b)
    this.addChild(new Graphics().poly([-167, -80, -151, -92, 118, -92, 142, -80]).fill(0x4a6957))
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 17; col++) rect(this, -143 + col * 15, -89 + row * 5, 10, 3, 0xa8b699)
    this.addChild(new Graphics().ellipse(191, -85, 13, 7).fill(0xc5c7a4))
    this.addChild(
      new Graphics()
        .moveTo(191, -92)
        .bezierCurveTo(205, -118, 287, -85, 295, -125)
        .stroke({ width: 2, color: 0x54725c }),
    )
    const title = label(this.screen, locale === 'nl' ? 'Mijn projecten' : 'My projects', 24, -264, 30, 0x284a3c, 550)
    title.anchor.x = 0.5
    this.addChild(this.screen)
  }
  setSurface(rect: SurfaceRect, expanded: boolean) {
    this.bezel
      .clear()
      .roundRect(rect.x - 12, rect.y - 12, rect.width + 24, rect.height + 24, 8)
      .fill(0x29463e)
      .stroke({ width: 5, color: 0x7c9588 })
      .rect(rect.x, rect.y, rect.width, rect.height)
      .fill(0xe8ecdf)
    this.screen.visible = !expanded
  }
}
