import { Container, Graphics } from 'pixi.js'
import { ScenerySprite } from '../sprites/ScenerySprite'
import type { ActivitySystem } from '../../engine/ActivitySystem'
export class PortalScene extends ScenerySprite {
  private runes: Graphics[] = []
  constructor() {
    super()
    void this.load('gmodstore')
    for (const [x, y] of [
      [-132, -75],
      [0, -159],
      [132, -90],
    ]) {
      const rune = new Graphics()
        .poly([0, -12, 9, 0, 0, 12, -9, 0])
        .fill(0xd7c7e1)
        .stroke({ width: 2, color: 0x6b718d })
      rune.position.set(x!, y!)
      this.runes.push(rune)
      this.addChild(rune)
    }
  }
  update(activity: ActivitySystem, time: number, reduced: boolean) {
    for (const [index, rune] of this.runes.entries()) {
      rune.alpha = activity.runes.includes(index) ? 0.1 : 1
      rune.rotation = reduced ? 0 : Math.sin(time / 650 + index) * 0.1
    }
  }
}
