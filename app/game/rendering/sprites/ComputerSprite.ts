import { Container, Graphics } from 'pixi.js'
import type { SurfaceRect } from '../../core/monitorSurface'
import type { companySlides } from '../../../content/company'
import { label, rect } from '../drawing'
/** A workstation with an explicit idle/start state; not an unexplained text rectangle. */
export class ComputerSprite extends Container {
  private screen = new Container()
  private bezel = new Graphics()
  private surfaceMask = new Graphics()
  private track = new Graphics()
  private lamp = new Graphics()
  private bezelGlow = new Graphics()
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
    this.addChild(this.bezel)
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
    this.screen.mask = this.surfaceMask
    this.bezelGlow.eventMode = 'none'
    this.addChild(this.screen, this.surfaceMask, this.track, this.lamp, this.bezelGlow)
    this.update(0, 1, false, 0, true)
  }
  setSurface(rect: SurfaceRect, expanded: boolean) {
    this.bezel
      .clear()
      .roundRect(rect.x - 12, rect.y - 12, rect.width + 24, rect.height + 24, 8)
      .fill(0x29463e)
      .stroke({ width: 5, color: 0x7c9588 })
      .rect(rect.x, rect.y, rect.width, rect.height)
      .fill(0xe8ecdf)
    this.surfaceMask.clear().rect(rect.x, rect.y, rect.width, rect.height).fill(0xffffff)
    this.surfaceMask.visible = !expanded
    this.screen.visible = !expanded
    this.bezelGlow.visible = !expanded
  }
  setInteractionGlow(active: boolean, time: number, reduced: boolean) {
    this.bezelGlow.clear()
    if (!active) return
    const pulse = reduced ? 0.5 : (1 + Math.sin(time / 530)) * 0.5
    const shimmer = reduced ? 0 : (time / 25) % 628
    this.bezelGlow
      .roundRect(-313, -369, 675, 247, 9)
      .stroke({ color: 0xffdba4, width: 16, alpha: 0.11 + pulse * 0.1 })
      .roundRect(-313, -369, 675, 247, 9)
      .stroke({ color: 0xffedbc, width: 4, alpha: 0.67 + pulse * 0.23 })
    if (!reduced)
      this.bezelGlow
        .rect(-302 + shimmer, -374, 44, 5)
        .fill({ color: 0xffffdd, alpha: 0.35 + pulse * 0.35 })
  }
  update(_progress: number, _scale = 1, active = false, time = 0, reduced = false) {
    const nl = this.locale === 'nl'
    const key = `${active}:${this.locale}`
    if (key !== this.last) {
      this.last = key
      this.screen.removeChildren().forEach((c) => c.destroy({ children: true }))
      rect(this.screen, -296, -350, 640, 211, 0xe8ecdf)
      rect(this.screen, -296, -350, 640, 29, 0x2b5445)
      label(this.screen, 'N / DEV', -279, -343, 13, 0xf3ebd2, 140)
      label(this.screen, 'PROJECT ARCHIVE', -118, -343, 11, 0xbad0b4, 260)
      label(this.screen, '07 FILES', 259, -343, 10, 0xe6d5ac, 100)
      if (active) {
        label(
          this.screen,
          nl ? 'ARCHIEF GEOPEND' : 'ARCHIVE OPEN',
          25,
          -268,
          32,
          0x2d5543,
          560,
        ).anchor.x = 0.5
        label(this.screen, 'NAVEL DEVELOPMENT', 25, -219, 15, 0x6f8a70, 360).anchor.x = 0.5
      } else {
        // A readable desktop metaphor rather than the previous text-only slideshow.
        rect(this.screen, -296, -321, 180, 182, 0x355e4d)
        label(this.screen, nl ? 'PROJECTEN' : 'PROJECT FILES', -278, -309, 11, 0xdfe6c8, 166)
        for (const [i, slide] of this.slides.entries()) {
          const y = -286 + i * 20
          if (i === 0) rect(this.screen, -290, y - 3, 167, 20, 0x547664)
          label(
            this.screen,
            `${String(i + 1).padStart(2, '0')}  ${slide.title}`,
            -279,
            y,
            11,
            i === 0 ? 0xffefc6 : 0xd3e1ce,
            164,
          )
        }
        label(this.screen, 'NAVEL DEVELOPMENT', -90, -306, 12, 0x729078, 360)
        label(this.screen, nl ? 'Mijn werk.' : 'Selected work.', -90, -273, 30, 0x284a3c, 400)
        label(
          this.screen,
          nl
            ? 'Projecten, techniek en het verhaal erachter.'
            : 'Projects, systems and the work behind them.',
          -90,
          -220,
          15,
          0x55725c,
          395,
        )
        rect(this.screen, -90, -178, 218, 27, 0x345e4b)
        label(
          this.screen,
          nl ? 'OPEN PROJECTARCHIEF  ↗' : 'OPEN PROJECT ARCHIVE  ↗',
          -78,
          -171,
          11,
          0xf3e9c9,
          200,
        )
        // Small stacked folders suggest exploring, rather than scrolling slides.
        for (let i = 2; i >= 0; i--) {
          const x = 240 + i * 15
          const y = -272 + i * 19
          const card = new Graphics()
            .roundRect(x - 33, y - 12, 54, 62, 3)
            .fill([0xb6c9aa, 0x8dab9e, 0xcdb997][i]!)
            .stroke({ color: 0xf6f0db, width: 2 })
          this.screen.addChild(card)
        }
      }
    }
    this.track.clear()
    this.lamp
      .clear()
      .circle(337, -129, 2)
      .fill({
        color: 0xc6dc99,
        alpha: reduced ? 0.7 : 0.6 + Math.sin(time / 750) * 0.25,
      })
  }
}
