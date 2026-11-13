import { Graphics } from 'pixi.js'
import { ScenerySprite } from '../sprites/ScenerySprite'
export class FirstLinesScene extends ScenerySprite {
  private code = new Graphics()
  constructor() {
    super()
    void this.load('first-lines')
    this.addChild(this.code)
  }
  update(time: number, reduced: boolean) {
    this.code.clear()
    for (let i = 0; i < 3; i++)
      this.code
        .rect(-112, -112 + i * 7, reduced ? 17 : 8 + ((Math.floor(time / 180) + i * 5) % 29), 2)
        .fill(0xd8dfb1)
  }
}
