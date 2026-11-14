import type { Texture, Text } from 'pixi.js';
import { Assets, Container, Graphics, Rectangle, Sprite } from 'pixi.js'
import { skillLogos, skillGroups } from '../../../content/skills'
import { skillDecks } from '../../core/sceneActivities'
import { pipelineSteps } from '../../core/learningActivities'
import { tapTarget } from '../interactions'
import { terrainHeight, type TerrainPoint } from '../../core/physics'
import { label, rect } from '../drawing'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'

/** A working line: source → build → browser → workers. The road is the interaction. */
export class SkillsRoadScene extends Container {
  private pipelineChangeAt = 0
  private pipelinePrevious = -1
  private selectedLogos: { index: number; at: number }[] = []
  private stations: {
    node: Container
    x: number
    machine: Graphics
    statusBackdrop: Graphics
    status: Text
    pipelineControls: Graphics[]
    glow: Graphics
    logos: Container[]
  }[] = []
  constructor(
    private activity: ActivitySystem,
    private collected: (name: string, count: number) => void,
    private locale: string,
    private onInteraction: (index: number) => void = () => {},
  ) {
    super()
    skillGroups.forEach((group, i) => {
      const node = new Container(),
        x = skillDecks[i]!.center
      node.x = x
      // Grounded workshop roofs and bench, with machines instead of floating menus.
      rect(node, -160, -265, 320, 8, 0x81977a)
      rect(node, -156, -257, 312, 5, 0xb4b994)
      for (const px of [-147, 145]) rect(node, px, -257, 5, 257, 0x637f68)
      const title = label(
        node,
        group.title[this.locale === 'nl' ? 'nl' : 'en'],
        0,
        -292,
        18,
        0x25483d,
        310,
      )
      title.anchor.x = 0.5
      rect(node, -137, -67, 274, 8, 0xbbad81)
      for (const px of [-128, 122]) rect(node, px, -59, 7, 59, 0x637b60)
      const machine = new Graphics()
      node.addChild(machine)
      // Status is a readable instrument panel, independent of the forest behind it.
      const statusBackdrop = new Graphics()
      node.addChild(statusBackdrop)
      const status = label(node, '', 0, -240, 12, 0x274c3e, 276)
      status.anchor.x = 0.5
      // This is the machine's own instrument panel, not a floating tooltip.
      // It stays visible so the queue, deployed code and live page have readable state.
      statusBackdrop.visible = true
      status.visible = true
      status.style.fontWeight = '600'
      const pipelineControls: Graphics[] = []
      if (i === 0) {
        pipelineSteps.forEach((step, index) => {
          const control = new Container()
          control.position.set(-101 + index * 67, -104)
          const background = new Graphics()
          control.addChild(background)
          const text = label(control, step.toUpperCase(), 0, 3, 9, 0xf8f4df, 62)
          text.anchor.x = 0.5
          tapTarget(
            control,
            () => {
              this.activate(0)
              this.activity.playPipelineStep(step)
            },
            new Rectangle(-32, -5, 64, 48),
          )
          node.addChild(control)
          pipelineControls.push(background)
        })
      }
      // Original CV logos hang above the machine and feed into it on activation.
      const logos = group.ids.map((id, j) => {
        const logo = skillLogos.find((l) => l.id === id)!,
          badge = new Container()
        const cols = group.ids.length > 6 ? 4 : 3,
          row = Math.floor(j / cols),
          count = Math.min(cols, group.ids.length - row * cols)
        badge.position.set(((j % cols) - (count - 1) / 2) * 66, -199 + row * 54)
        badge.addChild(new Graphics().circle(0, 0, 21).fill({ color: 0xf6edcf, alpha: 0.8 }))
        const name = label(badge, logo.name.replace(' / React Native', ''), 0, 22, 9, 0x244b3f, 65)
        name.anchor.x = 0.5
        void Assets.load<Texture>(logo.asset)
          .then((texture) => {
            if (this.destroyed) return
            const sprite = new Sprite(texture)
            sprite.anchor.set(0.5)
            sprite.scale.set(Math.min(29 / texture.width, 29 / texture.height))
            badge.addChild(sprite)
          })
          .catch(() => {})
        tapTarget(
          badge,
          () => {
            this.activate(i)
            this.selectedLogos[i] = { index: j, at: performance.now() }
            if (i === 1) {
              if (id === 'html') this.activity.web.records = 0
              else if (id === 'css') this.activity.web.theme = (this.activity.web.theme + 1) % 3
              else this.activity.web.records = (this.activity.web.records % 3) + 1
            }
          },
          new Rectangle(-29, -26, 58, 55),
        )
        node.addChild(badge)
        return badge
      })
      // Walk across the illuminated pressure plate, or tap the machine.
      const plate = new Graphics()
        .roundRect(-42, -9, 84, 9, 3)
        .fill(0xa9b584)
        .rect(-33, -13, 66, 4)
        .fill(0xdfd4a0)
      node.addChild(plate)
      tapTarget(plate, () => this.activate(i), new Rectangle(-55, -42, 110, 44))
      if (i === 0) {
        // The conveyor itself is a replayable stepper in addition to the four keys.
        tapTarget(machine, () => {
          this.activate(0)
          const step = pipelineSteps[this.activity.pipeline.completed] ?? pipelineSteps[0]!
          this.activity.playPipelineStep(step)
        }, new Rectangle(-131, -61, 262, 24))
      } else if (i === 1) {
        // A click on the actual browser refreshes both theme and API cards.
        tapTarget(machine, () => {
          this.activate(1)
          this.activity.setWebTheme((this.activity.web.theme + 1) % 3)
          this.activity.setWebRecords((this.activity.web.records % 3) + 1)
        }, new Rectangle(-119, -104, 238, 67))
      } else {
        // Real, visible, selectable server racks. The rack hit area must match
        // the painted rack rather than an invisible offset target.
        for (let worker = 0; worker < 3; worker++) {
          const rack = new Container()
          rack.x = -120 + worker * 86
          const number = label(rack, `${worker + 1}`, 34, -72, 12, 0xf7efc9, 42)
          number.anchor.x = 0.5
          tapTarget(
            rack,
            () => {
              this.activate(i)
              this.activity.setWorkers(worker + 1)
            },
            new Rectangle(0, -106, 68, 65),
          )
          node.addChild(rack)
        }
        // The packet belt itself cycles the deployment size on tap.
        tapTarget(machine, () => {
          this.activate(2)
          this.activity.setWorkers((this.activity.cloud.workers % 3) + 1)
        }, new Rectangle(-130, -39, 260, 36))
      }
      const glow = new Graphics()
      glow.eventMode = 'none'
      node.addChild(glow)
      this.addChild(node)
      this.stations.push({
        node,
        x,
        machine,
        statusBackdrop,
        status,
        pipelineControls,
        glow,
        logos,
      })
    })
  }
  /** Expose the same instrument readouts painted in Pixi for browser QA. */
  getReadouts() {
    return this.stations.map((station, index) => ({
      id: skillGroups[index]!.id,
      visible: station.status.visible && station.statusBackdrop.visible,
      text: station.status.text,
    }))
  }
  activate(index: number) {
    const group = skillGroups[index]
    if (!group) return
    this.onInteraction(index)
    if (!this.activity.activateSkillGroup(index)) return
    this.collected(
      group.title[this.locale === 'nl' ? 'nl' : 'en'],
      this.activity.exploredSkills.length,
    )
  }
  /** Light the workstation frame, not a hovering ring or another badge. */
  setInteractionGlow(index: number | undefined, time: number, reduced: boolean) {
    for (const [i, station] of this.stations.entries()) {
      station.glow.clear()
      if (i !== index) continue
      const pulse = reduced ? 0.5 : (1 + Math.sin(time / 520)) * 0.5
      const drawFrame = () =>
        station.glow
          .moveTo(-160, -265)
          .lineTo(160, -265)
          .moveTo(-147, -257)
          .lineTo(-147, 0)
          .moveTo(150, -257)
          .lineTo(150, 0)
          .moveTo(-137, -65)
          .lineTo(137, -65)
      drawFrame().stroke({ color: 0xf8dc9d, width: 10, alpha: 0.1 + pulse * 0.1 })
      drawFrame().stroke({ color: 0xffe9b3, width: 3, alpha: 0.68 + pulse * 0.21 })
    }
  }
  update(frame: WorldFrame, ground: number, reduced: boolean, terrain: TerrainPoint[]) {
    const nl = this.locale === 'nl',
      time = reduced ? 0 : frame.time / 1000
    for (const [i, station] of this.stations.entries()) {
      const { node, x, machine, statusBackdrop, status } = station,
        group = skillGroups[i]!
      const floor = ground - terrainHeight(this.x + x, terrain)
      node.y = floor
      const near = Math.abs(frame.motion.x - (this.x + x)) < 65
      const onGround = frame.motion.grounded && Math.abs(frame.motion.y + ground - floor) < 18
      const action = this.activity.actions['skill-' + group.id]
      if (near && onGround && !frame.paused && !action) this.activate(i)
      const active = !!action
      const p =
        i === 0
          ? this.activity.pipeline.completed / pipelineSteps.length
          : action
            ? Math.min(1, action.age / 2)
            : 0
      if (p === 1) this.activity.completeStation(group.id)
      machine.clear()
      const pipelineFailed = i === 0 && this.activity.pipeline.status === 'error'
      statusBackdrop
        .clear()
        .roundRect(-143, -253, 286, 33, 4)
        .fill(pipelineFailed ? 0xf1dcd1 : active ? 0xe7ecd8 : 0xf3eddc)
        .stroke({ color: pipelineFailed ? 0xa36f58 : active ? 0x60836d : 0x9daa91, width: 1.5 })
        .rect(-143, -253, 4, 33)
        .fill(pipelineFailed ? 0xb17b5d : active ? 0x527e66 : 0xb79c6a)
      status.text = active
        ? nl ? 'Actief' : 'Live'
        : nl ? 'Stap op de plaat of tik op de machine' : 'Step on the plate or tap the machine'
      if (i === 0) {
        const pipeline = this.activity.pipeline
        status.text =
          pipeline.status === 'success'
            ? nl ? 'LIVE · 4/4 stappen gedeployed' : 'LIVE · 4/4 stages deployed'
            : pipeline.status === 'error'
              ? nl ? 'FOUT · herstart bij COMMIT' : 'ERROR · restart at COMMIT'
              : `${nl ? 'PIPELINE' : 'PIPELINE'} · ${pipeline.completed}/4 · ${(pipelineSteps[pipeline.completed] ?? 'done').toUpperCase()}`
        station.pipelineControls.forEach((control, step) => {
          const passed = pipeline.completed > step
          const next = pipeline.completed === step
          control
            .clear()
            .roundRect(-31, -5, 62, 28, 4)
            .fill(passed ? 0x426e59 : next ? 0x9c7547 : 0x315b4c)
            .stroke({ width: next ? 2.5 : 1.5, color: passed ? 0xcbdba9 : next ? 0xf5dca1 : 0x779985 })
        })
      }
      if (i === 1)
        status.text = `${nl ? 'LIVE PAGINA' : 'LIVE PAGE'} · CSS ${this.activity.web.theme + 1}/3 · API ${this.activity.web.records}`
      if (i === 2)
        status.text = `${nl ? 'WACHTRIJ' : 'QUEUE'} ${Math.ceil(this.activity.cloud.queued)} · ${nl ? 'KLAAR' : 'DONE'} ${Math.floor(this.activity.cloud.processed)} · ${this.activity.cloud.workers}/3 ${nl ? 'ACTIEF' : 'LIVE'}`
      // Conveyor and package: the commit really travels through build/test/deploy.
      if (i === 0) {
        machine.roundRect(-130, -59, 260, 18, 5).fill(0x35594b)
        for (let n = 0; n < 10; n++) machine.circle(-117 + n * 25, -50, 4).fill(0x89a480)
        // Each successful stage advances one real package. The conveyor does
        // not pretend to deploy by looping endlessly when no step was taken.
        if (this.pipelinePrevious !== this.activity.pipeline.completed) {
          this.pipelinePrevious = this.activity.pipeline.completed
          this.pipelineChangeAt = frame.time
        }
        const stage = this.activity.pipeline.completed
        const elapsed = reduced ? 1 : Math.min(1, (frame.time - this.pipelineChangeAt) / 650)
        const eased = 1 - Math.pow(1 - elapsed, 3)
        const from = Math.max(0, stage - 1) / pipelineSteps.length
        const travel = from + (stage / pipelineSteps.length - from) * eased
        const bx = -112 + travel * 218
        if (active) {
          for (let n = 0; n < 4; n++) {
            const px = -103 + n * 67
            const lift = reduced ? 0 : Math.max(0, Math.sin(time * 4 - n * 1.4)) * 12
            machine
              .rect(px - 9, -140, 18, 10)
              .fill(0x718f7a)
              .rect(px - 3, -131, 6, 20 - lift)
              .fill(0xbcc8a4)
              .rect(px - 12, -113 - lift, 24, 5)
              .fill(0xe0c88d)
          }
          const scan = reduced ? 0 : Math.sin(time * 3) * 104
          machine
            .moveTo(scan, -88)
            .lineTo(scan, -45)
            .stroke({ width: 2, color: 0xf3dc97, alpha: 0.6 })
        }
        machine
          .rect(bx - 15, -86, 30, 26)
          .fill(active ? 0xc9af7a : 0x78967b)
          .rect(bx - 3, -86, 6, 26)
          .fill(0xeee0ae)
        for (let n = 0; n < 4; n++)
          machine
            .circle(-103 + n * 67, -96, 5)
            .fill(this.activity.pipeline.completed > n ? 0xb5d48e : n === stage ? 0xf2d28e : 0x668772)
        if (active && !reduced)
          for (let n = 0; n < 5; n++)
            machine
              .rect(bx - 20 + ((n * 13) % 40), -95 - ((time * 26 + n * 8) % 35), 2, 3)
              .fill(0xe2cc8c)
      } else if (i === 1) {
        // Browser mockup: clicking its screen or a language logo really changes
        // the stylesheet or the cards loaded by the pretend API.
        const colors = [0x648d73, 0xaf775e, 0x6487a0] as const
        const tint = colors[this.activity.web.theme]!
        machine
          .roundRect(-121, -109, 242, 76, 6)
          .fill(0x23483d)
          .stroke({ color: 0x8ca792, width: 2 })
          .roundRect(-114, -102, 228, 63, 3)
          .fill(0xf3f1e6)
          .roundRect(-114, -102, 228, 15, 3)
          .fill(tint)
          .circle(-105, -95, 2.6)
          .circle(-96, -95, 2.6)
          .circle(-87, -95, 2.6)
          .fill(0xefe9cd)
          .roundRect(-77, -99, 114, 8, 3)
          .fill({ color: 0xfaf9f1, alpha: 0.9 })
        // The hero, card layout and call to action all respond to CSS.
        machine
          .roundRect(-107, -81, 67, 34, 3)
          .fill(tint)
          .rect(-98, -73, 44, 3)
          .fill(0xf9f5e9)
          .rect(-98, -65, 34, 2)
          .fill({ color: 0xf9f5e9, alpha: 0.66 })
          .roundRect(-98, -57, 23, 5, 2)
          .fill(0xe9dbad)
          .rect(-31, -81, 79, 5)
          .fill(0x345949)
          .rect(-31, -71, 106, 3)
          .fill(0x829d87)
          .rect(-31, -63, 69, 3)
          .fill(0xb6c6af)
        for (let card = 0; card < this.activity.web.records; card++) {
          const px = 48 + card * 20
          const pulse = reduced ? 0.3 : Math.sin(time * 4 + card) * 0.1 + 0.2
          machine
            .roundRect(px, -60, 17, 17, 2)
            .fill({ color: tint, alpha: 0.75 + pulse })
            .rect(px + 3, -56, 11, 2)
            .fill(0xfaf6e9)
            .rect(px + 3, -51, 8, 2)
            .fill(0xe9dbad)
        }
        // A successful response indicator moves only while the station is live.
        machine.circle(105, -95, 3.5).fill(active ? 0xc7dc93 : 0x8c9d86)
        if (active && !reduced) {
          const scanX = -114 + ((time * 44) % 228)
          machine.rect(scanX, -41, 9, 2).fill({ color: tint, alpha: 0.85 })
        }
        machine
          .rect(-5, -33, 10, 9)
          .rect(-29, -25, 58, 4)
          .fill(0x6f886a)
      } else {
        // Live queue: incoming work crosses the conveyor, active racks process
        // jobs and completed packets leave on the right. The queue and processed
        // counters are driven by ActivitySystem, not a decorative animation.
        const count = this.activity.cloud.workers
        const backlog = this.activity.cloud.queued
        for (let n = 0; n < 3; n++) {
          const x = -120 + n * 86
          const online = active && n < count
          const pulse = reduced ? 0.65 : Math.sin(time * 7 - n * 1.6) * 0.25 + 0.7
          machine
            .roundRect(x, -108, 68, 66, 5)
            .fill(online ? 0x325b4c : 0x28473f)
            .stroke({ width: online ? 2 : 1.2, color: online ? 0xc6dca1 : 0x7e9b86 })
          for (let line = 0; line < 3; line++) {
            machine
              .roundRect(x + 8, -98 + line * 16, 52, 12, 2)
              .fill(0x193d34)
              .rect(x + 12, -94 + line * 16, 29, 3)
              .fill(online ? 0x719b7d : 0x4b7363)
              .circle(x + 52, -92 + line * 16, 2.5)
              .fill(online ? (pulse > 0.7 ? 0xd9e99f : 0x8ab28b) : 0x677f71)
          }
        }
        // Queue-depth meter; moving packets show the difference between one
        // saturated worker and three draining the same incoming requests.
        machine
          .roundRect(-132, -32, 264, 11, 4)
          .fill(0x284c42)
          .roundRect(-129, -29, Math.max(3, Math.min(1, backlog / 50) * 258), 5, 2)
          .fill(backlog > 35 ? 0xd89d70 : 0xdcc98b)
        for (let n = 0; n < 3; n++) {
          const lane = -112 + n * 86
          const enabled = active && n < count
          if (enabled)
            machine
              .moveTo(lane + 20, -42)
              .lineTo(lane + 20, -30)
              .stroke({ color: 0xb9d994, width: 2, alpha: 0.7 })
        }
        if (active)
          for (let n = 0; n < 9; n++) {
            const phase = reduced ? n / 9 : (time * (0.22 + count * 0.13) + n / 9) % 1
            const px = -130 + phase * 258
            const completed = phase > 0.68
            machine
              .roundRect(px, -18 - (n % 2) * 3, 9, 6, 1.5)
              .fill(completed ? 0xb9db9a : 0xe1c787)
          }
      }
      // A selected technology sends a visible data pulse into its actual
      // machine. Each logo has a response even if the current settings match.
      const selection = this.selectedLogos[i]
      if (selection) {
        const age = frame.time - selection.at
        if (age < 1450) {
          const source = station.logos[selection.index]
          if (source) {
            const startY = source.y + 22
            const endY = -73
            const travel = Math.min(1, age / 900)
            const easing = 1 - Math.pow(1 - travel, 2)
            machine
              .moveTo(source.x, startY)
              .bezierCurveTo(source.x, startY + 26, 0, -114, 0, endY)
              .stroke({ width: 2.8, color: 0xe6cb87, alpha: 0.8 * (1 - age / 1450) })
              .circle(source.x * (1 - easing), startY + (endY - startY) * easing, 5)
              .fill({ color: 0xf4e2b4, alpha: 1 - age / 1450 })
          }
        }
      }
      station.logos.forEach((badge, j) => {
        badge.y =
          -199 +
          Math.floor(j / (group.ids.length > 6 ? 4 : 3)) * 54 +
          (reduced ? 0 : Math.sin(time * 1.4 + j + i) * 3)
        badge.alpha = active ? 1 : 0.85
      })
    }
  }
}
