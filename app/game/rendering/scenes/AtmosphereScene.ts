import { Container, Graphics } from 'pixi.js'
import { smoothRange } from '../../core/sceneryTransition'
import { polygon, rect } from '../drawing'
import { PineSprite } from '../sprites/NatureSprites'
import type { WorldFrame } from '../types'
function colorMix(a: number, b: number, t: number) {
  return (
    (Math.round((a >> 16) * (1 - t) + (b >> 16) * t) << 16) |
    (Math.round(((a >> 8) & 255) * (1 - t) + ((b >> 8) & 255) * t) << 8) |
    Math.round((a & 255) * (1 - t) + (b & 255) * t)
  )
}
export class AtmosphereScene extends Container {
  private layers: { node: Container; speed: number; drift?: number }[] = []
  private trees: { node: PineSprite; index: number }[] = []
  private buildings: { node: Container; height: number; index: number; lights: Graphics }[] = []
  private birds: Graphics[] = []
  private viewWidth = 0
  private viewHeight = 0
  resize(width: number, height: number) {
    if (width === this.viewWidth && height === this.viewHeight) return
    this.viewWidth = width
    this.viewHeight = height
    this.removeChildren().forEach((node) => node.destroy({ children: true }))
    this.layers = []
    this.trees = []
    this.buildings = []
    this.birds = []
    const sky = new Graphics()
    for (let row = 0; row < 48; row++) {
      const t = row / 47,
        c =
          t < 0.5
            ? colorMix(0xded5be, 0xbbc7bc, t * 2)
            : colorMix(0xbbc7bc, 0x77978b, (t - 0.5) * 2)
      sky.rect(0, (row * height) / 48, width, height / 48 + 1).fill(c)
    }
    this.addChild(sky)
    this.addChild(
      new Graphics()
        .circle(width * 0.76, height * 0.21, 58)
        .fill({ color: 0xf1d79b, alpha: 0.25 })
        .circle(width * 0.76, height * 0.21, 46)
        .fill({ color: 0xf1d79b, alpha: 0.7 }),
    )
    const count = Math.ceil(width / 1200) + 2
    const mountains = new Container(),
      valley = new Container(),
      farTrees = new Container(),
      forest = new Container(),
      city = new Container(),
      clouds = new Container()
    this.addChild(mountains, valley, farTrees, forest, city, clouds)
    this.layers.push(
      { node: mountains, speed: 0.13 },
      { node: valley, speed: 0.28 },
      { node: farTrees, speed: 0.36 },
      { node: forest, speed: 0.5 },
      { node: city, speed: 0.43 },
      { node: clouds, speed: 0.06, drift: 1 },
    )
    for (let copy = 0; copy < count; copy++) {
      const g = new Graphics()
      polygon(
        g,
        [
          0, 310, 85, 270, 144, 286, 316, 133, 395, 190, 505, 77, 641, 217, 715, 198, 885, 338,
          1055, 252, 1200, 310, 1200, 520, 0, 520,
        ],
        0x97a8a7,
      )
      polygon(g, [505, 77, 460, 139, 505, 123, 525, 148, 537, 113, 569, 146], 0xbdc8b6)
      polygon(g, [316, 133, 270, 200, 316, 177, 395, 190], 0xaab8ad)
      g.position.set(copy * 1200, height * 0.15)
      g.scale.y = (height * 0.85) / 520
      g.alpha = 0.58
      mountains.addChild(g)
      const v = new Graphics()
      polygon(
        v,
        [
          0, 280, 150, 235, 330, 254, 490, 288, 690, 232, 902, 261, 1070, 240, 1200, 280, 1200, 420,
          0, 420,
        ],
        0x6c9189,
      )
      polygon(
        v,
        [0, 356, 230, 340, 435, 367, 650, 348, 890, 366, 1200, 356, 1200, 420, 0, 420],
        0x829f8d,
      )
      v.position.set(copy * 1200, height * 0.3)
      v.scale.y = (height * 0.7) / 420
      v.alpha = 0.73
      valley.addChild(v)
      for (let i = 0; i < 9; i++) {
        const tree = new PineSprite(0x648a7a)
        tree.position.set(copy * 1200 + 40 + i * 144, height * (0.87 + (i % 3) * 0.025))
        tree.scale.set(0.35 + (i % 3) * 0.13)
        tree.alpha = 0.32
        farTrees.addChild(tree)
      }
      for (let i = 0; i < 6; i++) {
        const tree = new PineSprite()
        tree.position.set(
          copy * 1200 + [60, 220, 450, 650, 860, 1090][i]!,
          height * (0.96 + (i % 2) * 0.015),
        )
        tree.scale.set(0.85 + (i % 3) * 0.18)
        forest.addChild(tree)
        rect(forest, tree.x - 5, tree.y - 8, 10, 8, 0x7c8d70).alpha = 0.4
        this.trees.push({ node: tree, index: i })
      }
      for (let i = 0; i < 8; i++) {
        const tower = new Container(),
          h = 150 + (i % 4) * 32
        tower.position.set(copy * 1200 + 35 + i * 140, height)
        rect(tower, 0, -h, 95, h, 0x426c67)
        rect(tower, 4, -h + 6, 10, h - 6, 0x648578)
        rect(tower, 0, -h - 5, 95, 5, 0x69867a)
        const lights = new Graphics()
        for (let row = 0; row < 6; row++)
          for (let col = 0; col < 3; col++)
            lights
              .rect(22 + col * 20, -h + 22 + row * 22, 8, 6)
              .fill((i + row + col) % 4 ? 0xbfc5a0 : 0x6f9181)
        tower.addChild(lights)
        city.addChild(tower)
        this.buildings.push({ node: tower, height: h, index: i, lights })
      }
      const c = new Graphics()
      polygon(
        c,
        [
          70, 62, 70, 54, 128, 54, 128, 45, 193, 45, 193, 52, 262, 52, 262, 64, 337, 64, 337, 72,
          62, 72, 62, 62,
        ],
        0xf1dfb7,
      )
      polygon(
        c,
        [
          640, 113, 640, 104, 689, 104, 689, 97, 752, 97, 752, 104, 817, 104, 817, 115, 907, 115,
          907, 122, 628, 122, 628, 113,
        ],
        0xf1dfb7,
      )
      c.x = copy * 1200
      c.alpha = 0.45
      clouds.addChild(c)
    }
    for (let i = 0; i < 3; i++) {
      const bird = new Graphics()
      this.birds.push(bird)
      this.addChild(bird)
    }
  }
  update(frame: WorldFrame, reduced: boolean) {
    for (const layer of this.layers)
      layer.node.x = -(
        (((frame.camera * frame.scale * layer.speed +
          (reduced ? 0 : (frame.time / 1000) * (layer.drift ?? 0) * 2)) %
          1200) +
          1200) %
        1200
      )
    for (const tree of this.trees) {
      const cut = smoothRange(
        frame.urban,
        0.04 + (tree.index % 3) * 0.045,
        0.54 + (tree.index % 3) * 0.045,
      )
      tree.node.rotation = reduced ? 0 : -cut * 1.36
      tree.node.alpha = (1 - smoothRange(cut, 0.35, 1)) * 0.48
      tree.node.sway(frame.time, tree.index, reduced)
    }
    for (const b of this.buildings) {
      const rise = smoothRange(
        frame.urban,
        0.32 + (b.index % 4) * 0.055,
        0.82 + (b.index % 4) * 0.055,
      )
      b.node.y = this.viewHeight + (reduced ? 0 : b.height * (1 - rise))
      b.node.alpha = rise * 0.4
      b.lights.alpha = reduced ? 0.7 : 0.65 + Math.sin(frame.time / 1800 + b.index) * 0.15
    }
    for (const [i, bird] of this.birds.entries()) {
      const x = reduced
          ? this.viewWidth * 0.3 + i * 35
          : ((frame.time / 65 + i * 45) % (this.viewWidth + 120)) - 60,
        y = this.viewHeight * 0.28 + i * 9,
        wing = reduced ? 3 : Math.sin(frame.time / 170 + i) * 4
      bird
        .clear()
        .moveTo(-7, wing)
        .lineTo(0, 0)
        .lineTo(7, wing)
        .stroke({ width: 2, color: 0x6c8475, alpha: 0.45 })
      bird.position.set(x, y)
    }
  }
}
