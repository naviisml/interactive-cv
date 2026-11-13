import fs from 'node:fs/promises'
import sharp from 'sharp'
// A complete pose atlas. Edit this rig, palette or a named clip; runtime never stretches limbs.
const W = 48,
  H = 96
const clips = [
  ['idle', 6],
  ['walk', 12],
  ['run', 12],
  ['climb', 8],
  ['jump', 2],
  ['fall', 2],
  ['slide', 2],
  ['crouch', 4],
  ['dance', 12],
  ['enter', 6],
]
const rect = (x, y, w, h, c) =>
  `<rect x="${Math.round(x)}" y="${Math.round(y)}" width="${w}" height="${h}" fill="${c}"/>`
const poly = (points, c) =>
  `<polygon points="${points.map((p) => p.map(Math.round).join(',')).join(' ')}" fill="${c}"/>`
function segment(a, b, width, color) {
  const dx = b[0] - a[0],
    dy = b[1] - a[1],
    length = Math.hypot(dx, dy) || 1,
    nx = ((-dy / length) * width) / 2,
    ny = ((dx / length) * width) / 2
  return poly(
    [
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ],
    color,
  )
}
function leg(hip, foot, near) {
  const dx = foot[0] - hip[0],
    dy = foot[1] - hip[1],
    d = Math.hypot(dx, dy) || 1,
    bend =
      Math.abs(dx) < 6 && dy > 37
        ? 0
        : Math.sqrt(Math.max(0, 20.5 ** 2 - Math.min(40.8, d) ** 2 / 4)),
    k = [(hip[0] + foot[0]) / 2 + (dy / d) * bend, (hip[1] + foot[1]) / 2 - (dx / d) * bend]
  return (
    segment(hip, k, near ? 7 : 6, near ? '#374452' : '#26323e') +
    segment(k, foot, near ? 6 : 5, near ? '#3d4d5a' : '#2b3945') +
    segment([hip[0] - 1, hip[1] + 2], [k[0] - 1, k[1] - 1], 1, near ? '#53606a' : '#35424d') +
    rect(foot[0] - 3, foot[1] - 1, 10, 4, near ? '#e7e5d3' : '#aaaeb0') +
    rect(foot[0] - 3, foot[1] + 3, 10, 1, '#81958c')
  )
}
function pose(action, f, count) {
  const phase = f / count,
    theta = phase * Math.PI * 2,
    run = action === 'run',
    gait = run || action === 'walk' || action === 'enter',
    crouch = action === 'crouch' || action === 'slide',
    dance = action === 'dance'
  const bob = gait
    ? -(run ? Math.round(Math.sin(theta) ** 2 * 3) : Math.round(Math.sin(theta) ** 2))
    : dance
      ? Math.round(Math.sin(theta * 2) * 2)
      : 0
  const bend = crouch ? 18 : 0,
    hip = [23, 53 + bob + bend],
    torsoY = 27 + bob + bend,
    headY = 3 + bob + bend
  function foot(t) {
    t = (t + 1) % 1
    const stance = run ? 0.4 : 0.6,
      spread = run ? 13 : 9
    const x =
      t < stance
        ? 23 + spread - (2 * spread * t) / stance
        : 23 - spread + (2 * spread * (t - stance)) / (1 - stance)
    let y =
      t < stance ? 92 : 92 - Math.sin((Math.PI * (t - stance)) / (1 - stance)) * (run ? 16 : 10)
    if (run && t > 0.4 && t < 0.5) y -= 3
    return [x, y]
  }
  let front = gait ? foot(phase) : [22, 92],
    back = gait ? foot(phase + 0.5) : [28, 92]
  if (action === 'jump') {
    front = [32, 82 - f * 2]
    back = [13, 80 + f * 3]
  }
  if (action === 'fall') {
    front = [29, 91]
    back = [16, 87]
  }
  if (action === 'climb') {
    front = [33, 84 + Math.sin(theta) * 7]
    back = [14, 84 - Math.sin(theta) * 7]
  }
  if (crouch) {
    front = [35, 92]
    back = [16, 92]
  }
  if (dance) {
    front = [19 + Math.sin(theta) * 7, 92]
    back = [30 - Math.sin(theta) * 5, 92 - Math.max(0, Math.cos(theta)) * 8]
  }
  const shoulder = [23, torsoY + 5]
  function arm(near) {
    let a = gait
        ? Math.cos(theta + (near ? Math.PI : 0)) * (run ? 0.95 : 0.48)
        : near
          ? 0.13
          : -0.1,
      elbow = [shoulder[0] + Math.sin(a) * 11, shoulder[1] + Math.cos(a) * 11],
      hand = [elbow[0] + Math.sin(a) * 10, elbow[1] + Math.cos(a) * 10]
    if (run) hand = [elbow[0] + 9, elbow[1] - 5]
    if (action === 'jump') {
      elbow = [near ? 34 : 13, torsoY + 4]
      hand = [near ? 36 : 11, torsoY - 6]
    }
    if (action === 'climb') {
      elbow = [near ? 34 : 13, torsoY + 3]
      hand = [near ? 35 : 12, torsoY - 10 + (near ? Math.sin(theta) * 7 : -Math.sin(theta) * 7)]
    }
    if (dance) {
      elbow = [near ? 35 : 11, torsoY + Math.sin(theta) * 9]
      hand = [near ? 39 : 8, torsoY - 8 + Math.sin(theta) * 10]
    }
    if (crouch) {
      elbow = [34, torsoY + 11]
      hand = [40, torsoY + 17]
    }
    return (
      segment(shoulder, elbow, near ? 6 : 5, near ? '#293740' : '#19272f') +
      segment(elbow, hand, 5, near ? '#34414a' : '#22313a') +
      rect(hand[0] - 2, hand[1] - 1, 4, 6, near ? '#c38e70' : '#a97860')
    )
  }
  let art = arm(false) + leg(hip, back, false) + leg(hip, front, true)
  art += poly(
    [
      [16, torsoY],
      [27, torsoY - 1],
      [31, torsoY + 5],
      [30, torsoY + 25],
      [15, torsoY + 25],
      [14, torsoY + 7],
    ],
    '#233039',
  )
  art +=
    rect(20, torsoY + 2, 6, 22, '#394b60') +
    rect(16, torsoY + 3, 3, 20, '#34434c') +
    rect(26, torsoY + 4, 2, 19, '#6c777a') +
    poly(
      [
        [16, torsoY],
        [21, torsoY + 3],
        [19, torsoY + 10],
        [15, torsoY + 4],
      ],
      '#4a555a',
    ) +
    rect(15, torsoY + 24, 15, 3, '#1c2932')
  art +=
    rect(22, headY + 18, 6, 8, '#b58368') +
    poly(
      [
        [18, headY + 5],
        [29, headY + 4],
        [32, headY + 9],
        [31, headY + 19],
        [27, headY + 23],
        [20, headY + 21],
        [17, headY + 15],
      ],
      '#bd896f',
    ) +
    rect(23, headY + 8, 8, 11, '#cf9e7f') +
    rect(31, headY + 12, 3, 4, '#c38f70') +
    rect(19, headY + 12, 3, 5, '#d1a080')
  // Dark tousled top, faded sides, brow, nose, moustache and short jaw shadow.
  art +=
    poly(
      [
        [16, headY + 11],
        [15, headY + 4],
        [18, headY + 4],
        [18, headY + 1],
        [27, headY],
        [30, headY + 2],
        [32, headY + 6],
        [28, headY + 7],
        [25, headY + 5],
        [23, headY + 8],
        [20, headY + 7],
        [19, headY + 13],
      ],
      '#222526',
    ) +
    rect(18, headY + 4, 5, 2, '#353332') +
    rect(17, headY + 10, 2, 5, '#65564b') +
    rect(27, headY + 10, 4, 1, '#493a32') +
    rect(29, headY + 12, 2, 1, '#263032') +
    rect(29, headY + 17, 4, 1, '#674838') +
    poly(
      [
        [23, headY + 20],
        [28, headY + 20],
        [31, headY + 18],
        [30, headY + 21],
        [26, headY + 23],
        [23, headY + 22],
      ],
      '#574238',
    )
  art += arm(true)
  return `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="96" shape-rendering="crispEdges">${art}</svg>`
}
const frames = []
const manifest = { frame: { width: W, height: H, anchor: [0.5, 1] }, clips: {} }
let index = 0
for (const [action, count] of clips) {
  manifest.clips[action] = { start: index, count }
  for (let f = 0; f < count; f++) {
    frames.push({
      input: await sharp(Buffer.from(pose(action, f, count)))
        .png()
        .toBuffer(),
      left: index * W,
      top: 0,
    })
    index++
  }
}
await fs.mkdir('public/sprites', { recursive: true })
await sharp({ create: { width: W * index, height: H, channels: 4, background: '#00000000' } })
  .composite(frames)
  .png()
  .toFile('public/sprites/navi.png')
await fs.writeFile('public/sprites/navi.atlas.json', JSON.stringify(manifest, null, 2) + '\n')
// A contact sheet for visual review; the game loads only the atlas above.
await fs.mkdir('art/character', { recursive: true })
const review = frames.map((f, i) => ({ ...f, left: (i % 12) * W, top: Math.floor(i / 12) * H }))
await sharp({ create: { width: 12 * W, height: 6 * H, channels: 4, background: '#d4d6c1' } })
  .composite(review)
  .png()
  .toFile('art/character/poses.png')
console.log(`Built ${index} poses: ${clips.map((c) => c[0]).join(', ')}`)
