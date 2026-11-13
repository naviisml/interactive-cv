import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import type { SkillLogo } from '../../../content/skills'
import { label, rect } from '../drawing'
import { tapTarget } from '../interactions'
export class SkillLogoSprite extends Container {
  private badge = new Container()
  private halo = new Graphics()
  private sparks = new Graphics()
  private explored = false
  private burstAt = -10000
  readonly heightOffset: number
  constructor(
    readonly logo: SkillLogo,
    readonly roadX: number,
    index: number,
    private explore: () => void,
  ) {
    super()
    this.x = roadX
    this.heightOffset = -146 - (index % 3) * 16
    this.badge.y = this.heightOffset
    rect(this, -17, -10, 34, 9, 0x688777)
    rect(this, -12, -13, 24, 4, 0xb3bd91)
    rect(this, -3, -40, 6, 27, 0x6e927e)
    rect(this, -5, -43, 10, 5, 0xc7d2a7)
    this.addChild(this.badge, this.sparks)
    this.badge.addChild(this.halo)
    const name = label(this.badge, logo.name, 0, 36, 11, 0x294b43, 138)
    name.anchor.x = 0.5
    tapTarget(this.badge, this.explore, new Rectangle(-45, -44, 90, 100))
    void this.load()
  }
  private async load() {
    const texture = await Assets.load<Texture>(this.logo.asset)
    if (this.destroyed) return
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    sprite.scale.set(Math.min(50 / texture.width, 50 / texture.height))
    this.badge.addChildAt(sprite, 1)
  }
  update(playerX: number, footY: number, time: number, reduced: boolean, explored: boolean) {
    const near = Math.max(0, 1 - Math.abs(playerX - this.roadX) / 210),
      bob = reduced ? 0 : Math.sin(time / 650 + this.roadX) * 5
    this.badge.y = this.heightOffset + bob - near * 5
    this.badge.scale.set(1 + near * 0.1)
    if (
      !explored &&
      Math.abs(playerX - this.roadX) < 31 &&
      footY - 96 < this.badge.y + 18 &&
      footY > this.badge.y - 18
    )
      this.explore()
    if (explored && !this.explored) this.burstAt = time
    this.explored = explored
    this.halo
      .clear()
      .circle(0, 0, 36 + near * 4)
      .fill({ color: explored ? 0xe3cb85 : 0xe5e7c8, alpha: 0.3 + near * 0.17 })
      .circle(0, 0, 35)
      .stroke({ width: explored ? 2 : 1, color: explored ? 0xc4a969 : 0x9ab69a, alpha: 0.7 })
    if (explored)
      this.halo.moveTo(-7, 21).lineTo(-2, 26).lineTo(8, 15).stroke({ width: 2, color: 0x51795a })
    this.sparks.clear()
    const age = (time - this.burstAt) / 700
    if (!reduced && age >= 0 && age < 1)
      for (let i = 0; i < 9; i++) {
        const angle = (i * Math.PI * 2) / 9,
          d = 15 + age * 50
        this.sparks
          .rect(Math.cos(angle) * d, this.badge.y + Math.sin(angle) * d, 3, 3)
          .fill({ color: 0xeadb9d, alpha: 1 - age })
      }
  }
}
