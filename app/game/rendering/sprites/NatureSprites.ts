import { Container, Graphics } from 'pixi.js'
import { rect, polygon } from '../drawing'
/** A shaded pixel pine with a separate crown for wind/felling animation. */
export class PineSprite extends Container {
  readonly crown = new Container()
  constructor(color = 0x3c7063) {
    super()
    rect(this, -4, -108, 8, 108, 0x4b6851)
    rect(this, 0, -108, 4, 108, 0x34594c)
    this.crown.y = -82
    this.addChild(this.crown)
    const points = [
      0, -139, -14, -114, -7, -114, -23, -88, -14, -88, -31, -59, -20, -59, -39, -26, -27, -26, -46,
      8, 46, 8, 27, -26, 39, -26, 20, -59, 31, -59, 14, -88, 23, -88, 7, -114, 14, -114,
    ]
    const g = new Graphics()
    polygon(g, points, color)
    polygon(
      g,
      [
        0, -139, 0, 8, 46, 8, 27, -26, 39, -26, 20, -59, 31, -59, 14, -88, 23, -88, 7, -114, 14,
        -114,
      ],
      0x315c55,
    )
    polygon(
      g,
      [-6, -103, -17, -88, -11, -88, -26, -59, -16, -59, -31, -26, -19, -26, -35, 0, -8, -13],
      0x4b7e68,
    )
    this.crown.addChild(g)
  }
  sway(time: number, phase: number, reduced: boolean) {
    this.crown.rotation = reduced ? 0 : Math.sin(time / 1800 + phase) * 0.018
  }
}
export class BushSprite extends Container {
  readonly leaves = new Container()
  constructor() {
    super()
    this.addChild(this.leaves)
    const g = new Graphics()
    polygon(
      g,
      [
        -30, 0, -30, -12, -24, -12, -24, -24, -10, -24, -10, -32, 4, -32, 4, -24, 19, -24, 19, -17,
        29, -17, 29, -5, 24, 0,
      ],
      0x557951,
    )
    polygon(
      g,
      [
        -25, -12, -18, -12, -18, -23, -8, -23, -8, -28, 1, -28, 1, -19, 16, -19, 16, -13, 23, -13,
        23, -8, 5, -8, 5, -3, -11, -3,
      ],
      0x8b9f6c,
    )
    this.leaves.addChild(g)
    rect(this, -18, -3, 40, 4, 0x3e6550)
  }
  sway(time: number, phase: number, reduced: boolean) {
    this.leaves.skew.x = reduced ? 0 : Math.sin(time / 1300 + phase) * 0.045
  }
}
