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
      // The nearest object now owns a world-anchored tooltip. No permanent
      // status banner should obscure tool icons or machine controls.
      statusBackdrop.visible = false
      status.visible = false
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
      if (i === 2)
        for (let worker = 0; worker < 3; worker++) {
          const rack = new Container()
          rack.x = -120 + worker * 86
          tapTarget(
            rack,
            () => {
              this.activate(i)
              this.activity.cloud.workers = worker + 1
            },
            new Rectangle(0, -106, 68, 65),
          )
          node.addChild(rack)
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
      const onGround = Math.abs(frame.motion.y + ground - floor) < 15
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
        ? i === 0
          ? p < 1
            ? nl
              ? 'Code wordt gebouwd en getest…'
              : 'Building and testing your code…'
            : nl
              ? 'Build geslaagd. Container onderweg.'
              : 'Build passed. Container shipped.'
          : i === 1
            ? p < 1
              ? nl
                ? 'HTML + CSS + API → live pagina'
                : 'HTML + CSS + API → live page'
              : nl
                ? 'CSS: kies een stijl. PHP: laad data.'
                : 'CSS: change theme. PHP: load data.'
            : nl
              ? 'Workers verwerken de wachtrij.'
              : 'Workers are draining the queue.'
        : nl
          ? 'Loop over de lichtplaat om te starten.'
          : 'Walk over the light plate to start.'
      if (i === 0) {
        const pipeline = this.activity.pipeline
        status.text =
          pipeline.status === 'success'
            ? nl
              ? 'Pipeline geslaagd. Klaar voor productie.'
              : 'Pipeline passed. Deployed to production.'
            : pipeline.status === 'error'
              ? nl
                ? 'Verkeerde volgorde. Start opnieuw met Commit.'
                : 'Wrong order. Restart at Commit.'
              : active
                ? nl
                  ? 'Kies Commit → Test → Build → Deploy.'
                  : 'Select Commit → Test → Build → Deploy.'
                : nl
                  ? 'Loop over de lichtplaat om te starten.'
                  : 'Walk over the light plate to start.'
        station.pipelineControls.forEach((control, step) => {
          const passed = pipeline.completed > step
          control
            .clear()
            .roundRect(-31, -5, 62, 28, 4)
            .fill(passed ? 0x5b8066 : 0x315b4c)
            .stroke({ width: 1.5, color: passed ? 0xcbdba9 : 0xb0c09e })
        })
      }
      if (i === 2 && active)
        status.text = `${nl ? 'Wachtrij' : 'Queue'} ${Math.ceil(this.activity.cloud.queued)} · ${this.activity.cloud.workers}/3 workers · ${nl ? 'tik op rack' : 'tap rack'}`
      // Conveyor and package: the commit really travels through build/test/deploy.
      if (i === 0) {
        machine.roundRect(-130, -59, 260, 18, 5).fill(0x35594b)
        for (let n = 0; n < 10; n++) machine.circle(-117 + n * 25, -50, 4).fill(0x89a480)
        const demo = active && !reduced && this.activity.pipeline.status !== 'success'
        const travel = demo ? (time * 0.28) % 1 : p
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
        for (let n = 0; n < 3; n++)
          machine.circle(-85 + n * 85, -96, 5).fill(p > (n + 1) / 4 ? 0xb5d48e : 0x668772)
        if (active && !reduced)
          for (let n = 0; n < 5; n++)
            machine
              .rect(bx - 20 + ((n * 13) % 40), -95 - ((time * 26 + n * 8) % 35), 2, 3)
              .fill(0xe2cc8c)
      } else if (i === 1) {
        machine
          .roundRect(-118, -103, 236, 64, 4)
          .fill(0x234b40)
          .rect(-111, -96, 222, 49)
          .fill(0xdce1c8)
        machine
          .rect(-111, -96, 222, 8)
          .fill([0x8aaa91, 0xb1846c, 0x6e859f][this.activity.web.theme]!)
        if (p > 0.15) machine.rect(-101, -81, 62, 27).fill(0xa7b185)
        if (p > 0.4)
          machine.rect(-29, -81, 128, 6).fill(0x456e59).rect(-29, -70, 96, 4).fill(0x90a482)
        for (let card = 0; card < this.activity.web.records; card++)
          machine
            .rect(30 + card * 24, -59, 18, 10)
            .fill([0x8fa488, 0xb39768, 0x7d9b9e][this.activity.web.theme]!)
        if (p > 0.7) machine.roundRect(-29, -60, 48, 9, 2).fill(0xb39362)
        machine.rect(-5, -39, 10, 9).rect(-29, -31, 58, 4).fill(0x6f886a)
      } else {
        // Live packets continuously enter the workers and leave as completed jobs.
        for (let n = 0; n < 3; n++) {
          machine
            .roundRect(-120 + n * 86, -103, 68, 58, 4)
            .fill(0x284c42)
            .stroke({ width: 1, color: 0x9cad88 })
          for (let r = 0; r < 3; r++)
            machine.rect(-111 + n * 86, -94 + r * 13, 49, 7).fill(0x163e34)
          machine
            .circle(-64 + n * 86, -90, 2)
            .fill(active && n < this.activity.cloud.workers ? 0xccdc9a : 0x668775)
        }
        if (active)
          for (let n = 0; n < 7; n++) {
            const phase = reduced
                ? 0.5
                : (time * (0.15 + this.activity.cloud.workers * 0.12) + n / 7) % 1,
              px = -136 + phase * 270
            machine.rect(px, -35, 6, 4).fill(phase > 0.65 ? 0xc6db9c : 0xe0c782)
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
