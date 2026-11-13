import { Container, Graphics } from 'pixi.js'
import { label, rect } from '../drawing'
import { levels } from '../../../content/journey'
import { terrainHeight } from '../../core/physics'
import type { WorldModel, WorldFrame } from '../types'

/** Two depth planes share the terrain; crossing the threshold lights its lamps. */
export class LevelEntranceScene extends Container {
  readonly foreground = new Container()
  private lamps: { node: Graphics; x: number }[] = []
  build(model: WorldModel) {
    this.removeChildren().forEach((node) => node.destroy({ children: true }))
    this.foreground.removeChildren().forEach((node) => node.destroy({ children: true }))
    this.lamps = []
    levels.forEach((level, index) => {
      const entry = model.entries.find((candidate) => candidate.event.level === level.id)
      if (!entry) return
      const x = entry.x - (entry.event.span ?? 920) / 2 + 58,
        height = terrainHeight(x, model.geometry.terrain)
      const back = new Container(),
        front = new Container()
      back.position.set(x, -height)
      front.position.set(x, -height)
      this.addChild(back)
      this.foreground.addChild(front)
      const ground = (offset: number) => height - terrainHeight(x + offset, model.geometry.terrain)
      const accent = Number.parseInt(level.color.slice(1), 16)
      // The far leg is set into the scene; its near counterpart passes in front of the actor.
      for (const [offset, root] of [
        [-112, back],
        [131, front],
      ] as const) {
        const g = ground(offset)
        // Carved timber columns, raised plinths and warm brass fittings.
        rect(root, offset - 19, g - 12, 40, 12, 0x748974)
        rect(root, offset - 15, g - 17, 32, 6, 0x9ba98a)
        rect(root, offset - 12, -238, 24, g + 221, 0x365d4c)
        rect(root, offset - 9, -237, 5, g + 217, 0x83a18b)
        rect(root, offset + 6, -237, 3, g + 217, 0x274a3b)
        rect(root, offset - 16, -242, 34, 8, 0xd1be8e)
        rect(root, offset - 14, -181, 28, 3, 0xb79e6c)
        const lamp = new Graphics()
          .circle(offset, -180, 10)
          .fill({ color: 0xf1d69d, alpha: 0.22 })
          .circle(offset, -180, 5)
          .fill(0xf0ddaa)
        root.addChild(lamp)
        this.lamps.push({ node: lamp, x })
      }
      // A refined beam and hanging wayfinding plate instead of a solid billboard.
      back.addChild(
        new Graphics()
          .roundRect(-129, -255, 266, 16, 4)
          .fill(0x345c4a)
          .roundRect(-124, -253, 256, 5, 2)
          .fill(0xa8b99c)
          .rect(-121, -241, 248, 2)
          .fill(accent),
      )
      rect(back, -65, -238, 2, 15, 0xa98c65)
      rect(back, 73, -238, 2, 15, 0xa98c65)
      back.addChild(
        new Graphics()
          .roundRect(-78, -223, 163, 55, 5)
          .fill(0xf2ead8)
          .stroke({ width: 2, color: 0x3a614c })
          .roundRect(-73, -218, 153, 45, 3)
          .stroke({ width: 1, color: accent }),
      )
      const number = label(back, `0${index + 1}  /  ${index === 0 ? 'START' : 'CHAPTER'}`, 3, -216, 9, 0x66816e, 147)
      number.anchor.x = 0.5
      const title = label(
        back,
        model.levelTitles[level.id] ?? level.title,
        3,
        -198,
        17,
        0x24483d,
        150,
      )
      title.anchor.x = 0.5
      back.addChild(
        new Graphics().ellipse(9, ground(9) + 2, 140, 4).fill({ color: 0x214c38, alpha: 0.15 }),
      )
    })
  }
  update(frame: WorldFrame, reduced: boolean) {
    for (const lamp of this.lamps) {
      const near = Math.abs(frame.motion.x - lamp.x) < 150
      lamp.node.alpha = near ? 1 : 0.45
      const scale = near && !reduced ? 1 + Math.sin(frame.time / 320) * 0.12 : 1
      lamp.node.scale.set(scale)
    }
  }
}
