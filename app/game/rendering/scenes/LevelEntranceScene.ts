import { Container, Graphics } from 'pixi.js'
import { label, rect } from '../drawing'
import { levels } from '../../../content/journey'
import { terrainHeight } from '../../core/physics'
import type { WorldModel } from '../types'
/** Two depth planes: rear structure behind the actor, near pillar in front. */
export class LevelEntranceScene extends Container {
  readonly foreground = new Container()
  build(model: WorldModel) {
    this.removeChildren().forEach((c) => c.destroy({ children: true }))
    this.foreground.removeChildren().forEach((c) => c.destroy({ children: true }))
    levels.forEach((level, i) => {
      const entry = model.entries.find((e) => e.event.level === level.id)
      if (!entry) return
      const x = entry.x - (entry.event.span ?? 920) / 2 + 55,
        h = terrainHeight(x, model.geometry.terrain)
      const back = new Container(),
        front = new Container()
      back.position.set(x, -h)
      front.position.set(x, -h)
      const ground = (offset: number) => h - terrainHeight(x + offset, model.geometry.terrain)
      this.addChild(back)
      this.foreground.addChild(front)
      // A receding doorway with visible roof depth and a threshold across the lane.
      for (const side of [-109, 91]) {
        rect(back, side, -236, 12, 236 + ground(side) - 13, 0x557460)
        rect(back, side + 3, -236, 3, 230 + ground(side) - 13, 0x81977a)
      }
      back.addChild(
        new Graphics()
          .poly([-118, -245, 104, -245, 148, -216, -74, -216])
          .fill(0xaab08a)
          .poly([-118, -245, -74, -216, -74, -204, -118, -233])
          .fill(0x6e8669),
      )
      rect(back, -110, -239, 214, 12, 0x839b78)
      const plaque = label(
        back,
        `${i + 1}  /  ${model.levelTitles[level.id]}`,
        -4,
        -274,
        15,
        0x365745,
        260,
      )
      plaque.anchor.x = 0.5
      // The far edge is offset into the scene. Feet remain on sampled terrain.
      back.addChild(
        new Graphics()
          .poly([
            -109,
            ground(-109) - 12,
            91,
            ground(91) - 12,
            135,
            ground(135) + 5,
            -65,
            ground(-65) + 5,
          ])
          .fill({ color: 0xa6ad80, alpha: 0.24 }),
      )
      rect(front, 131, -216, 14, 216 + ground(131), 0x365b49)
      rect(front, 131, -216, 4, 216 + ground(131), 0x80966e)
      rect(front, -73, -216, 10, 216 + ground(-73), 0x45664f)
      front.addChild(
        new Graphics()
          .poly([-75, -216, 149, -216, 149, -203, -75, -203])
          .fill(0x9eaa7f)
          .poly([135, -203, 147, -203, 147, ground(141), 135, ground(135)])
          .fill(0x355440),
      )
      for (const px of [-73, 131]) rect(front, px - 5, ground(px) - 7, 23, 7, 0x8c9d73)
      rect(front, 115, -180, 10, 18, 0xe1cf91)
      if (i === 0) {
        const tip = label(back, model.tutorial, -5, -179, 10, 0x365b47, 180)
        tip.anchor.x = 0.5
      }
    })
  }
}
