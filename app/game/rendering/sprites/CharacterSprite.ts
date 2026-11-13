import { Assets, Container, Graphics, Rectangle, Sprite, Texture } from 'pixi.js'
import { spriteFrame, SPRITE_FRAMES, characterClips } from '../../core/characterSprite'
import { actorEntry } from '../../core/buildingVisit'
import { shadowSurface } from '../../core/physics'
import type { WorldFrame, WorldModel } from '../types'
export class CharacterSprite extends Container {
  private frames: Texture[] = []
  private body = new Sprite()
  private shadow = new Graphics().ellipse(0, 0, 18, 3.5).fill(0x143c32)
  async load() {
    const atlas = await Assets.load<Texture>('/sprites/navi.png')
    if (this.destroyed) return
    atlas.source.scaleMode = 'nearest'
    this.body.roundPixels = true
    const width = atlas.width / SPRITE_FRAMES
    this.frames = Array.from(
      { length: SPRITE_FRAMES },
      (_, i) =>
        new Texture({
          source: atlas.source,
          frame: new Rectangle(i * width, 0, width, atlas.height),
        }),
    )
    this.body.anchor.set(0.5, 1)
    this.addChild(this.shadow, this.body)
  }
  update(frame: WorldFrame, model: WorldModel) {
    if (!this.frames.length) return
    const m = frame.motion,
      action =
        m.mode === 'sliding'
          ? 'slide'
          : m.mode === 'climbing'
            ? 'climb'
            : !m.grounded
              ? m.vy >= 0
                ? 'fall'
                : 'jump'
              : frame.running
                ? 'run'
                : Math.abs(m.vx) > 15
                  ? 'walk'
                  : 'idle'
    const entering = actorEntry(frame.visit)
    const clipAction = entering > 0 && entering < 1 ? 'enter' : action
    this.body.texture =
      this.frames[
        spriteFrame(
          clipAction,
          clipAction === 'idle' || clipAction === 'enter'
            ? (frame.time / 1000) * characterClips[clipAction].fps
            : frame.animationFrame,
        )
      ]!
    this.body.scale.set(frame.facing * (1 - entering * 0.12), 1 - entering * 0.12)
    this.body.position.set(m.x, m.y - entering * 18)
    this.body.alpha = 1 - entering
    this.shadow.visible = entering < 0.9
    const support = shadowSurface(m, model.geometry),
      distance = Math.max(0, support - m.y)
    this.shadow.position.set(m.x, support)
    this.shadow.scale.set(Math.max(0.38, 1 - distance / 330))
    this.shadow.alpha = Math.max(0.12, 0.4 - distance / 650)
  }
}
