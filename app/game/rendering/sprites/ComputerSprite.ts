import { Container, Graphics } from 'pixi.js'
import type { companySlides } from '../../../content/company'
import { label, rect } from '../drawing'
import { presentationSlide } from '../../core/presentation'
/** A workstation with an explicit idle/start state; not an unexplained text rectangle. */
export class ComputerSprite extends Container {
  private screen = new Container()
  private track = new Graphics()
  private lamp = new Graphics()
  private last = ''
  constructor(
    private slides: ReturnType<typeof companySlides>,
    private locale: string,
  ) {
    super()
    // Desk, legs, tower, keyboard and mouse establish scale before the monitor wakes.
    rect(this, -337, -80, 785, 12, 0xa99b72)
    this.addChild(new Graphics().poly([-337, -80, -310, -94, 426, -94, 448, -80]).fill(0xc0ad7d))
    for (const x of [-310, 408]) {
      rect(this, x, -68, 12, 68, 0x6e7e60)
      rect(this, x + 9, -68, 5, 68, 0x3c5b49)
    }
    rect(this, 374, -207, 59, 112, 0x304d43)
    rect(this, 380, -200, 45, 93, 0x47695b)
    rect(this, 387, -189, 31, 4, 0x8ba58d)
    for (let y = -155; y < -117; y += 8) rect(this, 389, y, 27, 2, 0x294a3f)
    this.addChild(
      new Graphics()
        .roundRect(-313, -369, 675, 247, 9)
        .fill(0x29463e)
        .stroke({ width: 7, color: 0x7c9588 }),
    )
    rect(this, -296, -350, 640, 211, 0xeee8d1)
    rect(this, 0, -121, 55, 31, 0x718e7b)
    rect(this, -54, -92, 166, 7, 0x8fa58b)
    this.addChild(new Graphics().poly([-167, -80, -151, -92, 118, -92, 142, -80]).fill(0x4a6957))
    for (let row = 0; row < 2; row++)
      for (let col = 0; col < 17; col++) rect(this, -143 + col * 15, -89 + row * 5, 10, 3, 0xa8b699)
    this.addChild(new Graphics().ellipse(191, -85, 13, 7).fill(0xc5c7a4))
    this.addChild(
      new Graphics()
        .moveTo(191, -92)
        .bezierCurveTo(205, -118, 287, -85, 295, -125)
        .stroke({ width: 2, color: 0x54725c }),
    )
    const mask = new Graphics().rect(-296, -350, 640, 211).fill(0xffffff)
    this.screen.mask = mask
    this.addChild(this.screen, mask, this.track, this.lamp)
    this.update(0, 1, false, 0, true)
  }
  update(progress: number, scale = 1, active = false, time = 0, reduced = false) {
    const compact = scale < 0.65,
      index = presentationSlide(progress, this.slides.length),
      slide = this.slides[index],
      nl = this.locale === 'nl'
    const key = `${active}:${compact}:${index}`
    if (key !== this.last) {
      this.last = key
      this.screen.removeChildren().forEach((c) => c.destroy({ children: true }))
      rect(this.screen, -296, -350, 640, 24, 0x466e5b)
      label(this.screen, 'navel / development', -278, -344, 11, 0xe9e6ca, 380)
      label(
        this.screen,
        active
          ? `${String(index + 1).padStart(2, '0')} / ${this.slides.length}`
          : 'PROJECT COMPUTER',
        208,
        -344,
        10,
        0xc3d5b5,
        130,
      )
      if (!active) {
        label(this.screen, nl ? 'Mijn projecten' : 'My projects', -264, -307, 35, 0x2a5140, 580)
        label(
          this.screen,
          nl
            ? 'Van game-plug-ins tot mijn eigen cloudplatform.'
            : 'From game plug-ins to my own cloud platform.',
          -264,
          -256,
          compact ? 24 : 17,
          0x4b6c55,
          580,
        )
        rect(this.screen, -120, -207, 281, 43, 0x3e7056)
        const start = label(
          this.screen,
          nl ? '▶  Bekijk mijn projecten' : '▶  Explore my projects',
          20,
          -194,
          compact ? 23 : 18,
          0xf0e7c7,
          265,
        )
        start.anchor.x = 0.5
        const hint = label(
          this.screen,
          nl ? 'Tik op het scherm om te beginnen.' : 'Tap the screen to begin.',
          20,
          -156,
          compact ? 18 : 12,
          0x638067,
          590,
        )
        hint.anchor.x = 0.5
      } else if (slide) {
        label(this.screen, slide.period, -268, -314, compact ? 17 : 11, 0x687d5e, 565)
        label(this.screen, slide.title, -268, -286, compact ? 32 : 28, 0x294f3f, 570)
        label(
          this.screen,
          slide.summary,
          -268,
          -236,
          compact ? 24 : 18,
          0x42634e,
          compact ? 570 : 415,
        )
        if (!compact) {
          const icon = new Graphics()
          icon.position.set(247, -207)
          if (slide.id === 'navel-cloud')
            for (const x of [-48, 9]) {
              icon.rect(x, -25, 40, 71).fill(0x537866)
              for (let y = -15; y < 42; y += 13) icon.rect(x + 5, y, 25, 4).fill(0xbacb9e)
            }
          else if (slide.id === 'gmodstore')
            icon
              .roundRect(-50, -14, 100, 51, 12)
              .fill(0x62768a)
              .rect(-34, -3, 29, 8)
              .rect(-24, -13, 8, 30)
              .fill(0xd6d9b9)
              .circle(27, 0, 5)
              .circle(36, 13, 5)
              .fill(0xc5aa8b)
          else if (slide.id === 'q-lite')
            icon
              .rect(-51, -23, 102, 58)
              .fill(0x4d6c62)
              .rect(-44, -15, 88, 26)
              .fill(0xb3c89b)
              .moveTo(-34, 23)
              .lineTo(36, 23)
              .stroke({ width: 4, color: 0xc6c99d })
          else {
            icon
              .rect(-44, -23, 88, 68)
              .fill(0x6d8c74)
              .rect(-31, -12, 22, 22)
              .rect(8, -12, 22, 22)
              .fill(0xd7cd9e)
              .rect(-8, 15, 18, 30)
              .fill(0x3d6554)
          }
          this.screen.addChild(icon)
          label(this.screen, slide.tags.slice(0, 5).join(' · '), -268, -159, 10, 0x6d805d, 590)
        }
      }
    }
    this.track.clear()
    if (active) this.track.rect(-296, -142, 640 * progress, 3).fill(0x70996f)
    this.lamp
      .clear()
      .circle(337, -129, 2)
      .fill({ color: 0xc6dc99, alpha: reduced ? 0.7 : 0.6 + Math.sin(time / 750) * 0.25 })
  }
}
