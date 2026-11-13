import { Container, Graphics } from 'pixi.js'
import { label, rect } from '../drawing'
import { levels } from '../../../content/journey'
import { terrainHeight } from '../../core/physics'
import type { WorldModel } from '../types'

/** 
 * Architectural chapter thresholds. The passage is a physical layered object,
 * not an oversized opaque rectangle placed on top of the game.
 * Left support, sky bridge and sign sit behind the player; right column sits
 * in front. All feet are independently grounded to the real terrain.
 */
export class LevelEntranceScene extends Container {
  readonly foreground = new Container()

  build(model: WorldModel) {
    this.removeChildren().forEach((child) => child.destroy({ children: true }))
    this.foreground.removeChildren().forEach((child) => child.destroy({ children: true }))

    levels.forEach((level, index) => {
      const entry = model.entries.find((candidate) => candidate.event.level === level.id)
      if (!entry) return
      const x = entry.x - (entry.event.span ?? 920) / 2 + 58
      const height = terrainHeight(x, model.geometry.terrain)
      const behind = new Container()
      const ahead = new Container()
      behind.position.set(x, -height)
      ahead.position.set(x, -height)
      this.addChild(behind)
      this.foreground.addChild(ahead)

      const ground = (offset: number) => height - terrainHeight(x + offset, model.geometry.terrain)
      const accent = Number.parseInt(level.color.slice(1), 16)
      const dark = 0x2a4b43
      const trim = 0xded7b5

      // The threshold only just touches the ground; the centre stays clear for walking.
      behind.addChild(
        new Graphics()
          .ellipse(0, ground(0) + 2, 195, 11)
          .fill({ color: 0x1b4337, alpha: 0.12 }),
      )
      behind.addChild(
        new Graphics()
          .poly([
            -183, ground(-183) - 5,
            178, ground(178) - 5,
            187, ground(187) + 4,
            -190, ground(-190) + 4,
          ])
          .fill({ color: trim, alpha: 0.2 }),
      )
      for (const offset of [-166, 169]) {
        const g = ground(offset)
        const support = offset < 0 ? behind : ahead
        // Narrow buttressed stone/bronze posts, shadow and highlight.
        support.addChild(
          new Graphics()
            .poly([offset - 13, -265, offset + 13, -265, offset + 17, g, offset - 20, g])
            .fill(dark)
            .poly([offset - 9, -261, offset - 2, -261, offset - 2, g - 7, offset - 14, g - 7])
            .fill(0x688a72)
            .rect(offset - 17, g - 6, 37, 6)
            .fill(0x9da485),
        )
        rect(support, offset - 18, -271, 35, 11, accent)
        rect(support, offset - 13, -249, 25, 2, trim).alpha = 0.56
        // One engraved wayfinding line becomes a subtle lamp.
        rect(support, offset - 3, -216, 6, 82, 0xb8bd94).alpha = 0.25
        support.addChild(
          new Graphics()
            .circle(offset, -217, 6)
            .fill(0xe9daa7)
            .circle(offset, -217, 2.5)
            .fill(0x587966),
        )
      }

      // Three-step recessed beam, with its profile visible from below.
      behind.addChild(
        new Graphics()
          .poly([-192, -284, 181, -284, 207, -267, -179, -267])
          .fill(0x2c4b43)
          .poly([-179, -267, 207, -267, 190, -255, -162, -255])
          .fill(0x567b67)
          .poly([-192, -284, -179, -267, -162, -255, -175, -275])
          .fill(0x8da18a),
      )
      rect(behind, -188, -286, 369, 5, accent)
      rect(behind, -164, -256, 353, 2, trim).alpha = 0.56

      // An offset chapter plate reads clearly and does not block the road.
      const plate = new Graphics()
        .roundRect(-128, -342, 269, 64, 6)
        .fill(0xf0ebdb)
        .stroke({ width: 2, color: dark })
      plate.rect(-127, -341, 57, 62).fill(dark)
      plate.rect(-128, -342, 269, 4).fill(accent)
      behind.addChild(plate)
      const number = label(behind, String(index + 1).padStart(2, '0'), -99, -326, 31, 0xf0ebd5, 56)
      number.anchor.x = 0.5
      const chapter = label(
        behind,
        model.levelTitles[level.id]?.toUpperCase() ?? level.title.toUpperCase(),
        -59, -326, 15, dark, 190,
      )
      chapter.anchor.x = 0
      const caption = label(
        behind,
        index === 0 ? 'START HERE' : index === levels.length - 1 ? 'THE NEXT CHAPTER' : 'KEEP EXPLORING',
        -59, -300, 9, 0x657b68, 186,
      )
      caption.anchor.x = 0

      // Small cartographic chevrons make the passage direction legible.
      behind.addChild(
        new Graphics()
          .moveTo(-24, -248).lineTo(-17, -243).lineTo(-24, -238)
          .moveTo(-6, -248).lineTo(1, -243).lineTo(-6, -238)
          .moveTo(12, -248).lineTo(19, -243).lineTo(12, -238)
          .stroke({ width: 2, color: trim, alpha: 0.7 }),
      )
      if (index === 0) {
        const tutorial = label(behind, model.tutorial, -3, -177, 11, dark, 225)
        tutorial.anchor.x = 0.5
      }
    })
  }
}
