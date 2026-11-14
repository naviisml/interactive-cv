import type { Container} from 'pixi.js';
import { Graphics, Text } from 'pixi.js'
export function rect(
  parent: Container,
  x: number,
  y: number,
  width: number,
  height: number,
  color: number,
) {
  const g = new Graphics().rect(x, y, width, height).fill(color)
  parent.addChild(g)
  return g
}
export function label(
  parent: Container,
  text: string,
  x: number,
  y: number,
  size = 12,
  color = 0xece4c9,
  width = 260,
) {
  const t = new Text({
    text,
    style: {
      fontFamily: 'Space Grotesk, Arial, sans-serif',
      fontWeight: '500',
      fontSize: size,
      fill: color,
      wordWrap: true,
      wordWrapWidth: width,
      lineHeight: size * 1.35,
    },
  })
  t.position.set(x, y)
  parent.addChild(t)
  return t
}
export function polygon(g: Graphics, points: number[], color: number) {
  return g.poly(points).fill(color)
}
