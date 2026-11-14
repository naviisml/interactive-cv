import type { Texture} from 'pixi.js';
import { Assets, Sprite, Container, Graphics, Rectangle, Text } from 'pixi.js'
import type { TimelineEvent } from '../../../content/timeline'
import { buildings, type BuildingKind } from '../../../content/buildings'
import { rect, label } from '../drawing'
import { tapTarget } from '../interactions'
/** Buildings share a grounded doorway, but their architecture belongs to the story. */
export class BuildingSprite extends Container {
  private facade = new Container()
  private doors = new Container()
  private left = new Container()
  private right = new Container()
  private lights = new Graphics()
  private entranceHighlight = new Graphics()
  private panes: { x: number; y: number; w: number; h: number }[] = []
  readonly kind: BuildingKind
  constructor(event: TimelineEvent, enter: () => void, locale: string) {
    super()
    this.addChild(this.facade)
    this.kind = buildings[event.id]!
    if (this.kind === 'hotel') this.hotel()
    else if (this.kind === 'airport') this.airport()
    else if (this.kind === 'mobility') this.mobility()
    else this.school()
    if (event.category === 'school') {
      const title = label(this.facade, event.title, 0, -218, 23, 0xf2e8cb, 480)
      title.anchor.x = 0.5
    } else {
      const signY = this.kind === 'hotel' ? -261 : this.kind === 'airport' ? -163 : -218
      // The facade is a place, not a miniature CV. Roles and periods remain
      // available in the building interior and the accessible reading mode.
      const title = label(this.facade, event.title, 0, signY + 10, 23, 0xf2e8cb, 490)
      title.anchor.x = 0.5
    }
    if (event.id === 'fletcher' || event.id === 'get-e') {
      const y = event.id === 'fletcher' ? -261 : -163
      // Brand assets retain transparent pixels; no backing rectangle.
      for (const child of this.facade.children)
        if (child instanceof Text && child.y === y + 10) child.visible = false
      void Assets.load<Texture>(`/companies/${event.id}-white.png`)
        .then((texture) => {
          if (this.destroyed) return
          const logo = new Sprite(texture)
          logo.anchor.set(0.5)
          logo.scale.set(Math.min(220 / texture.width, 28 / texture.height))
          logo.position.set(0, y + 21)
          this.facade.addChild(logo)
        })
        .catch(() => {})
    }
    const edge =
      this.kind === 'airport'
        ? 285
        : this.kind === 'hotel'
          ? 270
          : this.kind === 'codam'
            ? 250
            : 260
    const roof =
      this.kind === 'airport'
        ? -178
        : this.kind === 'hotel'
          ? -280
          : this.kind === 'codam'
            ? -234
            : this.kind === 'mobility'
              ? -243
              : -230
    this.facade.addChild(
      new Graphics().poly([edge, roof, edge + 16, roof - 8, edge + 16, -8, edge, 0]).fill(0x385b50),
    )
    rect(this.facade, -edge, -8, edge * 2, 8, 0x3c5a47)
    rect(this.facade, -edge - 9, -3, edge * 2 + 18, 3, 0xb8b28b)
    if (event.category !== 'school') {
      // Dark threshold remains fixed; the two leaves actually retract into the wall.
      rect(this.facade, -33, -92, 66, 92, 0x203e36)
      rect(this.facade, -39, -99, 78, 7, 0xa6ad87)
      this.doors.y = -90
      rect(this.left, -30, 0, 29, 90, 0x668b7e)
      rect(this.left, -25, 7, 19, 57, 0x9fbeb0)
      rect(this.left, -6, 65, 2, 10, 0xe1cc92)
      rect(this.right, 1, 0, 29, 90, 0x668b7e)
      rect(this.right, 6, 7, 19, 57, 0x9fbeb0)
      rect(this.right, 4, 65, 2, 10, 0xe1cc92)
      this.doors.addChild(this.left, this.right)
      this.facade.addChild(this.doors, this.lights, this.entranceHighlight)
      rect(this.facade, -48, -4, 96, 4, 0xb8b48d)
      const target = new Container()
      tapTarget(target, enter, new Rectangle(-43, -100, 86, 104))
      this.facade.addChild(target)
      if (this.kind !== 'airport') {
        const hint = label(
          this.facade,
          locale === 'nl' ? 'INGANG' : 'ENTRANCE',
          0,
          -116,
          8,
          0xd4d9ba,
          110,
        )
        hint.anchor.x = 0.5
      }
    } else {
      const lines = [event.period || event.label, event.role || '', event.location || '']
      const ys = [-145, -111, -48]
      lines.forEach((text, i) => {
        const inscription = label(this.facade, text, 0, ys[i]!, i === 1 ? 14 : 12, 0xf5eed8, 176)
        inscription.anchor.x = 0.5
        inscription.style.align = 'center'
      })
      this.facade.addChild(this.lights)
    }
    for (const x of this.kind === 'mobility' ? [-230] : [-230, 230]) {
      rect(this.facade, x - 14, -24, 28, 24, 0x7d8265)
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
      this.facade.addChild(g)
    }
  }
  private masonry(x: number, y: number, w: number, h: number, color: number) {
    rect(this.facade, x, y, w, h, color)
    const joints = new Graphics()
    for (let row = 0; row < h / 12; row++) {
      const yy = y + row * 12
      joints.moveTo(x, yy).lineTo(x + w, yy)
      for (let xx = x + (row % 2) * 20; xx < x + w; xx += 40)
        joints.moveTo(xx, yy).lineTo(xx, yy + 12)
    }
    joints.stroke({ width: 1, color: 0xd4c5a0, alpha: 0.17 })
    this.facade.addChild(joints)
  }
  private window(x: number, y: number, w = 42, h = 44) {
    this.panes.push({ x, y, w, h })
    rect(this.facade, x - 4, y - 4, w + 8, h + 8, 0x3c5c50)
    rect(this.facade, x, y, w, h, 0xb6cbb5)
    rect(this.facade, x + 3, y + 3, w * 0.4, h - 6, 0xdcd7a7)
    rect(this.facade, x + w * 0.5, y, 3, h, 0x6b8c78)
    rect(this.facade, x - 7, y + h + 4, w + 14, 4, 0xb4b590)
  }
  private hotel() {
    this.masonry(-270, -280, 540, 280, 0x857d65)
    rect(this.facade, -286, -250, 25, 132, 0x36594e)
    for (const [i, letter] of [...'HOTEL'].entries())
      label(this.facade, letter, -281, -240 + i * 23, 15, 0xf1dfb4, 24)
    rect(this.facade, -283, -287, 566, 11, 0xc2b992)
    rect(this.facade, -278, -276, 556, 5, 0xaaa27d)
    rect(this.facade, -254, -267, 508, 66, 0x36594e)
    for (const x of [-225, -156, 113, 182]) {
      this.window(x, -180, 42, 48)
      this.window(x, -106, 42, 48)
    }
    rect(this.facade, -70, -133, 140, 9, 0xc2ae7f)
    rect(this.facade, -68, -124, 136, 7, 0x4e6c58)
    for (const x of [-66, 60]) rect(this.facade, x, -124, 6, 124, 0xa79c75)
    rect(this.facade, -270, -18, 540, 18, 0x69745e)
    for (const x of [-227, -158, 111, 180]) {
      rect(this.facade, x - 7, -130, 60, 4, 0x485e49)
      rect(this.facade, x - 5, -147, 56, 3, 0xc1bb91)
      for (let rail = 0; rail < 6; rail++)
        rect(this.facade, x - 4 + rail * 10, -145, 2, 15, 0xa3aa84)
      rect(this.facade, x - 6, -125, 58, 7, 0x42594b)
    }
    this.facade.addChild(
      new Graphics().poly([-75, -133, 75, -133, 89, -115, -89, -115]).fill(0xd2ba85),
    )
    for (let x = -73; x < 80; x += 22)
      this.facade.addChild(
        new Graphics().poly([x, -132, x + 10, -132, x + 16, -115, x + 4, -115]).fill(0x6f8c70),
      )
    rect(this.facade, -89, -115, 178, 6, 0x3e5d4e)
    for (const x of [-91, 83]) {
      rect(this.facade, x, -99, 8, 20, 0x2e4a3e)
      rect(this.facade, x + 2, -96, 4, 12, 0xf3d89b)
    }
    for (const x of [-257, 249]) rect(this.facade, x, -196, 8, 173, 0xaa9c78)
  }
  private school() {
    const codam = this.kind === 'codam',
      college = this.kind === 'college'
    if (codam) {
      this.masonry(-250, -234, 183, 234, 0x8a7561)
      rect(this.facade, 67, -234, 183, 234, 0x456961)
      rect(this.facade, -68, -205, 136, 205, 0x6d9285)
      for (const x of [-64, -4, 57]) rect(this.facade, x, -200, 5, 200, 0xa8baa1)
      rect(this.facade, -67, -146, 134, 5, 0xa1b197)
      for (const x of [-227, -151]) {
        this.window(x, -126, 45, 70)
      }
      for (const x of [91, 169]) {
        this.window(x, -126, 48, 70)
      }
      rect(this.facade, -261, -242, 522, 10, 0xb3af8f)
      rect(this.facade, -238, -226, 160, 68, 0x3b5950)
    } else {
      this.masonry(-260, -230, 520, 230, college ? 0x9a8b70 : 0x9c7d66)
      rect(this.facade, -272, -238, 544, 10, 0xaaa787)
      rect(this.facade, -245, -227, 490, 75, 0x426357)
      for (const x of [-218, -145, 100, 173]) this.window(x, -125, 42, 72)
      if (!college) {
        this.facade.addChild(new Graphics().poly([-282, -238, 0, -272, 282, -238]).fill(0x536e5b))
        rect(this.facade, -12, -258, 24, 15, 0xd1c69c)
      } else for (const x of [-260, 245]) rect(this.facade, x, -230, 15, 230, 0xb8a787)
    }
    rect(this.facade, -270, -15, 540, 15, 0x78836a)
  }
  private airport() {
    rect(this.facade, -285, -178, 570, 178, 0x8ba497)
    for (let x = -270; x < 280; x += 49) {
      rect(this.facade, x, -104, 42, 91, 0x5e847d)
      rect(this.facade, x + 3, -100, 17, 82, 0xa5c4b5)
    }
    rect(this.facade, -296, -184, 592, 9, 0xc5c5a0)
    rect(this.facade, -246, -171, 492, 64, 0x355c53)
    // Control tower and a passenger pickup lane, rather than another office facade.
    rect(this.facade, -267, -258, 39, 78, 0x7e9787)
    rect(this.facade, -286, -275, 78, 28, 0x4b736d)
    rect(this.facade, -281, -270, 68, 12, 0xb7cbbb)
    rect(this.facade, -290, -280, 86, 6, 0xc3bc98)
    rect(this.facade, -285, -12, 570, 12, 0x6b8274)
    for (let x = -267; x < 280; x += 49) {
      this.facade.addChild(
        new Graphics()
          .poly([x, -100, x + 13, -100, x + 38, -20, x + 25, -20])
          .fill({ color: 0xd5e6cd, alpha: 0.25 }),
      )
    }
    this.facade.addChild(
      new Graphics().poly([-299, -110, 299, -110, 317, -97, -317, -97]).fill(0xbbb99a),
    )
    rect(this.facade, -317, -97, 634, 5, 0x4f7062)
    for (const x of [-274, 265]) rect(this.facade, x, -92, 7, 80, 0xa0b39c)
    rect(this.facade, -205, -69, 102, 34, 0x284a42)
    label(this.facade, 'DEPARTURES', -197, -63, 8, 0xe4ddae, 95)
    for (let i = 0; i < 3; i++) {
      rect(this.facade, -196, -48 + i * 5, 33, 2, 0x95ad99)
      rect(this.facade, -148, -48 + i * 5, 35, 2, 0xc9bf84)
    }
  }
  private mobility() {
    this.masonry(-260, -243, 520, 243, 0x8a8472)
    rect(this.facade, -270, -251, 540, 10, 0xb9b598)
    rect(this.facade, -242, -229, 484, 74, 0x3f5f57)
    for (const x of [-221, -151, 106, 176]) this.window(x, -123, 43, 80)
    rect(this.facade, -72, -145, 144, 8, 0xa7ad91)
    for (const x of [-73, 67]) rect(this.facade, x, -137, 6, 137, 0x6a8375)
    rect(this.facade, -265, -15, 530, 15, 0x657b6e)
    rect(this.facade, -254, -149, 145, 132, 0x294f4a)
    for (const x of [-247, -203, -159]) {
      rect(this.facade, x, -142, 36, 116, 0x83b0a2)
      this.facade.addChild(
        new Graphics()
          .poly([x, -142, x + 9, -142, x + 34, -65, x + 25, -65])
          .fill({ color: 0xe1e7ca, alpha: 0.3 }),
      )
      rect(this.facade, x, -87, 36, 3, 0x3c6359)
    }
    rect(this.facade, 101, -41, 126, 5, 0xb3b394)
    for (let x = 106; x < 220; x += 16) rect(this.facade, x, -34, 8, 16, 0x587b58)
    rect(this.facade, 94, -145, 140, 7, 0x3c5c50)
    // The traffic story takes place in the lane in front of the office.

    for (const x of [-254, 245]) rect(this.facade, x, -242, 9, 230, 0x6e8276)
  }
  /** Illuminate only the existing doorway contour; no second ring or target marker. */
  setEntranceHighlight(near: boolean, focused: boolean, time: number, reduced: boolean) {
    this.entranceHighlight.clear()
    if (!near || !focused) return
    const pulse = reduced ? 0.5 : (1 + Math.sin(time / 450)) * 0.5
    const sweep = reduced ? 0.5 : (1 + Math.sin(time / 780)) * 0.5
    this.entranceHighlight
      .roundRect(-34, -94, 68, 96, 2)
      .stroke({ color: 0xffd99a, width: 11, alpha: 0.12 + pulse * 0.1 })
      .roundRect(-34, -94, 68, 96, 2)
      .fill({ color: 0xffdfa0, alpha: 0.045 + pulse * 0.045 })
      .stroke({ color: 0xffe9ba, width: 3, alpha: 0.69 + pulse * 0.25 })
      .rect(-34, -83 + sweep * 67, 3, 17)
      .fill({ color: 0xfff7d0, alpha: 0.4 + pulse * 0.18 })
  }
  update(time: number, open: number, reduced: boolean, powered = false) {
    // Preserve the artwork and typography aspect ratio on phones too.
    this.facade.scale.set(1)
    this.left.x = -26 * open
    this.right.x = 26 * open
    this.left.alpha = this.right.alpha = 1 - open * 0.65
    this.lights.clear()
    if (this.kind === 'college' || this.kind === 'codam') {
      for (const pane of this.panes)
        this.lights
          .rect(pane.x + 2, pane.y + 2, pane.w - 4, pane.h - 4)
          .fill({ color: powered ? 0xffdd90 : 0x244b40, alpha: powered ? 0.6 : 0.62 })
    }
    if (powered) {
      for (const x of [-290, 290]) {
        this.lights
          .rect(x - 2, -95, 4, 95)
          .fill(0x54745d)
          .circle(x, -96, 9)
          .fill(0xffe4a3)
          .circle(x, -96, 30)
          .fill({ color: 0xffdf94, alpha: 0.13 })
          .ellipse(x, -2, 35, 7)
          .fill({ color: 0xffdf94, alpha: 0.18 })
      }
      this.lights.rect(-35, -97, 70, 4).fill(0xffe4a3)
    }
    if (open > 0) this.lights.rect(-30, -87, 60, 85).fill({ color: 0xeee0aa, alpha: open * 0.22 })
  }
}
