import type { Text } from 'pixi.js';
import { Container, Graphics, Rectangle } from 'pixi.js'
import { SCHOOL_LAB_OFFSET } from '../../core/learningActivities'
import { SchoolActivityScene } from './SchoolActivityScene'
import { rect, label } from '../drawing'
import { tapTarget, holdTarget } from '../interactions'
import {
  buildingActions,
  taxiPose,
  basketballPose,
  cameraCarPose,
  type SceneAction,
} from '../../core/sceneActivities'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'
export class BuildingActivityScene extends Container {
  private object = new Container()
  private overlay = new Graphics()
  private objectGlow = new Graphics()
  private telemetry = new Container()
  private telemetryPanel = new Graphics()
  private telemetryText: Text
  private holdHint?: Text
  private previousCompletions = 0
  private telemetryUntil = 0
  private net?: Graphics
  private score?: Text
  private ball?: Graphics
  private taxi?: Container
  private passenger?: Container
  private mail = new Graphics()
  private car?: Container
  private cart?: Container
  private school?: SchoolActivityScene
  private action: SceneAction
  constructor(
    private id: string,
    private state: ActivitySystem,
    private locale: string,
    private onInteraction: () => void = () => {},
  ) {
    super()
    this.action = buildingActions[id]!
    this.telemetry.eventMode = 'none'
    this.telemetryPanel
      .roundRect(-114, -27, 228, 54, 7)
      .fill({ color: 0x173c34, alpha: 0.94 })
      .stroke({ color: 0xe0d49e, width: 1.5, alpha: 0.82 })
    this.telemetry.addChild(this.telemetryPanel)
    this.telemetryText = label(this.telemetry, '', 0, -16, 12, 0xf4ecd5, 209)
    this.telemetryText.anchor.x = 0.5
    this.telemetryText.style.align = 'center'
    if (this.action === 'camera') {
      this.holdHint = label(
        this.telemetry,
        locale === 'nl'
          ? 'Houd vast: bouw snelheid op\nLaat los om te rijden · limiet 50'
          : 'Hold to build speed\nRelease to drive · limit 50',
        0,
        -14,
        12,
        0x244c3d,
        235,
      )
      this.holdHint.anchor.x = 0.5
      this.holdHint.style.align = 'center'
      this.holdHint.style.stroke = { color: 0xf5f0de, width: 2 }
      this.telemetryText.y = -46
      this.telemetryText.style.fontSize = 20
      this.telemetryText.style.fontWeight = '600'
    }
    this.telemetry.visible = false
    const start = () => {
      if (state.trigger(id, this.action)) this.onInteraction()
    }
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
      rect(this, 213, -151, 5, 151, 0x68846d)
      rect(this, 182, -159, 55, 36, 0xc6c8a5)
      rect(this, 191, -151, 25, 18, 0xaab89b)
      this.addChild(
        new Graphics()
          .ellipse(200, -129, 20, 4)
          .stroke({ width: 3, color: 0xb8845f })
          .moveTo(184, -126)
          .lineTo(191, -105)
          .lineTo(210, -105)
          .lineTo(217, -126)
          .stroke({ width: 1, color: 0xdbe0bd }),
      )
      this.net = new Graphics()
      this.addChild(this.net)
      rect(this, 168, -202, 83, 30, 0x244638)
      this.score = label(this, '00', 210, -198, 19, 0xf2d995, 70)
      this.score.anchor.x = 0.5
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
      holdTarget(
        this.ball,
        () => {
          const started = state.beginCharge(id, 'arc')
          if (started) {
            state.charges[id]!.origin = { x: this.ball!.x, y: this.ball!.y }
            this.onInteraction()
          }
          return started
        },
        () => state.releaseCharge(id, this.action),
        new Rectangle(-44, -44, 88, 88),
        () => state.cancelCharge(id),
        (deltaY) => {
          const charge = state.charges[id]
          if (charge?.holding) charge.power = Math.max(0, Math.min(1, charge.power - deltaY / 160))
        },
      )
    } else if (this.action === 'departure') {
      rect(this, -260, -4, 590, 15, 0x71897a)
      for (let x = -240; x < 320; x += 65) rect(this, x, 1, 29, 2, 0xdedcba)
      const pickupSign = new Container()
      rect(pickupSign, -101, -62, 4, 62, 0x527365)
      rect(pickupSign, -132, -88, 67, 30, 0x345e56)
      label(pickupSign, 'PICKUP', -125, -80, 11, 0xf5e6bd, 60)
      tapTarget(pickupSign, start, new Rectangle(-143, -105, 88, 105))
      this.addChild(pickupSign)
      this.taxi = this.makeCar(0xd7b958)
      rect(this.taxi, -8, -66, 37, 10, 0xf4e6b6)
      label(this.taxi, 'TAXI', -4, -66, 8, 0x29483d, 30)
      this.object.addChild(this.taxi)
      this.passenger = new Container()
      this.passenger.addChild(new Graphics().circle(0, -51, 7).fill(0xc8a37e))
      rect(this.passenger, -7, -43, 14, 26, 0x426e72)
      for (const x of [-6, 3]) rect(this.passenger, x, -17, 4, 17, 0x314f46)
      rect(this.passenger, -24, -24, 14, 24, 0xb88e60)
      this.object.addChild(this.passenger)
      tapTarget(this.taxi, start, new Rectangle(-86, -76, 175, 86))
    } else if (this.action === 'camera') {
      rect(this, -280, -12, 620, 20, 0x5b7368)
      for (let x = -260; x < 320; x += 72) rect(this, x, -3, 35, 2, 0xc4c6a5)
      rect(this, 302, -126, 7, 141, 0x6b7d6d)
      rect(this, 288, -142, 36, 27, 0x3d5b51)
      rect(this, 294, -136, 14, 12, 0x8daf9d)
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
      rect(this, -190, -75, 6, 75, 0x5b7561)
      this.addChild(new Graphics().roundRect(-214, -111, 57, 43, 5).fill(0x436f72))
      rect(this, -205, -95, 38, 4, 0x203f37)
      label(this, 'APPJECTION', -210, -86, 7, 0xf5edd3, 50)
      this.addChild(this.mail)
      this.car = car
      this.object.addChild(car)
      holdTarget(
        car,
        () => {
          const started = state.beginCharge(id)
          if (started) this.onInteraction()
          return started
        },
        () => state.releaseCharge(id, this.action),
        new Rectangle(-86, -66, 175, 76),
        () => state.cancelCharge(id),
      )
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
    } else {
      this.school = new SchoolActivityScene(
        this.action as 'circuit' | 'compile',
        state,
        locale,
        this.onInteraction,
      )
      this.school.x = SCHOOL_LAB_OFFSET
      this.addChild(this.school)
    }
    this.objectGlow.eventMode = 'none'
    this.addChild(this.object, this.overlay, this.objectGlow, this.telemetry)
    if (this.net) this.addChild(this.net)
  }
  private makeCar(color: number) {
    const car = new Container()
    car.addChild(
      new Graphics()
        .poly([-62, -17, -57, -35, -29, -37, -12, -57, 34, -57, 54, -37, 75, -30, 78, -16])
        .fill(color)
        .poly([-6, -53, 30, -53, 45, -37, -18, -37])
        .fill(0xb6d0c2),
    )
    for (const x of [-36, 49])
      car.addChild(
        new Graphics().circle(x, -14, 12).fill(0x29463f).circle(x, -14, 5).fill(0xa2b09a),
      )
    rect(car, 66, -31, 10, 5, 0xf5e2aa)
    return car
  }
  /** Measurements follow the moving prop, independently of first-use tooltips. */
  private updateTelemetry(
    frame: WorldFrame,
    record: ActivitySystem['actions'][string] | undefined,
  ) {
    const charge = this.state.charges[this.id]
    const completed = record?.completed ?? 0
    if (completed > this.previousCompletions) this.telemetryUntil = frame.time + 2600
    this.previousCompletions = completed
    const active =
      this.action === 'basketball'
        ? !!charge?.holding || !!record?.running || frame.time < this.telemetryUntil
        : this.action === 'camera' && !!charge?.holding
    this.telemetry.visible = active && frame.visit.phase === 'outside' && !frame.paused
    if (!this.telemetry.visible) return
    const nl = this.locale === 'nl'
    let message: string
    let x: number
    let y: number
    if (this.action === 'camera') {
      const speed = Math.round(10 + (charge?.holding ? charge.power : (record?.power ?? 0.38)) * 80)
      message = `${speed} km/h`
      x = this.car?.x ?? 70
      y = -145
      this.telemetryText.style.fill = 0x244c3d
      this.telemetryText.style.stroke = { color: 0xf5f0de, width: 3 }
      this.telemetryPanel
        .clear()
        .roundRect(-100, 22, 200, 6, 3)
        .fill(0xb1bda4)
        .roundRect(-100, 22, Math.max(1, charge!.power * 200), 6, 3)
        .fill(speed > 50 ? 0xb37d57 : 0x4d8065)
        .rect(0, 18, 2, 14)
        .fill(0x315b47)
    } else if (this.action === 'basketball') {
      const power = charge?.holding ? charge.power : (record?.power ?? 0)
      message = charge?.holding
        ? `${nl ? 'Booghoogte' : 'Shot arc'}: ${Math.round(power * 100)}%\n${nl ? 'Laat los om te schieten' : 'Release to shoot'}`
        : record?.running
          ? nl
            ? 'Bal onderweg'
            : 'Ball in flight'
          : record?.outcome === 'success'
            ? nl
              ? 'Raak!'
              : 'Scored!'
            : nl
              ? 'Mis · probeer opnieuw'
              : 'Missed · try again'
      x = this.ball?.x ?? 65
      y = Math.min(-260, (this.ball?.y ?? -10) - 82)
    } else {
      this.telemetry.visible = false
      return
    }
    this.telemetryText.text = message
    this.telemetry.position.set(x, y)
  }
  /** Keep the prop-following readout visible without clipping on narrow screens. */
  constrainTelemetry(entryX: number, camera: number, scale: number, screenWidth: number) {
    if (!this.telemetry.visible) return
    const screenX = (entryX + this.telemetry.x - camera) * scale
    // Don't leave a floating label when the vehicle itself is far offscreen.
    if (screenX < -70 || screenX > screenWidth + 70) {
      this.telemetry.visible = false
      return
    }
    const half = Math.min(screenWidth / 2, 114 * scale + 10)
    const safeX = Math.max(half, Math.min(screenWidth - half, screenX))
    this.telemetry.x += (safeX - screenX) / scale
  }
  getTelemetryScreenBounds(entryX: number, camera: number, scale: number) {
    if (!this.telemetry.visible) return null
    const x = (entryX + this.telemetry.x - camera) * scale
    return { left: x - 114 * scale, right: x + 114 * scale }
  }
  getPropState() {
    const prop = this.taxi ?? this.car
    return prop
      ? { x: prop.x, y: prop.y, alpha: prop.alpha, interactive: prop.eventMode === 'static' }
      : null
  }
  getTelemetry(): string {
    return this.telemetry.visible ? this.telemetryText.text : ''
  }
  /** The real prop silhouette glows; no detached targeting ellipse. */
  setInteractionGlow(active: boolean, time: number, reduced: boolean) {
    this.school?.setInteractionGlow(active, time, reduced)
    const glow = this.objectGlow
    glow.clear()
    glow.position.set(0, 0)
    glow.scale.set(1)
    glow.rotation = 0
    if (
      !active ||
      this.school ||
      (this.taxi && (this.taxi.alpha < 0.1 || this.taxi.eventMode === 'none')) ||
      (this.car && this.car.alpha < 0.1)
    )
      return
    const pulse = reduced ? 0.5 : (1 + Math.sin(time / 480)) * 0.5
    const style = { color: 0xffe6aa, width: 3.1, alpha: 0.69 + pulse * 0.28 }
    const halo = { color: 0xffdd99, width: 10, alpha: 0.11 + pulse * 0.12 }
    if (this.ball) {
      glow
        .circle(this.ball.x, this.ball.y, 11)
        .stroke(halo)
        .circle(this.ball.x, this.ball.y, 11)
        .stroke(style)
    } else if (this.car || this.taxi) {
      glow.position.copyFrom((this.car ?? this.taxi)!.position)
      const outline = [-62, -17, -57, -35, -29, -37, -12, -57, 34, -57, 54, -37, 75, -30, 78, -16]
      glow.poly(outline).stroke(halo).poly(outline).stroke(style)
    } else if (this.cart) {
      const bellShape = () =>
        glow.moveTo(170, -59).bezierCurveTo(171, -77, 193, -77, 194, -59).lineTo(170, -59)
      bellShape().stroke(halo)
      bellShape().stroke(style).rect(168, -56, 28, 4).fill({ color: 0xffe3aa, alpha: 0.17 })
    }
  }
  /** Visible object position, in building-local world coordinates. */
  focusPoint(): { x: number; y: number } | undefined {
    if (this.ball) return { x: this.ball.x, y: this.ball.y }
    if (this.taxi) return { x: 100, y: -35 }
    if (this.car) return { x: this.car.x, y: this.car.y - 35 }
    if (this.cart) return { x: 182, y: -62 } // The bell stays put while luggage moves.
    return undefined
  }
  update(frame: WorldFrame, entryX: number, reduced: boolean, ground = 0) {
    const distanceToTrigger = Math.abs(frame.motion.x - entryX - (this.car ? 225 : 100))
    if (
      (this.taxi || this.car) &&
      distanceToTrigger < 230 &&
      !frame.paused &&
      frame.visit.phase === 'outside'
    ) {
      this.state.autoPlayOnce(this.id, this.action)
    }
    const record = this.state.actions[this.id],
      running = record?.running ?? false,
      age = record?.age ?? 0
    this.overlay.clear()
    const charge = this.state.charges[this.id]
    const charging = !!charge?.holding
    if (this.ball) {
      const pickup = charging ? 1 : 0
      const p = running
        ? basketballPose(age, record?.power, record?.origin)
        : {
            x: 65 + (frame.motion.x - entryX + frame.facing * 14 - 65) * pickup,
            y: -10 + (frame.motion.y + ground - (frame.motion.grounded ? 40 : 75) + 10) * pickup,
          }
      if (charging) charge.origin = { x: p.x, y: p.y }
      this.ball.position.set(p.x, p.y)
      this.ball.rotation = running ? age * 5 : 0
      this.score!.text = String(record?.successes ?? 0).padStart(2, '0')
      const swish =
        running && age > 1.1 && age < 1.6 && record?.outcome === 'success' && !reduced
          ? Math.sin((age - 1.1) * Math.PI * 6) * 3
          : 0
      this.net!.clear()
        .moveTo(180, -129)
        .bezierCurveTo(180, -123, 220, -123, 220, -129)
        .stroke({ width: 3, color: 0xb8845f })
      for (let i = 0; i < 6; i++) {
        const x = 182 + i * 7
        this.net!.moveTo(x, -126)
          .lineTo(190 + i * 3 + swish, -104)
          .stroke({ width: 1.3, color: 0xe8e5c5 })
      }
      this.net!.moveTo(187, -114)
        .lineTo(214 + swish, -114)
        .stroke({ width: 1, color: 0xe8e5c5 })
      if (charging)
        for (let i = 0; i < 16; i++) {
          const aim = basketballPose((i / 16) * 1.1, charge.power, charge.origin)
          this.overlay.circle(aim.x, aim.y, 1.6).fill({
            color: charge.power >= 0.52 && charge.power <= 0.78 ? 0xe4dda7 : 0xc4c9b1,
            alpha: 0.65,
          })
        }
    } else if (this.taxi) {
      const p = taxiPose(age)
      this.taxi.position.set(running ? p.x : 100, -5)
      this.taxi.alpha = running ? p.alpha : 1
      this.taxi.eventMode = running ? 'none' : 'static'
      this.taxi.cursor = running ? 'default' : 'pointer'
      this.passenger!.position.set(running ? p.passengerX : 30, 0)
      this.passenger!.alpha = running ? p.passengerAlpha : 1
      if (running && age > 1.4 && age < 2.5)
        this.overlay
          .poly([92, -42, 72, -30, 72, -9, 92, -16])
          .fill(0xd7b958)
          .poly([89, -38, 76, -29, 76, -20, 89, -25])
          .fill(0xb6d0c2)
    } else if (this.car) {
      const speed = Math.round(10 + (record?.power ?? 0.38) * 80)
      const p = running ? cameraCarPose(age, speed) : { x: 225, flash: false }
      this.car.position.set(p.x, -5)
      this.car.eventMode = running ? 'none' : 'static'
      this.car.alpha = running ? Math.min(1, Math.max(0, (4 - age) / 1.1)) : 1
      this.mail.clear()
      if (record?.outcome === 'ticket' && age > 0.65 && age < 1.5) {
        const lift = (age - 0.65) * 50
        this.mail.rect(293, -155 - lift, 25, 34).fill(0xf4ebd1)
        for (let i = 0; i < 4; i++) this.mail.rect(297, -148 - lift + i * 6, 17, 2).fill(0x8a866a)
      }
      if (record?.outcome === 'ticket' && age > 1.5 && (running || record.completed)) {
        const t = Math.min(1, (age - 1.5) / 3)
        const mx = 305 + (-186 - 305) * t,
          my = -142 + 56 * t - Math.sin(t * Math.PI) * 100
        this.mail
          .roundRect(mx - 16, my - 11, 32, 22, 2)
          .fill(0xf4ebd1)
          .stroke({ width: 1, color: 0x8a866a })
          .moveTo(mx - 16, my - 11)
          .lineTo(mx, my + 1)
          .lineTo(mx + 16, my - 11)
          .stroke({ width: 1, color: 0x8a866a })
        if (t === 1) this.mail.alpha = Math.max(0, 1 - (age - 4.5))
        else this.mail.alpha = 1
      }
      if (p.flash)
        this.overlay.rect(278, -150, 55, 44).fill({ color: 0xfff2c7, alpha: reduced ? 0.3 : 0.9 })
    } else if (this.cart) {
      this.cart.position.set(running ? 210 - Math.min(1, age / 3) * 210 : 210, 0)
      this.cart.alpha = running && age > 3 ? Math.max(0, 1 - (age - 3)) : 1
    } else {
      this.school?.update(frame, reduced)
    }
    // Feedback now belongs to the actual object via WorldInteractionCue. Never
    // draw a second huge rectangular panel across the building facade.
    this.updateTelemetry(frame, record)
  }
}
