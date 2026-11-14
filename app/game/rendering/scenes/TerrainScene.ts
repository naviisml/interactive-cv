import type { Texture } from 'pixi.js';
import { Assets, Container, Graphics, TilingSprite } from 'pixi.js'
import { terrainPose, awayFromTerrainCorners } from '../../core/terrainPlacement'
import { terrainHeight } from '../../core/physics'
import type { WorldModel } from '../types'
import { BushSprite } from '../sprites/NatureSprites'
import { polygon, rect } from '../drawing'
export class TerrainScene extends Container {
  private bushes: BushSprite[] = []
  private buildVersion = 0
  update(time: number, reduced: boolean) {
    this.bushes.forEach((bush, i) => bush.sway(time, i, reduced))
  }

  build(model: WorldModel) {
    this.removeChildren().forEach((node) => node.destroy({ children: true }))
    this.bushes = []
    const version = ++this.buildVersion
    const points = model.geometry.terrain ?? [],
      g = new Graphics(),
      edge = points.flatMap((p) => [p.x, -p.height])
    polygon(g, [...edge, model.width, 1300, 0, 1300], 0x304f40)
    g.moveTo(edge[0] ?? 0, edge[1] ?? 0)
    for (let i = 2; i < edge.length; i += 2) g.lineTo(edge[i]!, edge[i + 1]!)
    g.stroke({ width: 4, color: 0xa1ad78 })
    this.addChild(g)
    void Assets.load<Texture>('/world/textures/earth.png').then((texture) => {
      if (this.destroyed || version !== this.buildVersion) return
      const mask = new Graphics().poly([...edge, model.width, 1300, 0, 1300]).fill(0xffffff)
      const soil = new TilingSprite({ texture, width: model.width, height: 1700 })
      soil.y = -400
      soil.alpha = 0.32
      soil.mask = mask
      this.addChildAt(soil, 1)
      this.addChild(mask)
    }).catch(() => { /* The solid terrain remains usable if its optional texture fails. */ })
    const detail = new Graphics()
    for (let x = 20; x < model.width; x += 27) {
      const y = -terrainHeight(x, points)
      detail
        .moveTo(x, y - 1)
        .lineTo(x - 4, y - 9 - (x % 7))
        .lineTo(x + 2, y - 4)
        .lineTo(x + 5, y - 13 - (x % 5))
        .lineTo(x + 8, y - 2)
        .fill(x % 3 ? 0x8e9d6e : 0xb1b384)
      if (x % 9 === 0) detail.rect(x + 9, y - 1, 5, 2).fill(0xc7c48f)
    }
    this.addChild(detail)
    for (let x = 280; x < model.width; x += 267) {
      if (!awayFromTerrainCorners(x, 20, points)) continue
      const pose = terrainPose(x, 17, points)
      const y = -pose.height
      const stone = new Graphics()
        .poly([-14, 0, -12, -8, 2, -12, 15, -6, 17, 0])
        .fill(0x82947c)
        .poly([-12, -8, 2, -12, 15, -6, 0, -5])
        .fill(0xa2ac8b)
      stone.position.set(x, y)
      stone.angle = pose.angle
      this.addChild(stone)
    }
    for (let x = 330; x < model.width; x += 610) {
      if (
        model.entries.some(
          (entry) =>
            (entry.event.id === 'skills-road' || entry.event.id === 'navel-development') &&
            Math.abs(entry.x - x) < (entry.event.span ?? 920) / 2,
        )
      )
        continue
      if (!awayFromTerrainCorners(x, 40, points) || Math.abs(terrainPose(x, 35, points).angle) > 8)
        continue
      const bush = new BushSprite()
      bush.position.set(x, -terrainHeight(x, points))
      this.bushes.push(bush)
      this.addChild(bush)
    }

    for (let x = 0; x < model.width; x += 90) {
      const y = -terrainHeight(x, points)
      rect(this, x + 15, y + 35 + (x % 3) * 14, 18, 4, 0x49604a)
      rect(this, x + 45, y + 83, 7, 12, 0x28483d)
    }
    for (const p of model.geometry.platforms) {
      rect(this, p.x, -p.height, p.width, 8, 0x8f9b73)
      const railing = new Graphics()
        .moveTo(p.x + 4, -p.height)
        .lineTo(p.x + 4, -p.height - 28)
        .lineTo(p.x + p.width - 4, -p.height - 28)
        .lineTo(p.x + p.width - 4, -p.height)
        .stroke({ width: 4, color: 0x8c9f78 })
      for (let i = 1; i < 4; i++)
        railing
          .moveTo(p.x + (p.width * i) / 4, -p.height)
          .lineTo(p.x + (p.width * i) / 4, -p.height - 28)
      railing.stroke({ width: 3, color: 0x7f946e })
      this.addChild(railing)
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
  }
}
