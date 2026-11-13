import { Container, Graphics, Rectangle, Text } from 'pixi.js'
import {
  circuitConnected,
  circuitSeed,
  poweredWires,
  roverTrace,
  wireMask,
  type RoverCommand,
} from '../../core/learningActivities'
import type { ActivitySystem } from '../../engine/ActivitySystem'
import type { WorldFrame } from '../types'
import { label, rect } from '../drawing'
import { tapTarget } from '../interactions'

/** A connected electrical lab and a programmable rover: different causes, visible outcomes. */
export class SchoolActivityScene extends Container {
  private dynamic = new Graphics()
  private feedback: Text
  private code?: Text
  private rover?: Container
  private cells: Graphics[] = []
  private controls: { node: Container; action: string }[] = []
  constructor(
    private kind: 'circuit' | 'compile',
    private state: ActivitySystem,
    private locale: string,
  ) {
    super()
    const nl = locale === 'nl'
    // A courtyard lab, grounded in front of the east wing.
    rect(this, 46, -236, 274, 170, 0x1a3933)
    rect(this, 51, -231, 264, 158, 0x294b43)
    rect(this, 41, -241, 284, 7, 0xb9bc91)
    for (const x of [64, 295]) rect(this, x, -66, 7, 66, 0x6f8874)
    label(
      this,
      kind === 'circuit'
        ? nl
          ? 'STROOM NAAR DE CAMPUS'
          : 'POWER THE CAMPUS'
        : nl
          ? 'PROGRAMMEER DE ROVER'
          : 'PROGRAM THE ROVER',
      65,
      -223,
      14,
      0xf4e9c7,
      244,
    )
    this.feedback = label(this, '', 67, -195, 12, 0xd6e0c5, 234)
    this.addChild(this.dynamic)
    if (kind === 'circuit') {
      for (let i = 0; i < 6; i++) {
        const tile = new Graphics()
        tile.position.set(100 + (i % 3) * 60, -145 + Math.floor(i / 3) * 47)
        tapTarget(
          tile,
          () => {
            state.circuit[i] = (state.circuit[i]! + 1) % 4
          },
          new Rectangle(-29, -26, 58, 52),
        )
        this.cells.push(tile)
        this.addChild(tile)
      }
      this.button(nl ? 'Opnieuw' : 'Reset', 282, -108, 62, () => {
        state.circuit = [...circuitSeed]
      })
      // The lab supplies a real lamp and a visible band of campus windows.
      rect(this, 327, -149, 5, 149, 0x5d7c66)
      this.addChild(
        new Graphics().poly([310, -149, 349, -149, 341, -172, 318, -172]).fill(0x92a77d),
      )
    } else {
      this.code = label(this, '', 65, -163, 14, 0xe7ce8e, 240)
      this.button(nl ? 'Stap' : 'Step', 87, -96, 51, () => this.command('step'))
      this.button(nl ? 'Spring' : 'Jump', 147, -96, 57, () => this.command('jump'))
      this.button('↶', 204, -96, 40, () => {
        if (state.rover.status !== 'running') {
          state.rover.commands.pop()
          state.rover.status = 'idle'
        }
      })
      this.button('▶ Run', 265, -96, 65, () => {
        if (state.rover.commands.length) Object.assign(state.rover, { age: 0, status: 'running' })
      })
      // A route with two actual gaps. A step into a gap fails; a jump clears it.
      for (let i = 0; i < 8; i++) {
        if ([2, 5].includes(i)) continue
        rect(this, 26 + i * 40, -19, 34, 7, 0xc3c39a)
        rect(this, 29 + i * 40, -12, 28, 12, 0x4d705a)
      }
      this.rover = new Container()
      rect(this.rover, -13, -25, 26, 16, 0xc6b37c)
      rect(this.rover, -5, -32, 15, 9, 0x739e94)
      rect(this.rover, 7, -29, 4, 3, 0xe4e5ac)
      for (const x of [-9, 9])
        this.rover.addChild(
          new Graphics().circle(x, -7, 5).fill(0x243d35).circle(x, -7, 2).fill(0x9caf8a),
        )
      this.addChild(this.rover)
    }
  }
  private button(text: string, x: number, y: number, width: number, action: () => void) {
    const node = new Container()
    node.position.set(x, y)
    node.addChild(new Graphics().roundRect(-width / 2, -17, width, 35, 4).fill(0xdce0bf))
    const title = label(node, text, 0, -10, 12, 0x294a3b, width - 4)
    title.anchor.x = 0.5
    tapTarget(node, action, new Rectangle(-width / 2, -22, width, 44))
    this.controls.push({ node, action: text })
    this.addChild(node)
  }
  command(command: RoverCommand) {
    const rover = this.state.rover
    if (rover.status === 'running' || rover.commands.length >= 8) return
    rover.commands.push(command)
    rover.status = 'idle'
  }
  update(frame: WorldFrame, reduced: boolean) {
    const nl = this.locale === 'nl',
      time = reduced ? 0 : frame.time / 1000
    this.dynamic.clear()
    if (this.kind === 'circuit') {
      const powered = poweredWires(this.state.circuit),
        connected = circuitConnected(this.state.circuit)
      this.feedback.text = connected
        ? nl
          ? 'Verbonden. De campus leeft!'
          : 'Connected. The campus is alive!'
        : nl
          ? 'Draai de kabels: bron → lamp.'
          : 'Rotate the wires: source → lamp.'
      this.cells.forEach((tile, i) => {
        const on = powered.includes(i),
          mask = wireMask(i, this.state.circuit[i]!)
        tile
          .clear()
          .roundRect(-23, -22, 46, 44, 4)
          .fill(on ? 0x436c54 : 0x203f37)
          .stroke({ width: 1, color: 0x7f9c80 })
        const color = on ? 0xf2d98f : 0x769283
        for (const [bit, x, y] of [
          [1, 0, -22],
          [2, 23, 0],
          [4, 0, 22],
          [8, -23, 0],
        ])
          if (mask & bit!) tile.moveTo(0, 0).lineTo(x!, y!).stroke({ width: 5, color })
        tile.circle(0, 0, 4).fill(color)
        if (on && !reduced) tile.circle(Math.sin(time * 4 + i) * 12, 0, 2).fill(0xfff5c7)
      })
      // Visible bridge segments agree with the electrical graph, including gaps between tiles.
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 2; col++) {
          const cell = row * 3 + col,
            next = cell + 1
          const live =
            powered.includes(cell) &&
            powered.includes(next) &&
            wireMask(cell, this.state.circuit[cell]!) & 2 &&
            wireMask(next, this.state.circuit[next]!) & 8
          this.dynamic
            .moveTo(123 + col * 60, -145 + row * 47)
            .lineTo(137 + col * 60, -145 + row * 47)
            .stroke({ width: 5, color: live ? 0xf2d98f : 0x537565 })
        }
      for (let col = 0; col < 3; col++) {
        const live =
          powered.includes(col) &&
          powered.includes(col + 3) &&
          wireMask(col, this.state.circuit[col]!) & 4 &&
          wireMask(col + 3, this.state.circuit[col + 3]!) & 1
        this.dynamic
          .moveTo(100 + col * 60, -123)
          .lineTo(100 + col * 60, -120)
          .stroke({ width: 5, color: live ? 0xf2d98f : 0x537565 })
      }
      this.dynamic.moveTo(57, -145).lineTo(76, -145).stroke({ width: 4, color: 0xe7cd83 })
      this.dynamic
        .moveTo(76, -98)
        .lineTo(59, -98)
        .lineTo(59, -57)
        .lineTo(330, -57)
        .lineTo(330, -150)
        .stroke({ width: 3, color: connected ? 0xf5d692 : 0x537565 })
      if (connected) {
        this.dynamic
          .circle(329, -154, 29)
          .fill({ color: 0xf7df9c, alpha: 0.16 })
          .circle(329, -154, 9)
          .fill(0xffe8ab)
      }
    } else {
      const rover = this.state.rover,
        trace = roverTrace(rover.commands)
      this.code!.text = rover.commands.length
        ? rover.commands
            .map((command, i) => `${i + 1}:${command === 'jump' ? '↗' : '→'}`)
            .join('  ')
        : nl
          ? 'Kies stappen en sprongen.'
          : 'Add steps and jumps, then run.'
      const index = Math.min(Math.floor(rover.age), trace.cells.length - 2),
        fraction = rover.age - Math.floor(rover.age)
      let cell = trace.cells[0]!,
        y = -19
      if (rover.age > 0 && index >= 0) {
        const start = trace.cells[index]!,
          end = trace.cells[index + 1]!
        const t = rover.status === 'running' ? fraction : 1
        cell = start + (end - start) * t
        if (rover.commands[index] === 'jump') y -= Math.sin(t * Math.PI) * 43
        if (rover.status === 'error' && trace.failed >= 0) y += 16
      }
      this.rover!.position.set(43 + cell * 40, y)
      this.feedback.text =
        rover.status === 'running'
          ? nl
            ? `Uitvoeren: regel ${Math.floor(rover.age) + 1}`
            : `Executing line ${Math.floor(rover.age) + 1}`
          : rover.status === 'success'
            ? nl
              ? 'Aangekomen! Je programma werkt.'
              : 'Arrived! Your program works.'
            : rover.status === 'error'
              ? trace.failed >= 0
                ? nl
                  ? `Gat bij regel ${trace.failed + 1}. Pas je code aan.`
                  : `Gap on line ${trace.failed + 1}. Fix your program.`
                : nl
                  ? 'Nog niet bij de finish. Voeg stappen toe.'
                  : 'Not at the finish. Add more steps.'
              : nl
                ? 'Bereik de vlag. Spring over de gaten.'
                : 'Reach the flag. Jump across the gaps.'
      this.dynamic
        .rect(338, -67, 3, 48)
        .fill(0xa9b28a)
        .poly([341, -67, 352, -58, 341, -48])
        .fill(rover.status === 'success' ? 0xecc77b : 0x6f947c)
      if (rover.status === 'success' && !reduced)
        for (let i = 0; i < 10; i++)
          this.dynamic
            .rect(320 + ((i * 17) % 55), -80 - ((time * 25 + i * 11) % 80), 3, 3)
            .fill(i % 2 ? 0xe4ca7e : 0x9bc2a0)
    }
  }
}
