import { Container } from 'pixi.js'
import { skillLogos } from '../../../content/skills'
import { SkillLogoSprite } from '../sprites/SkillLogoSprite'
export class SkillsRoadScene extends Container {
  private logos = skillLogos.map((logo, index) => new SkillLogoSprite(logo, -1275 + index * 150))
  constructor() {
    super()
    this.addChild(...this.logos)
  }
  update(playerX: number, time: number, reduced: boolean) {
    for (const logo of this.logos) logo.update(playerX - this.x, time, reduced)
  }
}
