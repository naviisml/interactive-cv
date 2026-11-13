import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import { skillLogos, skillGroups } from '../../../content/skills'
import { tapTarget } from '../interactions'
import { label } from '../drawing'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'
export class SkillsRoadScene extends Container {
  private groups: {
    node: Container
    x: number
    logos: { id: string; halo: Graphics; x: number; y: number }[]
  }[] = []
  constructor(
    private activity: ActivitySystem,
    private collected: (name: string, count: number) => void,
    locale: string,
  ) {
    super()
    skillGroups.forEach((group, i) => {
      const node = new Container(),
        x = (i - 1) * 440
      node.x = x
      const backdrop = new Graphics()
        .roundRect(-155, -232, 310, 172, 35)
        .fill({ color: 0xdce0c5, alpha: 0.42 })
        .stroke({ width: 1, color: 0x9eaf90, alpha: 0.65 })
      node.addChild(backdrop)
      const title = label(
        node,
        group.title[locale === 'nl' ? 'nl' : 'en'],
        0,
        -267,
        17,
        0x294b43,
        310,
      )
      title.anchor.x = 0.5
      const logos = group.ids.map((id, j) => {
        const logo = skillLogos.find((l) => l.id === id)!,
          columns = group.ids.length > 6 ? 4 : 3
        const row = Math.floor(j / columns),
          rowCount = Math.min(columns, group.ids.length - row * columns)
        const lx = ((j % columns) - (rowCount - 1) / 2) * 72,
          ly = -188 + row * 77
        const badge = new Container()
        badge.position.set(lx, ly)
        const halo = new Graphics()
        badge.addChild(halo)
        const name = label(badge, logo.name.replace(' / React Native', ''), 0, 24, 9, 0x294b43, 70)
        name.anchor.x = 0.5
        tapTarget(badge, () => this.explore(id), new Rectangle(-30, -27, 60, 65))
        void Assets.load<Texture>(logo.asset).then((texture) => {
          if (this.destroyed) return
          const sprite = new Sprite(texture)
          sprite.anchor.set(0.5)
          sprite.scale.set(Math.min(36 / texture.width, 36 / texture.height))
          badge.addChild(sprite)
        })
        node.addChild(badge)
        return { id, halo, x: lx, y: ly }
      })
      this.addChild(node)
      this.groups.push({ node, x, logos })
      const base = new Graphics().ellipse(x, 0, 140, 4).fill({ color: 0x284d40, alpha: 0.2 })
      this.addChild(base)
    })
  }
  private explore(id: string) {
    if (this.activity.exploredSkills.includes(id)) return
    this.activity.exploredSkills.push(id)
    this.collected(skillLogos.find((l) => l.id === id)!.name, this.activity.exploredSkills.length)
  }
  update(frame: WorldFrame, ground: number, reduced: boolean) {
    const px = frame.motion.x - this.x,
      foot = frame.motion.y + ground
    this.groups.forEach((group, i) => {
      group.node.y = reduced ? 0 : Math.sin(frame.time / 1100 + i * 1.4) * 6
      group.node.rotation = reduced ? 0 : Math.sin(frame.time / 2300 + i) * 0.008
      group.logos.forEach((logo) => {
        const seen = this.activity.exploredSkills.includes(logo.id)
        if (
          !frame.navigating &&
          !frame.paused &&
          !seen &&
          Math.abs(px - group.x - logo.x) < 29 &&
          foot - 96 < logo.y + group.node.y + 22 &&
          foot > logo.y + group.node.y - 25
        )
          this.explore(logo.id)
        logo.halo
          .clear()
          .circle(0, 0, 24)
          .fill({ color: seen ? 0xe5c985 : 0xf0ebd2, alpha: seen ? 0.7 : 0.28 })
        if (seen)
          logo.halo
            .moveTo(12, 14)
            .lineTo(16, 18)
            .lineTo(23, 10)
            .stroke({ width: 2, color: 0x567b55 })
      })
    })
  }
}
