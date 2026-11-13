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
    this.status.visible = false
    const start = () => state.trigger(id, this.action)
    if (this.action === 'basketball') {
      rect(this, -150, -2, 400, 4, 0xb9b38b)
      this.addChild(
        new Graphics()
          .moveTo(-145, -3)
          .lineTo(245, -3)
          .moveTo(-40, -3)
          .bezierCurveTo(-40, -38, 15, -38, 15, -3)
          .stroke({ width: 2, color: 0xe3d6ac }),
      )
      rect(this, 228, -151, 5, 151, 0x68846d)
      rect(this, 197, -159, 55, 36, 0xc6c8a5)
      rect(this, 206, -151, 25, 18, 0xaab89b)
      this.addChild(
        new Graphics()
          .ellipse(215, -129, 20, 4)
          .stroke({ width: 3, color: 0xb8845f })
          .moveTo(199, -126)
          .lineTo(206, -105)
          .lineTo(225, -105)
          .lineTo(232, -126)
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
      rect(this, 181, -198, 68, 28, 0x29483f)
      this.status.visible = true
      this.status.position.set(215, -191)
      this.status.style.fill = 0xe9dfb7
      this.status.style.fontSize = 12
    } else if (this.action === 'departure') {
      rect(this, -260, -4, 590, 15, 0x71897a)
      for (let x = -240; x < 320; x += 65) rect(this, x, 1, 29, 2, 0xdedcba)
      this.plane = new AircraftSprite()
      this.object.addChild(this.plane)
      tapTarget(this.plane, start, new Rectangle(-110, -40, 220, 90))
      this.status.position.set(390, -98)
    } else if (this.action === 'camera') {
      rect(this, -280, -12, 620, 20, 0x5b7368)
      for (let x = -260; x < 320; x += 72) rect(this, x, -3, 35, 2, 0xc4c6a5)
      rect(this, 147, -126, 7, 141, 0x6b7d6d)
      rect(this, 133, -142, 36, 27, 0x3d5b51)
      rect(this, 139, -136, 14, 12, 0x8daf9d)
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

      this.status.position.set(410, -92)
    } else if (this.action === 'luggage') {
      rect(this, 146, -52, 73, 7, 0xb8a275)
      for (const x of [151, 209]) rect(this, x, -45, 5, 45, 0x526a52)
      rect(this, 157, -24, 55, 4, 0x89916a)
      rect(this, 179, -70, 6, 18, 0x7e8a6b)
      this.addChild(new Graphics().ellipse(182, -59, 12, 8).fill(0xccb983))
      rect(this, 168, -55, 28, 3, 0x6f7050)
      rect(this, 180, -70, 4, 4, 0xe9cf8d)
      const bell = new Container()
      tapTarget(bell, start, new Rectangle(140, -100, 85, 100))
      this.addChild(bell)
      this.cart = new Container()
      rect(this.cart, -29, -15, 60, 5, 0xa1ab87)
      rect(this.cart, -25, -54, 28, 39, 0xb39a72)
      rect(this.cart, 3, -43, 22, 28, 0x7d9783)
      for (const x of [-22, 23]) this.cart.addChild(new Graphics().circle(x, -5, 5).fill(0x35584a))
      this.object.addChild(this.cart)
      this.status.position.set(385, -134)
    } else {
      rect(this, 107, -103, 126, 69, 0x243e39)
      rect(this, 113, -97, 114, 55, 0x18352e)
      rect(this, 161, -34, 16, 25, 0x758e73)
      rect(this, 98, -10, 143, 7, 0xb9b38b)
      label(
        this,
        this.action === 'compile' ? '> make project' : 'POWER / LINK',
        120,
        -88,
        9,
        0xc9d9ac,
        105,
      )
      if (this.action === 'compile') {
        this.status.visible = true
        this.status.position.set(120, -53)
        this.status.anchor.x = 0
        this.status.style.fontSize = 8
        this.status.style.fill = 0xd7e5ad
      } else {
        rect(this, 237, -94, 4, 86, 0x7d8a6d)
        this.addChild(
          new Graphics().poly([225, -96, 251, -96, 246, -116, 230, -116]).fill(0xa9af83),
        )
      }
      for (let i = 0; i < 3; i++) {
        const tile = new Graphics()
        tile.position.set(121 + i * 33, -66)
        this.tiles.push(tile)
        this.addChild(tile)
      }
      const terminal = new Container()
      tapTarget(
        terminal,
        () => {
          const values = state.switches[id] ?? [0, 0, 0]
          const next = values.findIndex((value) => !value)
          if (next < 0) {
            state.switches[id] = [0, 0, 0]
            return
          }
          if (state.toggle(id, next)) start()
        },
        new Rectangle(98, -108, 145, 108),
      )
      this.addChild(terminal)
    }
    this.addChild(this.object, this.overlay)
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
      Math.abs(player + 90) < 25 &&
      frame.motion.vx > 15 &&
      !running
    )
      this.state.trigger(this.id, this.action)
    if (this.ball) {
      const p = running ? basketballPose(age) : { x: -90, y: -10 }
      this.ball.position.set(p.x, p.y)
      this.ball.rotation = running ? age * 5 : 0
      this.status.text = `${nl ? 'Raak' : 'Baskets'}: ${record?.completed ?? 0}`
    } else if (this.plane) {
      const p = running ? aircraftPose(age) : { x: 130, y: -22, angle: 0, scale: 1 }
      this.plane.position.set(p.x, p.y)
      this.plane.angle = reduced ? 0 : p.angle
      this.plane.scale.set(p.scale * 0.95)
      this.plane.visible = true
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
      const p = running ? cameraCarPose(age) : { x: -180, flash: false }
      this.car.position.set(p.x, -5)
      if (p.flash)
        this.overlay.rect(123, -150, 55, 44).fill({ color: 0xfff2c7, alpha: reduced ? 0.3 : 0.9 })
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
      this.cart.position.set(running ? 210 - Math.min(1, age / 3) * 210 : 210, 0)
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
          .rect(0, 0, 22, 12)
          .fill(values[i] ? 0x819e67 : 0x52746a)
          .stroke({ width: 2, color: values[i] ? 0xd7d7a0 : 0x8ea68e }),
      )
      if (this.action === 'circuit') {
        values.forEach((value, i) => {
          this.overlay
            .moveTo(127 + i * 33, -58)
            .lineTo(127 + i * 33, -47)
            .lineTo(215, -47)
            .stroke({ width: 2, color: value ? 0xe7d48d : 0x486b5c })
        })
        this.overlay.rect(231, -111, 14, 13).fill(values.every(Boolean) ? 0xffe4a4 : 0x6e8971)
      }
      this.status.text = values.every(Boolean)
        ? '> running_'
        : values[1]
          ? '> tests: OK'
          : values[0]
            ? '> build: OK'
            : '> ready_'
    }
  }
}
