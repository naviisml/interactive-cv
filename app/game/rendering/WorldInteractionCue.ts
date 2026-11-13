import { Container, Graphics, Text } from 'pixi.js'
import type { WorldCueSpec } from '../core/worldCues'

/** A non-intercepting, object-anchored cue. The object itself remains the hit target. */
export class WorldInteractionCue extends Container {
  private halo = new Graphics()
  private marker = new Graphics()
  private bubble = new Container()
  private frame = new Graphics()
  private title: Text
  private hint: Text
  private intensity = 0
  private reveal = 0
  private lastCopy = ''
  constructor(readonly spec: WorldCueSpec, private locale: 'nl' | 'en') {
    super()
    this.eventMode = 'none'
    this.addChild(this.halo, this.marker, this.bubble)
    this.bubble.addChild(this.frame)
    this.title = new Text({
      text: '',
      style: {
        fontFamily: 'Space Grotesk, Arial, sans-serif',
        fontWeight: '600',
        fontSize: 13,
        fill: 0x234639,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 210,
        lineHeight: 16,
      },
    })
    this.title.anchor.set(0.5, 0)
    this.title.position.set(0, -19)
    this.hint = new Text({
      text: '',
      style: {
        fontFamily: 'DM Sans, Arial, sans-serif',
        fontWeight: '500',
        fontSize: 10,
        fill: 0x577061,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: 212,
      },
    })
    this.hint.anchor.set(0.5, 0)
    this.hint.position.set(0, 15)
    this.bubble.addChild(this.title, this.hint)
    this.frame
      .roundRect(-119, -27, 238, 70, 8)
      .fill({ color: 0xf9f5e9, alpha: 0.97 })
      .stroke({ color: 0x688c75, alpha: 0.92, width: 1.4 })
      .poly([-8, 43, 8, 43, 0, 53])
      .fill(0xf9f5e9)
    this.bubble.y = -96
    this.visible = false
  }

  update(
    time: number,
    near: boolean,
    focused: boolean,
    reduced: boolean,
    text?: string,
    shiftX = 0,
    shiftY = 0,
  ) {
    const change = reduced ? 1 : 0.22
    this.intensity += ((near ? 1 : 0) - this.intensity) * change
    this.reveal += ((focused ? 1 : 0) - this.reveal) * change
    this.visible = this.intensity > 0.025 || this.reveal > 0.025
    if (!this.visible) return
    const pulse = reduced ? 0 : Math.sin(time / 340) * 0.5 + 0.5
    this.halo.clear()
      .ellipse(0, 0, 29 + pulse * 7, 19 + pulse * 5)
      .fill({ color: 0xf3d293, alpha: this.intensity * (0.11 + pulse * 0.07) })
      .ellipse(0, 0, 25 + pulse * 4, 16 + pulse * 3)
      .stroke({ color: 0xffe3a5, width: 2, alpha: this.intensity * (0.5 + pulse * 0.3) })
    this.marker.clear()
      .moveTo(0, -33 - pulse * 4)
      .lineTo(-6, -42 - pulse * 4)
      .lineTo(6, -42 - pulse * 4)
      .closePath()
      .fill({ color: 0xf7d58f, alpha: this.intensity * 0.92 })
    const copy = text || this.spec.title[this.locale]
    if (copy !== this.lastCopy) {
      this.title.text = copy
      this.hint.text = this.spec.hint[this.locale]
      this.lastCopy = copy
    }
    this.bubble.x = shiftX
    this.bubble.y = -(this.spec.popupOffset ?? 106) + shiftY - (reduced ? 0 : pulse * 3)
    this.bubble.alpha = this.reveal
    this.bubble.scale.set(0.94 + this.reveal * 0.06)
  }
}
