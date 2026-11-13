import { Container, Graphics } from 'pixi.js'
import { label, rect } from '../drawing'
import { levels } from '../../../content/journey'
import { terrainHeight } from '../../core/physics'
import type { WorldModel } from '../types'
/** One arch per level, positioned in the approach clearing, never by every employer. */
export class LevelEntranceScene extends Container {
  build(model: WorldModel) {
    this.removeChildren().forEach((c) => c.destroy({ children: true }))
    levels.forEach((level, i) => {
      const entry = model.entries.find((e) => e.event.level === level.id)
      if (!entry) return
      const x = entry.x - (entry.event.span ?? 920) / 2 + 55,
        height = terrainHeight(x, model.geometry.terrain)
      const gate = new Container()
      gate.position.set(x, -height)
      for (const side of [-137, 131]) {
        const postGround = terrainHeight(x + side, model.geometry.terrain)
        rect(gate, side, -244, 7, 244 + height - postGround, 0x627a62)
        rect(gate, side - 5, height - postGround - 9, 17, 9, 0x8d9b74)
      }
      rect(gate, -145, -252, 290, 11, 0xa7b08a)
      rect(gate, -127, -240, 254, 61, 0x35594d)
      const title = label(
        gate,
        `${String(i + 1).padStart(2, '0')}  /  ${model.levelTitles[level.id]}`,
        0,
        -225,
        16,
        0xf0e5c2,
        235,
      )
      title.anchor.x = 0.5
      const sub = label(
        gate,
        model.locale === 'nl' ? 'LEVEL ' + (i + 1) : 'LEVEL ' + (i + 1),
        0,
        -201,
        9,
        0xaec0a1,
        230,
      )
      sub.anchor.x = 0.5
      if (i === 0) {
        const text = label(gate, model.tutorial, 0, -159, 10, 0x375d4d, 240)
        text.anchor.x = 0.5
      }
      const g = new Graphics()
        .moveTo(-137, -178)
        .lineTo(-116, -157)
        .moveTo(138, -178)
        .lineTo(116, -157)
        .stroke({ width: 3, color: 0xa2af83 })
      gate.addChild(g)
      this.addChild(gate)
    })
  }
}
