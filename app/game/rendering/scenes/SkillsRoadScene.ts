import { Container, Graphics } from 'pixi.js'
import { skillLogos } from '../../../content/skills'
import { SkillLogoSprite } from '../sprites/SkillLogoSprite'
import { BushSprite } from '../sprites/NatureSprites'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'
import { rect } from '../drawing'
export class SkillsRoadScene extends Container {
  private logos: SkillLogoSprite[] = []
  private packets = new Graphics()
  private plants: BushSprite[] = []
  constructor(
    private activity: ActivitySystem,
    private collected: (name: string, count: number) => void,
  ) {
    super()
    const track = new Graphics()
      .moveTo(-1410, -5)
      .lineTo(1410, -5)
      .stroke({ width: 3, color: 0x8ba98a, alpha: 0.6 })
    this.addChild(track)
    this.logos = skillLogos.map(
      (logo, index) =>
        new SkillLogoSprite(logo, -1275 + index * 150, index, () => {
          if (!activity.exploredSkills.includes(logo.id)) {
            activity.exploredSkills.push(logo.id)
            this.collected(logo.name, activity.exploredSkills.length)
          }
        }),
    )
    for (let x = -1390; x < 1400; x += 450) {
      const bush = new BushSprite()
      bush.position.set(x, 0)
      bush.scale.set(0.7)
      this.plants.push(bush)
      this.addChild(bush)
      rect(this, x + 55, -3, 17, 3, 0xb6bf92)
    }
    this.addChild(...this.logos, this.packets)
  }
  update(frame: WorldFrame, ground: number, reduced: boolean) {
    const x = frame.motion.x - this.x,
      footY = frame.motion.y + ground
    for (const logo of this.logos)
      logo.update(
        x,
        footY,
        frame.time,
        reduced,
        this.activity.exploredSkills.includes(logo.logo.id),
      )
    this.plants.forEach((plant, i) => plant.sway(frame.time, i, reduced))
    this.packets.clear()
    if (!reduced)
      for (let i = 0; i < 7; i++) {
        const px = ((frame.time / 18 + i * 400) % 2800) - 1400
        this.packets.rect(px, -7, 5, 3).fill(0xe0d9a4)
      }
  }
}
