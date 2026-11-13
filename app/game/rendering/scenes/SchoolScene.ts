import { Container, Graphics, Rectangle } from 'pixi.js'
import { tapTarget } from '../interactions'
import { rect, label } from '../drawing'
import {
  circuitCell,
  circuitPorts,
  circuitPort,
  circuitBattery,
  circuitLamp,
  circuitInput,
  circuitOutput,
} from '../../core/sceneLayout'
import type { ActivitySystem } from '../../engine/ActivitySystem'
export class SchoolScene extends Container {
  private dynamic = new Container()
  private ball = new Graphics()
    .circle(0, 0, 10)
    .fill(0xe9e3cb)
    .stroke({ width: 2, color: 0x3a5f4e })
  private state = ''
  constructor(
    private id: string,
    private activities: ActivitySystem,
  ) {
    super()
    this.pivot.set(300, 310)
    if (id === 'panta-rhei') {
      rect(this, 426, 236, 60, 74, 0x668372)
      this.addChild(new Graphics().rect(426, 236, 60, 74).stroke({ width: 4, color: 0xe4dec0 }))
      for (let i = 1; i < 4; i++) rect(this, 426 + i * 15, 236, 1, 74, 0xb5c8b1)
      rect(this, 150, 146, 130, 54, 0x355b48)
      label(this, 'SCHOOLYARD', 163, 155, 11)
      rect(this, 160, 200, 5, 110, 0x7a8b69)
      rect(this, 268, 200, 5, 110, 0x7a8b69)
      this.addChild(this.ball)
      tapTarget(this.ball, () => activities.command('kick'), new Rectangle(-22, -22, 44, 44))
      const scoreTarget = new Container()
      tapTarget(scoreTarget, () => activities.command('reset'), new Rectangle(150, 146, 130, 54))
      this.addChild(scoreTarget)
    } else {
      rect(this, 160, 73, 280, 165, 0x35554b)
      rect(this, 154, 69, 292, 5, 0x9aaa8c)
      rect(this, 175, 238, 6, 72, 0x7d8d71)
      rect(this, 419, 238, 6, 72, 0x7d8d71)
      if (id === 'roc-hilversum') {
        const lead = new Graphics()
          .moveTo(circuitBattery.x, circuitBattery.y)
          .lineTo(circuitInput.x, circuitInput.y)
          .moveTo(circuitBattery.x, circuitBattery.y - 15)
          .lineTo(circuitBattery.x, circuitBattery.y + 15)
          .moveTo(circuitBattery.x - 7, circuitBattery.y - 8)
          .lineTo(circuitBattery.x - 7, circuitBattery.y + 8)
          .stroke({ width: 3, color: 0xd5d4a0 })
        this.addChild(lead)
      }
    }
    this.addChild(this.dynamic)
  }
  update(activity: ActivitySystem, interactive: boolean) {
    this.eventMode = interactive ? 'passive' : 'none'
    if (this.id === 'panta-rhei') this.ball.position.set(activity.ball.x, activity.ball.y)
    const key =
      this.id === 'roc-hilversum'
        ? activity.turns.join(',')
        : this.id === 'coding-college'
          ? String(activity.code)
          : String(activity.goals)
    if (key === this.state) return
    this.state = key
    this.dynamic.removeChildren().forEach((node) => node.destroy())
    if (this.id === 'panta-rhei') {
      label(this.dynamic, String(activity.goals).padStart(2, '0') + ' : 00', 185, 174, 17)
      return
    }
    if (this.id === 'roc-hilversum') {
      const circuit = activity.circuit
      const output = new Graphics()
        .moveTo(circuitOutput.x, circuitOutput.y)
        .lineTo(circuitLamp.x, circuitOutput.y)
        .lineTo(circuitLamp.x, circuitLamp.y)
        .stroke({ width: 4, color: circuit.complete ? 0xf1d999 : 0x87a08b })
      this.dynamic.addChild(output)
      activity.turns.forEach((turn, index) => {
        const cell = circuitCell(index),
          ports = circuitPorts(turn),
          a = circuitPort(index, ports[0]!),
          b = circuitPort(index, ports[1]!)
        rect(
          this.dynamic,
          cell.x,
          cell.y,
          cell.size - 1,
          cell.size - 1,
          circuit.lit.includes(index) ? 0x61775c : 0x476552,
        )
        const target = new Container()
        tapTarget(
          target,
          () => this.activities.command('wire', index),
          new Rectangle(cell.x, cell.y, cell.size, cell.size),
        )
        this.dynamic.addChild(target)
        const g = new Graphics()
          .moveTo(a.x, a.y)
          .lineTo(cell.x + cell.size / 2, cell.y + cell.size / 2)
          .lineTo(b.x, b.y)
          .stroke({ width: 5, color: circuit.lit.includes(index) ? 0xf1d999 : 0x87a08b })
        this.dynamic.addChild(g)
      })
      label(
        this.dynamic,
        circuit.complete ? '●' : '○',
        circuitLamp.x - 10,
        circuitLamp.y - 14,
        23,
        circuit.complete ? 0xf1d999 : 0x87a08b,
      )
      return
    }
    label(this.dynamic, '{  ;  {  }', 211, 108, 24, 0xd5d8ba)
    label(
      this.dynamic,
      '●'.repeat(activity.code) + '○'.repeat(4 - activity.code),
      238,
      161,
      16,
      0xc4d3a8,
    )
    for (const [index, x] of [184, 300, 416].entries()) {
      rect(this.dynamic, x - 31, 296, 62, 14, 0x91a87e)
      label(this.dynamic, ['{', ';', '}'][index]!, x - 4, 275, 16)
      const target = new Container()
      tapTarget(
        target,
        () => this.activities.command('code', index),
        new Rectangle(x - 31, 263, 62, 47),
      )
      this.dynamic.addChild(target)
    }
  }
}
