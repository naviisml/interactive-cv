import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import { SCHOOL_LAB_OFFSET } from '../../core/learningActivities'
import { SchoolActivityScene } from './SchoolActivityScene'
import { AircraftSprite } from '../sprites/AircraftSprite'
import { rect, label } from '../drawing'
import { tapTarget, holdTarget } from '../interactions'
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
  private objectGlow = new Graphics()
  private status: Text
  private statusPanel = new Graphics()
  private telemetry = new Container()
  private telemetryPanel = new Graphics()
  private telemetryText: Text
  private previousCompletions = 0
  private telemetryUntil = 0
  private net?: Graphics
  private score?: Text
  private ball?: Graphics
  private plane?: AircraftSprite
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
    // Action feedback lives above the architecture, never across its signs.
    this.status = label(this, '', 155, -278, 14, 0x274b3d, 258)
    this.telemetry.eventMode = 'none'
    this.telemetryPanel.roundRect(-114, -27, 228, 54, 7)
      .fill({ color: 0x173c34, alpha: 0.94 })
      .stroke({ color: 0xe0d49e, width: 1.5, alpha: 0.82 })
    this.telemetry.addChild(this.telemetryPanel)
    this.telemetryText = label(this.telemetry, '', 0, -16, 12, 0xf4ecd5, 209)
    this.telemetryText.anchor.x = 0.5
    this.telemetryText.style.align = 'center'
    this.telemetry.visible = false
    this.status.anchor.x = 0.5
    const feedbackY = this.action === 'luggage' ? -150 : this.action === 'departure' ? -245 : -278
    this.status.y = feedbackY
    this.statusPanel.y = feedbackY + 278
    this.status.visible = false
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
          const started = state.beginCharge(id)
          if (started) {
            state.charges[id]!.origin = { x: this.ball!.x, y: this.ball!.y }
            this.onInteraction()
          }
          return started
        },
        () => state.releaseCharge(id, this.action),
        new Rectangle(-44, -44, 88, 88),
        () => state.cancelCharge(id),
      )
    } else if (this.action === 'departure') {
      rect(this, -260, -4, 590, 15, 0x71897a)
      for (let x = -240; x < 320; x += 65) rect(this, x, 1, 29, 2, 0xdedcba)
      this.plane = new AircraftSprite()
      this.object.addChild(this.plane)
      holdTarget(
        this.plane,
        () => {
          const started = state.beginCharge(id)
          if (started) this.onInteraction()
          return started
        },
        () => state.releaseCharge(id, this.action),
        new Rectangle(-110, -40, 220, 90),
        () => state.cancelCharge(id),
      )
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
      this.school = new SchoolActivityScene(this.action as 'circuit' | 'compile', state, locale, this.onInteraction)
      this.school.x = SCHOOL_LAB_OFFSET
      this.addChild(this.school)
    }
    this.objectGlow.eventMode = 'none'
    this.addChild(this.object, this.overlay, this.statusPanel, this.status, this.objectGlow, this.telemetry)
  }
  /** Measurements follow the moving prop, independently of first-use tooltips. */
  private updateTelemetry(frame: WorldFrame, record: ActivitySystem['actions'][string] | undefined) {
    const charge = this.state.charges[this.id]
    const completed = record?.completed ?? 0
    if (completed > this.previousCompletions) this.telemetryUntil = frame.time + 2600
    this.previousCompletions = completed
    const active = !!charge?.holding || !!record?.running || frame.time < this.telemetryUntil
    this.telemetry.visible = active && frame.visit.phase === 'outside' && !frame.paused
    if (!this.telemetry.visible) return
    const nl = this.locale === 'nl'
    let message = ''
    let x = 0
    let y = -120
    if (this.action === 'camera') {
      const speed = Math.round(10 + (charge?.holding ? charge.power : record?.power ?? 0.38) * 80)
      const phase = charge?.holding
        ? nl ? 'Laat los om te rijden' : 'Release to drive'
        : record?.running
          ? nl ? 'Testrit bezig' : 'Test run'
          : record?.outcome === 'ticket'
            ? nl ? 'Geflitst' : 'Speeding ticket'
            : record?.outcome === 'success'
              ? nl ? 'Binnen limiet' : 'Within the limit'
              : nl ? 'Probeer opnieuw' : 'Try again'
      message = `${nl ? 'Snelheid' : 'Speed'}: ${speed} km/h\n${phase}`
      x = this.car?.x ?? 70
      y = -123
    } else if (this.action === 'departure') {
      const power = charge?.holding ? charge.power : record?.power ?? 0
      // Throttle is modeled; speed is a clearly labeled simulated estimate.
      const simulatedSpeed = Math.round(power * 260)
      const phase = charge?.holding
        ? nl ? 'Vermogen opbouwen' : 'Building throttle'
        : record?.running
          ? record?.outcome === 'success'
            ? (nl ? 'Stijgt op' : 'Taking off')
            : (nl ? 'Te weinig vermogen' : 'Insufficient throttle')
          : record?.outcome === 'success'
            ? nl ? 'Opgestegen' : 'Airborne'
            : nl ? 'Niet opgestegen' : 'No take-off'
      message = `${nl ? 'Sim. snelheid' : 'Sim. speed'}: ${simulatedSpeed} km/h · ${Math.round(power * 100)}%\n${phase}`
      x = this.plane?.x ?? 130
      y = (this.plane?.y ?? -22) - 102
    } else if (this.action === 'basketball') {
      const power = charge?.holding ? charge.power : record?.power ?? 0
      message = charge?.holding
        ? `${nl ? 'Worpsterkte' : 'Shot power'}: ${Math.round(power * 100)}%\n${nl ? 'Laat los om te schieten' : 'Release to shoot'}`
        : record?.running
          ? nl ? 'Bal onderweg' : 'Ball in flight'
          : record?.outcome === 'success'
            ? nl ? 'Raak!' : 'Scored!'
            : nl ? 'Mis · probeer opnieuw' : 'Missed · try again'
      x = this.ball?.x ?? 65
      y = Math.min(-87, (this.ball?.y ?? -10) - 82)
    } else if (this.action === 'luggage') {
      message = record?.running
        ? nl ? 'Bagage onderweg…' : 'Luggage on its way…'
        : nl ? 'Bagage bezorgd' : 'Luggage delivered'
      x = 182
      y = -133
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
    if (!active || this.school) return
    const pulse = reduced ? 0.5 : (1 + Math.sin(time / 480)) * 0.5
    const style = { color: 0xffe6aa, width: 3.1, alpha: 0.69 + pulse * 0.28 }
    const halo = { color: 0xffdd99, width: 10, alpha: 0.11 + pulse * 0.12 }
    if (this.ball) {
      glow.circle(this.ball.x, this.ball.y, 11).stroke(halo)
        .circle(this.ball.x, this.ball.y, 11).stroke(style)
    } else if (this.plane) {
      glow.position.copyFrom(this.plane.position)
      glow.scale.set(this.plane.scale.x)
      glow.rotation = this.plane.rotation
      const outline = [
        -103, 0, -87, 0, -93, -31, -79, -31, -58, -4,
        66, -4, 86, 1, 103, 10, 92, 15, -83, 15, -106, 7,
      ]
      glow.poly(outline).stroke(halo).poly(outline).stroke(style)
    } else if (this.car) {
      glow.position.copyFrom(this.car.position)
      const outline = [-62, -17, -57, -35, -29, -37, -12, -57, 34, -57, 54, -37, 75, -30, 78, -16]
      glow.poly(outline).stroke(halo).poly(outline).stroke(style)
    } else if (this.cart) {
      const bellShape = () => glow.moveTo(170, -59)
        .bezierCurveTo(171, -77, 193, -77, 194, -59)
        .lineTo(170, -59)
      bellShape().stroke(halo)
      bellShape().stroke(style)
        .rect(168, -56, 28, 4)
        .fill({ color: 0xffe3aa, alpha: 0.17 })
    }
  }
  /** Visible object position, in building-local world coordinates. */
  focusPoint(): { x: number; y: number } | undefined {
    if (this.ball) return { x: this.ball.x, y: this.ball.y }
    if (this.plane) return { x: this.plane.x, y: this.plane.y - 8 }
    if (this.car) return { x: this.car.x, y: this.car.y - 35 }
    if (this.cart) return { x: 182, y: -62 } // The bell stays put while luggage moves.
    return undefined
  }
  update(frame: WorldFrame, entryX: number, reduced: boolean, ground = 0) {
    const record = this.state.actions[this.id],
      running = record?.running ?? false,
      age = record?.age ?? 0,
      nl = this.locale === 'nl'
    this.overlay.clear()
    this.statusPanel.clear()
    const charge = this.state.charges[this.id]
    const charging = !!charge?.holding
    const distance = Math.abs(frame.motion.x - entryX)
    const showStatus = !frame.navigating && frame.visit.phase === 'outside' && distance < 310
    const opacity = Math.min(1, Math.max(0, (310 - distance) / 85))
    this.status.visible = showStatus
    this.status.alpha = opacity
    this.statusPanel.alpha = opacity
    if (showStatus) {
      // The label reads like an architectural annotation, not a second HUD.
      this.statusPanel
        .roundRect(18, -288, 280, 64, 5)
        .fill({ color: 0x19392f, alpha: 0.17 })
        .roundRect(14, -292, 280, 64, 5)
        .fill({ color: 0xf4f0df, alpha: 0.97 })
        .stroke({ width: 1.5, color: 0x8da78f, alpha: 0.9 })
      if (charging) {
        this.statusPanel
          .roundRect(28, -241, 250, 5, 2)
          .fill(0xc4ceba)
          .roundRect(28, -241, 250 * charge.power, 5, 2)
          .fill(charge.power >= 0.8 ? 0xb97758 : 0x4d8a66)
        if (this.action === 'basketball')
          for (const threshold of [0.52, 0.78])
            this.statusPanel.rect(28 + 250 * threshold, -244, 2, 11).fill(0x24483a)
      }
    }
    if (this.ball) {
      const pickup = charging ? Math.min(1, (charge.power * 1.75) / 0.18) : 0
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
      this.status.text = charging
        ? nl
          ? 'Houd vast… laat los in de groene zone'
          : 'Hold… release in the target zone'
        : running
          ? nl
            ? 'Schot onderweg…'
            : 'Shot in flight…'
          : record?.completed
            ? `${record.outcome === 'success' ? (nl ? 'Raak!' : 'Basket!') : nl ? 'Gemist · probeer opnieuw' : 'Missed · try again'}  ${nl ? 'Raak' : 'Scored'}: ${record.successes ?? 0}`
            : nl
              ? 'Houd de bal vast om te mikken'
              : 'Hold the ball to aim and release'
    } else if (this.plane) {
      const success = record?.outcome === 'success'
      const p = running
        ? success
          ? aircraftPose(age)
          : { x: 130 + Math.min(age, 2) * 30, y: -22, angle: 0, scale: 1 }
        : { x: 130, y: -22, angle: 0, scale: 1 }
      this.plane.position.set(p.x, p.y)
      this.plane.angle = reduced ? 0 : p.angle
      this.plane.scale.set(p.scale * 0.95)
      this.plane.visible = true
      this.status.text = charging
        ? `${nl ? 'Motorvermogen' : 'Engine power'}: ${Math.round(charge.power * 100)}% — ${nl ? 'houd ingedrukt' : 'keep holding'}`
        : running
          ? success
            ? age < 1.4
              ? nl
                ? 'Versnelt over de baan…'
                : 'Accelerating down the runway…'
              : nl
                ? 'Opgestegen!'
                : 'Airborne!'
            : nl
              ? 'Niet genoeg snelheid om op te stijgen'
              : 'Not enough speed for take-off'
          : record?.completed
            ? success
              ? nl
                ? 'Vlucht geslaagd · opnieuw?'
                : 'Take-off successful · retry?'
              : nl
                ? 'Te weinig vermogen · opnieuw?'
                : 'Too little power · retry?'
            : nl
              ? 'Houd vliegtuig vast om vermogen op te bouwen'
              : 'Press and hold the plane to build speed'
    } else if (this.car) {
      const speed = Math.round(10 + (record?.power ?? 0.38) * 80)
      const p = running ? cameraCarPose(age, speed) : { x: 70, flash: false }
      this.car.position.set(p.x, -5)
      if (p.flash)
        this.overlay.rect(123, -150, 55, 44).fill({ color: 0xfff2c7, alpha: reduced ? 0.3 : 0.9 })
      this.status.text = charging
        ? `${nl ? 'Snelheid' : 'Speed'}: ${Math.round(10 + charge.power * 80)} km/h — ${nl ? 'laat los om te rijden' : 'release to drive'}`
        : running
          ? `${speed} km/h — ${p.flash ? (nl ? 'Geflitst!' : 'Speed camera flash!') : nl ? 'Passage…' : 'Passing camera…'}`
          : record?.completed
            ? record.outcome === 'success'
              ? nl
                ? 'Binnen de limiet · opnieuw?'
                : 'Within the limit · retry?'
              : record.outcome === 'ticket'
                ? nl
                  ? 'Te hard gereden · probeer opnieuw'
                  : 'Too fast · try again'
                : nl
                  ? 'Te langzaam · houd langer vast'
                  : 'Too slow · press longer'
            : nl
              ? 'Houd de auto vast, laat los voor 50 km/h'
              : 'Press and hold the car, release near 50 km/h'
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
      this.school?.update(frame, reduced)
    }
    // Feedback now belongs to the actual object via WorldInteractionCue. Never
    // draw a second huge rectangular panel across the building facade.
    this.status.visible = false
    this.statusPanel.visible = false
    this.updateTelemetry(frame, record)
  }
}
