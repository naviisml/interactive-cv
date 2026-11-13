import { Container, Graphics } from 'pixi.js'
import { terrainHeight } from '../../core/physics'
import type { WorldModel } from '../types'
import { polygon, rect, label } from '../drawing'
export class TerrainScene extends Container {
  build(model: WorldModel) {
    this.removeChildren().forEach((node) => node.destroy({ children: true }))
    const points = model.geometry.terrain ?? [],
      g = new Graphics(),
      edge = points.flatMap((p) => [p.x, -p.height])
    polygon(g, [...edge, model.width, 1300, 0, 1300], 0x304f40)
    g.moveTo(edge[0] ?? 0, edge[1] ?? 0)
    for (let i = 2; i < edge.length; i += 2) g.lineTo(edge[i]!, edge[i + 1]!)
    g.stroke({ width: 4, color: 0xa1ad78 })
    this.addChild(g)
    for (let x = 0; x < model.width; x += 90) {
      const y = -terrainHeight(x, points)
      rect(this, x + 15, y + 35 + (x % 3) * 14, 18, 4, 0x49604a)
      rect(this, x + 45, y + 83, 7, 12, 0x28483d)
    }
    for (const p of model.geometry.platforms) {
      rect(this, p.x, -p.height, p.width, 8, 0x8f9b73)
      for (const x of [p.x + 12, p.x + p.width - 18])
        rect(this, x, -p.height + 8, 6, p.height - terrainHeight(x, points) - 8, 0x65765b)
    }
    for (const l of model.geometry.ladders) {
      rect(this, l.x - 14, -l.top, 5, l.top - l.bottom, 0xbda078)
      rect(this, l.x + 9, -l.top, 5, l.top - l.bottom, 0xa68b66)
      for (let y = l.bottom + 16; y < l.top; y += 16) rect(this, l.x - 9, -y, 18, 4, 0xd0b28a)
    }
    for (const s of model.geometry.slides) {
      const rail = new Graphics()
        .moveTo(s.x, -s.from)
        .lineTo(s.x + s.width, -s.to)
        .stroke({ width: 9, color: 0x789b8e })
      this.addChild(rail)
      this.addChild(
        new Graphics()
          .moveTo(s.x, -s.from - 6)
          .lineTo(s.x + s.width, -s.to - 6)
          .stroke({ width: 2, color: 0xd8c69c }),
      )
    }
    const ground = terrainHeight(440, points)
    rect(this, 390, -ground - 100, 160, 76, 0x35594c)
    rect(this, 400, -ground - 24, 5, 24, 0x7c8968)
    rect(this, 535, -ground - 24, 5, 24, 0x7c8968)
    label(this, model.locale === 'nl' ? 'UITLEG' : 'TUTORIAL', 402, -ground - 89, 10)
    label(this, model.tutorial, 402, -ground - 62, 10)
  }
}
