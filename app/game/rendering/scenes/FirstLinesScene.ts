import { Graphics, Rectangle } from 'pixi.js'
import { tapTarget } from '../interactions'
import { ScenerySprite } from '../sprites/ScenerySprite'
export class FirstLinesScene extends ScenerySprite {
  private code = new Graphics()
  constructor(open: () => void) {
    super()
    // The monitor in the first-scene SVG occupies x -127..-53, y -131..-75.
    tapTarget(this, open, new Rectangle(-136, -145, 112, 96))
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
