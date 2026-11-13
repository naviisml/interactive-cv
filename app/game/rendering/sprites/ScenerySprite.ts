import { Assets, Container, Graphics, Sprite, Texture } from 'pixi.js'
export class ScenerySprite extends Container {
  async load(id: string) {
    let texture: Texture
    try {
      texture = await Assets.load<Texture>(`/world/scenes/${id}.svg`)
    } catch {
      if (!this.destroyed)
        this.addChildAt(
          new Graphics()
            .rect(-144, -64, 132, 7)
            .fill(0xb09a72)
            .rect(-136, -57, 6, 57)
            .rect(-27, -57, 6, 57)
            .fill(0x86765a)
            .rect(-127, -133, 82, 64)
            .fill(0x8fa18b)
            .rect(-121, -127, 70, 49)
            .fill(0x365b54)
            .rect(-94, -69, 15, 5)
            .fill(0x7c927b),
          0,
        )
      return
    }
    if (this.destroyed) return
    const sprite = new Sprite(texture)
    sprite.position.set(-300, -310)
    this.addChildAt(sprite, 0)
  }
}
