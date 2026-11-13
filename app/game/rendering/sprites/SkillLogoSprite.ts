import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js'
import type { SkillLogo } from '../../../content/skills'
import { label } from '../drawing'
export class SkillLogoSprite extends Container {
  private tile = new Container()
  constructor(
    readonly logo: SkillLogo,
    readonly roadX: number,
  ) {
    super()
    this.x = roadX
    this.addChild(this.tile)
    this.tile.addChild(
      new Graphics()
        .roundRect(-36, -87, 72, 72, 7)
        .fill(0xf8f6ee)
        .stroke({ width: 1, color: 0xcbd3bd }),
    )
    const text = label(this.tile, logo.name, -65, -8, 11, 0x294b43, 130)
    text.anchor.x = 0.5
    text.x = 0
    void this.load()
  }
  private async load() {
    const texture = await Assets.load<Texture>(this.logo.asset)
    if (this.destroyed) return
    const sprite = new Sprite(texture)
    sprite.anchor.set(0.5)
    const scale = Math.min(48 / texture.width, 48 / texture.height)
    sprite.scale.set(scale)
    sprite.position.set(0, -51)
    this.tile.addChild(sprite)
  }
  update(playerX: number, time: number, reduced: boolean) {
    const near = Math.max(0, 1 - Math.abs(playerX - this.roadX) / 230)
    this.tile.y = reduced ? -8 * near : -near * (12 + Math.sin(time / 450) * 3)
    this.tile.scale.set(1 + near * 0.12)
  }
}
