import { Container, Graphics } from 'pixi.js'
import type { TimelineEvent } from '../../../content/timeline'
import { rect, label } from '../drawing'
export class CompanySign extends Container {
  constructor(event: TimelineEvent) {
    super()
    rect(this, -5, -160, 7, 160, 0x788268)
    this.addChild(
      new Graphics()
        .roundRect(-255, -170, 265, 107, 3)
        .fill(0xf0e8cf)
        .stroke({ width: 2, color: 0x87987c }),
    )
    label(this, event.title, -241, -159, 15, 0x294b43, 237)
    label(this, event.role?.split(' · ')[0] ?? event.chapter, -241, -132, 10, 0x4e6b58, 237)
    label(this, event.period ?? event.label, -241, -95, 10, 0x6b795e, 237)
  }
}
