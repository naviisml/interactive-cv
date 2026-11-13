import { Container, Graphics, Rectangle } from 'pixi.js'
import type { TimelineEvent } from '../../../content/timeline'
import { buildings, type BuildingKind } from '../../../content/buildings'
import { rect, label } from '../drawing'
import { tapTarget } from '../interactions'
/** Buildings share a grounded doorway, but their architecture belongs to the story. */
export class BuildingSprite extends Container {
  private doors = new Container()
  private left = new Container()
  private right = new Container()
  private lights = new Graphics()
  private plane?: Container
  private car?: Container
  readonly kind: BuildingKind
  constructor(event: TimelineEvent, enter: () => void, locale: string) {
    super()
    this.kind = buildings[event.id]!
    if (this.kind === 'hotel') this.hotel()
    else if (this.kind === 'airport') this.airport()
    else if (this.kind === 'mobility') this.mobility()
    else this.school()
    const signY = this.kind === 'hotel' ? -261 : this.kind === 'airport' ? -163 : -210
    const title = label(this, event.title, 0, signY, 17, 0xf2e8cb, 490)
    title.anchor.x = 0.5
    const subtitle = label(this, event.role ?? event.chapter, 0, signY + 27, 10, 0xd1d8bb, 470)
    subtitle.anchor.x = 0.5
    const period = label(this, event.period ?? event.label, 0, signY + 44, 10, 0xc4cba9, 470)
    period.anchor.x = 0.5
    // Dark threshold remains fixed; the two leaves actually retract into the wall.
    rect(this, -33, -92, 66, 92, 0x203e36)
    rect(this, -39, -99, 78, 7, 0xa6ad87)
    this.doors.y = -90
    rect(this.left, -30, 0, 29, 90, 0x668b7e)
    rect(this.left, -25, 7, 19, 57, 0x9fbeb0)
    rect(this.left, -6, 65, 2, 10, 0xe1cc92)
    rect(this.right, 1, 0, 29, 90, 0x668b7e)
    rect(this.right, 6, 7, 19, 57, 0x9fbeb0)
    rect(this.right, 4, 65, 2, 10, 0xe1cc92)
    this.doors.addChild(this.left, this.right)
    this.addChild(this.doors, this.lights)
    rect(this, -48, -4, 96, 4, 0xb8b48d)
    const target = new Container()
    tapTarget(target, enter, new Rectangle(-43, -100, 86, 104))
    this.addChild(target)
    if (this.kind !== 'airport') {
      const hint = label(this, locale === 'nl' ? 'INGANG' : 'ENTRANCE', 0, -116, 8, 0xd4d9ba, 110)
      hint.anchor.x = 0.5
    }
    for (const x of this.kind === 'mobility' ? [-230] : [-230, 230]) {
      rect(this, x - 14, -24, 28, 24, 0x7d8265)
      const g = new Graphics()
        .poly([
          x - 23,
          -24,
          x - 21,
          -40,
          x - 12,
          -40,
          x - 12,
          -51,
          x + 9,
          -51,
          x + 9,
          -44,
          x + 21,
          -44,
          x + 25,
          -24,
        ])
        .fill(0x628258)
      this.addChild(g)
    }
  }
  private masonry(x: number, y: number, w: number, h: number, color: number) {
    rect(this, x, y, w, h, color)
    const joints = new Graphics()
    for (let row = 0; row < h / 12; row++) {
      const yy = y + row * 12
      joints.moveTo(x, yy).lineTo(x + w, yy)
      for (let xx = x + (row % 2) * 20; xx < x + w; xx += 40)
        joints.moveTo(xx, yy).lineTo(xx, yy + 12)
    }
    joints.stroke({ width: 1, color: 0xd4c5a0, alpha: 0.17 })
    this.addChild(joints)
  }
  private window(x: number, y: number, w = 42, h = 44) {
    rect(this, x - 4, y - 4, w + 8, h + 8, 0x3c5c50)
    rect(this, x, y, w, h, 0xb6cbb5)
    rect(this, x + 3, y + 3, w * 0.4, h - 6, 0xdcd7a7)
    rect(this, x + w * 0.5, y, 3, h, 0x6b8c78)
    rect(this, x - 7, y + h + 4, w + 14, 4, 0xb4b590)
  }
  private hotel() {
    this.masonry(-270, -280, 540, 280, 0x857d65)
    rect(this, -286, -250, 25, 132, 0x36594e)
    for (const [i, letter] of [...'HOTEL'].entries())
      label(this, letter, -281, -240 + i * 23, 15, 0xf1dfb4, 24)
    rect(this, -283, -287, 566, 11, 0xc2b992)
    rect(this, -278, -276, 556, 5, 0xaaa27d)
    rect(this, -254, -267, 508, 66, 0x36594e)
    for (const x of [-225, -156, 113, 182]) {
      this.window(x, -180, 42, 48)
      this.window(x, -106, 42, 48)
    }
    rect(this, -70, -133, 140, 9, 0xc2ae7f)
    rect(this, -68, -124, 136, 7, 0x4e6c58)
    for (const x of [-66, 60]) rect(this, x, -124, 6, 124, 0xa79c75)
    rect(this, -270, -18, 540, 18, 0x69745e)
  }
  private school() {
    const codam = this.kind === 'codam',
      college = this.kind === 'college'
    this.masonry(-260, -230, 520, 230, codam ? 0x657d79 : college ? 0x9a8b70 : 0x9c7d66)
    rect(this, -272, -238, 544, 10, 0xaaa787)
    rect(this, -245, -219, 490, 68, codam ? 0x2c5552 : 0x426357)
    for (const x of [-218, -145, 100, 173]) this.window(x, -125, 42, 72)
    if (codam) {
      rect(this, -70, -148, 140, 10, 0xa9bb95)
      for (const x of [-76, 70]) rect(this, x, -138, 6, 138, 0x8ba68c)
      label(this, '{ 42 }', -21, -141, 12, 0xc6d8aa, 60)
    } else if (!college) {
      this.addChild(new Graphics().poly([-282, -238, 0, -272, 282, -238]).fill(0x536e5b))
      rect(this, -12, -258, 24, 15, 0xd1c69c)
    } else {
      for (const x of [-260, 245]) rect(this, x, -230, 15, 230, 0xb8a787)
    }
    rect(this, -270, -15, 540, 15, 0x78836a)
    const type = label(
      this,
      codam ? 'CODAM' : college ? 'MBO' : '2013 → 2017',
      0,
      -35,
      9,
      0xd6d7b9,
      150,
    )
    type.anchor.x = 0.5
  }
  private airport() {
    rect(this, -285, -178, 570, 178, 0x8ba497)
    for (let x = -270; x < 280; x += 49) {
      rect(this, x, -104, 42, 91, 0x5e847d)
      rect(this, x + 3, -100, 17, 82, 0xa5c4b5)
    }
    rect(this, -296, -184, 592, 9, 0xc5c5a0)
    rect(this, -246, -171, 492, 64, 0x355c53)
    // Control tower and a separate aircraft, rather than another office facade.
    rect(this, -267, -258, 39, 78, 0x7e9787)
    rect(this, -286, -275, 78, 28, 0x4b736d)
    rect(this, -281, -270, 68, 12, 0xb7cbbb)
    rect(this, -290, -280, 86, 6, 0xc3bc98)
    this.plane = new Container()
    const p = new Graphics()
      .poly([
        -105, 0, -58, -6, -37, -38, -22, -38, -32, -5, 49, -4, 81, -19, 94, -18, 85, -2, 105, 4, 97,
        10, -35, 10, -52, 28, -65, 28, -59, 9, -105, 7,
      ])
      .fill(0xe5e2c8)
      .poly([-35, -5, -15, -5, 12, 28, 0, 28])
      .fill(0xa5b8a4)
    this.plane.addChild(p)
    this.plane.position.set(70, -229)
    this.addChild(this.plane)
    for (let x = -35; x < 72; x += 13) rect(this.plane, x, 0, 5, 3, 0x5a7f79)
    rect(this, -285, -12, 570, 12, 0x6b8274)
  }
  private mobility() {
    rect(this, -255, -230, 510, 230, 0x7e9390)
    rect(this, -264, -239, 528, 10, 0xb2b49a)
    rect(this, -240, -219, 480, 68, 0x395f58)
    this.window(-212, -122, 93, 67)
    this.window(121, -122, 93, 67)
    rect(this, -116, -137, 66, 103, 0x4d7068)
    label(this, 'P', -98, -125, 35, 0xe2dbb6, 50)
    rect(this, 167, -48, 36, 48, 0x415e54)
    rect(this, 172, -42, 26, 17, 0xa8c6a1)
    this.car = new Container()
    rect(this.car, -70, -24, 139, 23, 0x47656a)
    this.car.addChild(new Graphics().poly([-47, -24, -31, -47, 27, -47, 48, -24]).fill(0x536f72))
    rect(this.car, -27, -42, 51, 16, 0xadc8b8)
    for (const x of [-43, 44]) {
      this.car.addChild(
        new Graphics().circle(x, -2, 12).fill(0x2c423d).circle(x, -2, 5).fill(0x9dac91),
      )
    }
    rect(this.car, 57, -21, 9, 5, 0xe3d59a)
    this.car.position.set(205, -10)
    this.addChild(this.car)
    rect(this, -260, -12, 520, 12, 0x667c70)
  }
  update(time: number, open: number, reduced: boolean) {
    this.left.x = -26 * open
    this.right.x = 26 * open
    this.left.alpha = this.right.alpha = 1 - open * 0.65
    this.lights.clear()
    if (open > 0) this.lights.rect(-30, -87, 60, 85).fill({ color: 0xeee0aa, alpha: open * 0.22 })
    if (this.plane) this.plane.y = -229 + (reduced ? 0 : Math.sin(time / 1700) * 3)
  }
}
