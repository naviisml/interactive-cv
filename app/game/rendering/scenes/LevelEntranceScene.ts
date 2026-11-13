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
        rect(root, offset - 15, g - 18, 32, 18, 0x7f9279)
        rect(root, offset - 10, -235, 18, g + 217, 0x345b48)
        rect(root, offset - 7, -235, 4, g + 217, 0x7b9678)
        rect(root, offset - 14, -239, 28, 9, 0xb8b08a)
        const lamp = new Graphics().circle(offset, -190, 5).fill(0xe7d397)
        root.addChild(lamp)
        this.lamps.push({ node: lamp, x })
      }
      back.addChild(
        new Graphics()
          .poly([-130, -248, 126, -248, 151, -234, -105, -234])
          .fill(0x8ba080)
          .poly([-105, -234, 151, -234, 151, -224, -105, -224])
          .fill(0x355a48),
      )
      rect(back, -125, -248, 250, 3, accent)
      // A small suspended banner belongs to the arch, rather than a billboard above it.
      rect(back, -80, -228, 2, 13, 0x6e8267)
      rect(back, 90, -228, 2, 13, 0x6e8267)
      rect(back, -94, -215, 200, 49, 0x254b3d)
      rect(back, -94, -215, 4, 49, accent)
      const number = label(back, `LEVEL ${index + 1}`, 6, -209, 10, 0xe0d5ad, 180)
      number.anchor.x = 0.5
      const title = label(
        back,
        model.levelTitles[level.id] ?? level.title,
        6,
        -193,
        16,
        0xf0e8c9,
        180,
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
