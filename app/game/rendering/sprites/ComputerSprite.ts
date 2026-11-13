import { Container, Graphics, Text } from 'pixi.js'
import type { companySlides } from '../../../content/company'
import { label, rect } from '../drawing'
import { presentationSlide } from '../../core/presentation'
export class ComputerSprite extends Container {
  private content = new Container()
  private track = new Graphics()
  private last = -1
  constructor(private slides: ReturnType<typeof companySlides>) {
    super()
    this.addChild(
      new Graphics()
        .roundRect(-310, -370, 690, 288, 12)
        .fill(0x2b423c)
        .stroke({ width: 9, color: 0x71877c }),
    )
    rect(this, -296, -354, 662, 244, 0xefe9d6)
    rect(this, -8, -83, 88, 66, 0x81968a)
    rect(this, -105, -17, 280, 17, 0x9cac94)
    rect(this, -85, 3, 250, 7, 0x7e8f79)
    this.addChild(this.content, this.track)
    this.update(0)
  }
  update(progress: number, scale = 1) {
    const compact = scale < 0.65
    const index = presentationSlide(progress, this.slides.length),
      slide = this.slides[index]
    if (!slide) return
    if (index + (compact ? 100 : 0) !== this.last) {
      this.last = index + (compact ? 100 : 0)
      this.content.removeChildren().forEach((c) => c.destroy())
      label(this.content, 'NAVEL DEVELOPMENT  /  ' + slide.period, -270, -337, 10, 0x6c7a67, 610)
      label(this.content, slide.title, -270, -310, compact ? 34 : 27, 0x284c40, 610)
      label(this.content, slide.summary, -270, -250, compact ? 25 : 17, 0x3e5e50, 610)
      if (!compact) label(this.content, slide.body, -270, -211, 13, 0x66785d, 610)
      if (!compact)
        label(this.content, slide.tags.slice(0, 5).join('  ·  '), -270, -139, 11, 0x477d70, 610)
    }
    this.track
      .clear()
      .rect(-296, -112, 662 * progress, 3)
      .fill(0x5b8c78)
    this.content.y = -Math.sin(((progress * this.slides.length) % 1) * Math.PI) * 4
  }
}
