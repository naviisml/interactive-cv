import { Container, Graphics } from 'pixi.js'
import { smoothRange } from '../../core/sceneryTransition'
import { polygon, rect } from '../drawing'
import type { WorldFrame } from '../types'
export class AtmosphereScene extends Container {
  private layers: { node: Container; speed: number }[] = []
  private trees: { node: Container; index: number }[] = []
  private buildings: { node: Container; height: number; index: number }[] = []
  private viewWidth = 0
  private viewHeight = 0
  resize(width: number, height: number) {
    if (this.viewWidth === width && this.viewHeight === height) return
    this.viewWidth = width
    this.viewHeight = height
    this.removeChildren().forEach((node) => node.destroy({ children: true }))
    this.layers = []
    this.trees = []
    this.buildings = []
    const sky = new Graphics().rect(0, 0, width, height).fill(0xc6cebd)
    this.addChild(sky)
    this.addChild(
      new Graphics().circle(width * 0.76, height * 0.2, 50).fill({ color: 0xf2d69b, alpha: 0.7 }),
    )
    const count = Math.ceil(width / 1200) + 2
    for (const [speed, color, ratio] of [
      [0.12, 0x9baaaa, 0.37],
      [0.27, 0x7a9990, 0.65],
      [0.42, 0x638a7e, 0.87],
    ] as const) {
      const node = new Container()
      this.addChild(node)
      this.layers.push({ node, speed })
      for (let n = 0; n < count; n++) {
        const g = new Graphics()
        polygon(
          g,
          [
            n * 1200,
            height * ratio,
            n * 1200 + 150,
            height * (ratio - 0.09),
            n * 1200 + 330,
            height * (ratio + 0.02),
            n * 1200 + 520,
            height * (ratio - 0.2),
            n * 1200 + 740,
            height * ratio,
            n * 1200 + 940,
            height * (ratio - 0.08),
            (n + 1) * 1200,
            height * ratio,
            (n + 1) * 1200,
            height,
            n * 1200,
            height,
          ],
          color,
        )
        g.alpha = 0.7
        node.addChild(g)
      }
    }
    const forest = new Container(),
      city = new Container()
    this.addChild(forest, city)
    this.layers.push({ node: forest, speed: 0.5 }, { node: city, speed: 0.43 })
    for (let copy = 0; copy < count; copy++) {
      for (let i = 0; i < 6; i++) {
        const baseX = copy * 1200 + 60 + i * 200,
          baseY = height * (0.9 + (i % 2) * 0.04),
          tree = new Container()
        tree.position.set(baseX, baseY)
        forest.addChild(tree)
        const g = new Graphics()
        rect(tree, -4, -75, 8, 75, 0x53725e)
        polygon(
          g,
          [
            0, -190, -18, -155, -9, -155, -31, -110, -20, -110, -46, -55, 46, -55, 20, -110, 31,
            -110, 9, -155, 18, -155,
          ],
          0x3f7062,
        )
        tree.addChild(g)
        tree.alpha = 0.4
        rect(forest, baseX - 5, baseY - 8, 10, 8, 0x7c8d70).alpha = 0.45
        this.trees.push({ node: tree, index: i })
      }
      for (let i = 0; i < 8; i++) {
        const tower = new Container(),
          h = 160 + (i % 4) * 30
        tower.position.set(copy * 1200 + 35 + i * 140, height)
        city.addChild(tower)
        rect(tower, 0, -h, 95, h, 0x426c67)
        rect(tower, 5, -h + 5, 9, h - 5, 0x68877c)
        for (let row = 0; row < 4; row++)
          for (let col = 0; col < 3; col++)
            rect(tower, 20 + col * 21, -20 - row * 24, 8, 6, 0xbcc4a0)
        tower.alpha = 0
        this.buildings.push({ node: tower, height: h, index: i })
      }
    }
    const clouds = new Container()
    this.addChild(clouds)
    this.layers.push({ node: clouds, speed: 0.06 })
    for (let n = 0; n < count; n++) {
      rect(clouds, n * 1200 + 50, 45, 280, 10, 0xece0bd).alpha = 0.5
      rect(clouds, n * 1200 + 110, 35, 120, 10, 0xece0bd).alpha = 0.5
      rect(clouds, n * 1200 + 700, 100, 210, 8, 0xece0bd).alpha = 0.4
    }
  }
  update(frame: WorldFrame, reduced: boolean) {
    for (const layer of this.layers)
      layer.node.x = -((frame.camera * frame.scale * layer.speed) % 1200)
    for (const tree of this.trees) {
      const cut = smoothRange(
        frame.urban,
        0.04 + (tree.index % 3) * 0.045,
        0.54 + (tree.index % 3) * 0.045,
      )
      tree.node.rotation = reduced ? 0 : -cut * 1.36
      tree.node.alpha = (1 - smoothRange(cut, 0.35, 1)) * 0.4
    }
    for (const b of this.buildings) {
      const rise = smoothRange(
        frame.urban,
        0.32 + (b.index % 4) * 0.055,
        0.82 + (b.index % 4) * 0.055,
      )
      b.node.y = this.viewHeight + (reduced ? 0 : b.height * (1 - rise))
      b.node.alpha = rise * 0.4
    }
  }
}
