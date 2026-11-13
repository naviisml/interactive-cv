import { Container, Graphics } from 'pixi.js'
import { rect } from '../drawing'
/** Readable side profile: one tail, a continuous fuselage and a separate wing. */
export class AircraftSprite extends Container {
  constructor() {
    super()
    this.addChild(
      new Graphics()
        .poly([
          -103, 0, -87, 0, -93, -31, -79, -31, -58, -4, 66, -4, 86, 1, 103, 10, 92, 15, -83, 15,
          -106, 7,
        ])
        .fill(0xe9e6d2),
    )
    this.addChild(
      new Graphics()
        .poly([-24, 8, 4, 8, -36, 17, -58, 17])
        .fill(0x9eb6aa)
        .poly([-96, 4, -65, 4, -82, 17, -106, 17])
        .fill(0xb5c4b4),
    )
    this.addChild(new Graphics().ellipse(0, 12, 18, 7).fill(0x7e9990))
    for (let x = -50; x < 64; x += 13) rect(this, x, 2, 5, 4, 0x537e7b)
    this.addChild(new Graphics().poly([69, 1, 81, 4, 87, 8, 68, 8]).fill(0x527a78))
    rect(this, -74, -19, 8, 13, 0x648c7d)
    for (const x of [-46, 47]) this.addChild(new Graphics().circle(x, 22, 4).fill(0x3c554d))
  }
}
