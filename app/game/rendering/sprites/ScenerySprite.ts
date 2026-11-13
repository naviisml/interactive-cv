import { Assets, Container, Sprite, Texture } from 'pixi.js'
export class ScenerySprite extends Container {
  async load(id: string) {
    const texture = await Assets.load<Texture>(`/world/scenes/${id}.svg`)
    if (this.destroyed) return
    const sprite = new Sprite(texture)
    sprite.position.set(-300, -310)
    this.addChildAt(sprite, 0)
  }
}
