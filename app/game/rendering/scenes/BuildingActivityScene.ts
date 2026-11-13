import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { AircraftSprite } from '../sprites/AircraftSprite'
import { rect, label } from '../drawing'
import { tapTarget } from '../interactions'
import {
  buildingActions,
  aircraftPose,
  basketballPose,
  cameraCarPose,
  type SceneAction,
} from '../../core/sceneActivities'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'
const captions: Record<SceneAction, [string, string]> = {
  basketball: ['Schiet!', 'Shoot!'],
  departure: ['Laat het vliegtuig vertrekken', 'Clear for take-off'],
  camera: ['Start de testrit', 'Start the test drive'],
  luggage: ['Bel voor de bagage', 'Ring for luggage'],
  circuit: ['Verbind de drie kabels', 'Connect the three cables'],
  compile: ['Bouw → test → run', 'Build → test → run'],
}
export class BuildingActivityScene extends Container {
  private object = new Container()
  private overlay = new Graphics()
  private status: Text
  private ball?: Graphics
  private plane?: AircraftSprite
  private car?: Container
  private cart?: Container
  private tiles: Graphics[] = []
  private action: SceneAction
  constructor(
    private id: string,
    private state: ActivitySystem,
    private locale: string,
  ) {
    super()
    this.action = buildingActions[id]!
    const nl = locale === 'nl'
    this.status = label(this, '', 330, -180, 11, 0x335c4a, 230)
    this.status.anchor.x = 0.5
    const start = () => state.trigger(id, this.action)
    if (this.action === 'basketball') {
      rect(this, 293, -2, 285, 4, 0xb9b38b)
      this.addChild(
        new Graphics()
          .moveTo(300, -3)
          .lineTo(575, -3)
          .moveTo(390, -3)
          .bezierCurveTo(390, -38, 445, -38, 445, -3)
          .stroke({ width: 2, color: 0xe3d6ac }),
      )
      rect(this, 548, -151, 5, 151, 0x68846d)
      rect(this, 517, -159, 55, 36, 0xc6c8a5)
      rect(this, 526, -151, 25, 18, 0xaab89b)
      this.addChild(
        new Graphics()
          .ellipse(535, -129, 20, 4)
          .stroke({ width: 3, color: 0xb8845f })
          .moveTo(519, -126)
          .lineTo(526, -105)
          .lineTo(545, -105)
          .lineTo(552, -126)
          .stroke({ width: 1, color: 0xdbe0bd }),
      )
      this.ball = new Graphics()
        .circle(0, 0, 10)
        .fill(0xc58d59)
        .stroke({ width: 1, color: 0x745b3e })
        .moveTo(-10, 0)
        .lineTo(10, 0)
        .moveTo(0, -10)
        .lineTo(0, 10)
        .stroke({ width: 1, color: 0x745b3e })
      this.object.addChild(this.ball)
      tapTarget(this.ball, start, new Rectangle(-38, -38, 76, 76))
      this.status.position.set(427, -183)
      this.target(420, -35, 280, 55, start, nl ? 'Basketbal' : 'Basketball')
    } else if (this.action === 'departure') {
      rect(this, 250, 5, 470, 15, 0x71897a)
      for (let x = 270; x < 700; x += 65) rect(this, x, 10, 29, 2, 0xdedcba)
      this.plane = new AircraftSprite()
      this.object.addChild(this.plane)
      tapTarget(this.plane, start, new Rectangle(-110, -40, 220, 90))
      this.status.position.set(390, -98)
      this.target(390, -59, 210, 44, start, nl ? 'Vertrek →' : 'Depart →')
    } else if (this.action === 'camera') {
      rect(this, -390, 9, 1040, 20, 0x5b7368)
      for (let x = -365; x < 630; x += 72) rect(this, x, 19, 35, 2, 0xc4c6a5)
      rect(this, 277, -126, 7, 141, 0x6b7d6d)
      rect(this, 263, -142, 36, 27, 0x3d5b51)
      rect(this, 269, -136, 14, 12, 0x8daf9d)
      const car = new Container()
      car.addChild(
        new Graphics()
          .poly([-62, -17, -57, -35, -29, -37, -12, -57, 34, -57, 54, -37, 75, -30, 78, -16])
          .fill(0x416a6c)
          .poly([-6, -53, 30, -53, 45, -37, -18, -37])
          .fill(0xabcabd),
      )
      for (const x of [-36, 49])
        car.addChild(
          new Graphics().circle(x, -14, 12).fill(0x29463f).circle(x, -14, 5).fill(0xa2b09a),
        )
      rect(car, 66, -31, 10, 5, 0xe5d69b)
      this.car = car
      this.object.addChild(car)
      tapTarget(car, start, new Rectangle(-78, -62, 160, 65))
      this.target(390, -57, 160, 44, start, nl ? 'Testrit →' : 'Test drive →')
      this.status.position.set(410, -92)
    } else if (this.action === 'luggage') {
      rect(this, 296, -52, 73, 7, 0x9d9d76)
      rect(this, 329, -70, 6, 18, 0x7e8a6b)
      this.addChild(new Graphics().ellipse(332, -72, 18, 8).fill(0xccb983))
      this.target(332, -91, 100, 68, start, nl ? 'Ding!' : 'Ding!')
      this.cart = new Container()
      rect(this.cart, -29, -15, 60, 5, 0xa1ab87)
      rect(this.cart, -25, -54, 28, 39, 0xb39a72)
      rect(this.cart, 3, -43, 22, 28, 0x7d9783)
      for (const x of [-22, 23]) this.cart.addChild(new Graphics().circle(x, -5, 5).fill(0x35584a))
      this.object.addChild(this.cart)
      this.status.position.set(385, -134)
    } else {
      rect(this, 302, -165, 255, 119, 0x355c52)
      rect(this, 295, -172, 269, 8, 0x94a485)
      for (const x of [310, 545]) rect(this, x, -46, 5, 46, 0x758e73)
      const words = this.action === 'compile' ? ['BUILD', 'TEST', 'RUN'] : ['01', '02', '03']
      words.forEach((word, i) => {
        const tile = new Graphics()
        tile.position.set(320 + i * 76, -138)
        this.tiles.push(tile)
        this.addChild(tile)
        label(this, word, 328 + i * 76, -121, 10, 0xdbe0bd, 70)
        tapTarget(
          tile,
          () => {
            if (state.toggle(id, i)) start()
          },
          new Rectangle(-6, -5, 76, 76),
        )
      })
      this.status.position.set(430, -201)
    }
    this.addChild(this.object, this.overlay)
  }
  private target(x: number, y: number, w: number, h: number, action: () => void, text: string) {
    const node = new Container()
    node.position.set(x, y)
    rect(node, -Math.min(w, 170) / 2, -12, Math.min(w, 170), 24, 0x496e5a)
    const t = label(node, text, 0, -8, 11, 0xeee5bf, w - 10)
    t.anchor.x = 0.5
    tapTarget(node, action, new Rectangle(-w / 2, -Math.max(h, 76) / 2, w, Math.max(h, 76)))
    this.addChild(node)
  }
  update(frame: WorldFrame, entryX: number, reduced: boolean) {
    const record = this.state.actions[this.id],
      running = record?.running ?? false,
      age = record?.age ?? 0,
      nl = this.locale === 'nl'
    this.overlay.clear()
    const player = frame.motion.x - entryX
    if (
      !frame.paused &&
      !frame.navigating &&
      this.action === 'basketball' &&
      Math.abs(player - 330) < 25 &&
      frame.motion.vx > 15 &&
      !running
    )
      this.state.trigger(this.id, this.action)
    if (this.ball) {
      const p = running ? basketballPose(age) : { x: 330, y: -10 }
      this.ball.position.set(p.x, p.y)
      this.ball.rotation = running ? age * 5 : 0
      this.status.text = `${nl ? 'Raak' : 'Baskets'}: ${record?.completed ?? 0}`
    } else if (this.plane) {
      const p = running ? aircraftPose(age) : { x: 310, y: -12, angle: 0, scale: 1 }
      this.plane.position.set(p.x, p.y)
      this.plane.angle = reduced ? 0 : p.angle
      this.plane.scale.set(p.scale)
      this.plane.visible = running || !record?.completed
      this.status.text = running
        ? age < 1.4
          ? nl
            ? 'Taxiën…'
            : 'Taxiing…'
          : nl
            ? 'Opgestegen!'
            : 'Airborne!'
        : record?.completed
          ? nl
            ? 'Vertrokken · tik voor nog een vlucht'
            : 'Departed · tap for another flight'
          : captions.departure[nl ? 0 : 1]
    } else if (this.car) {
      const p = running ? cameraCarPose(age) : { x: -330, flash: false }
      this.car.position.set(p.x, 18)
      if (p.flash)
        this.overlay.rect(253, -150, 55, 44).fill({ color: 0xfff2c7, alpha: reduced ? 0.3 : 0.9 })
      this.status.text = running
        ? p.flash
          ? '⚡ 62 km/h'
          : nl
            ? 'Camera-test…'
            : 'Camera test…'
        : record?.completed
          ? nl
            ? 'Vastgelegd · nog een rit?'
            : 'Captured · another drive?'
          : captions.camera[nl ? 0 : 1]
    } else if (this.cart) {
      this.cart.position.set(running ? 390 - Math.min(1, age / 3) * 365 : 390, 0)
      this.cart.alpha = running && age > 3 ? Math.max(0, 1 - (age - 3)) : 1
      this.status.text = running
        ? nl
          ? 'Bagage komt eraan…'
          : 'Luggage on its way…'
        : record?.completed
          ? nl
            ? 'Bezorgd · bel opnieuw'
            : 'Delivered · ring again'
          : captions.luggage[nl ? 0 : 1]
    } else {
      const values = this.state.switches[this.id] ?? [0, 0, 0]
      this.tiles.forEach((tile, i) =>
        tile
          .clear()
          .rect(0, 0, 65, 63)
          .fill(values[i] ? 0x819e67 : 0x52746a)
          .stroke({ width: 2, color: values[i] ? 0xd7d7a0 : 0x8ea68e }),
      )
      if (this.action === 'circuit') {
        values.forEach((value, i) => {
          const x = 320 + i * 76
          this.overlay
            .moveTo(x + 6, -106)
            .lineTo(x + 26, -106)
            .lineTo(x + 26, -91)
            .lineTo(x + 59, -91)
            .stroke({ width: 3, color: value ? 0xe8d496 : 0x869f88 })
        })
        this.overlay.circle(570, -91, 6).fill(values.every(Boolean) ? 0xead28d : 0x7d9682)
      }
      this.status.text = values.every(Boolean)
        ? nl
          ? 'Werkt!'
          : 'It works!'
        : captions[this.action][nl ? 0 : 1]
    }
  }
}
