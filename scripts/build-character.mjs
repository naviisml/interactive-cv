import fs from 'node:fs/promises'
import sharp from 'sharp'
// Authored whole-frame pixel poses. No SVG joints or CSS limb transforms at runtime.
const rect = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`
const limb = (x, y, pose, color, width) =>
  `<path d="M${x} ${y} L${pose[0]} ${pose[1]} L${pose[2]} ${pose[3]}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="square"/>`
const head =
  rect(12, 2, 10, 10, '#191e24') +
  rect(11, 4, 2, 6, '#191e24') +
  rect(14, 1, 6, 2, '#25292e') +
  rect(13, 4, 9, 8, '#c29277') +
  rect(15, 6, 7, 7, '#d1a084') +
  rect(22, 8, 2, 3, '#bf8b70') +
  rect(12, 3, 10, 3, '#20242a') +
  rect(13, 5, 2, 3, '#20242a') +
  rect(17, 5, 2, 2, '#20242a') +
  rect(18, 7, 4, 1, '#503a31') +
  rect(20, 8, 2, 1, '#1c252a') +
  rect(18, 11, 4, 1, '#513b30') +
  rect(17, 13, 4, 2, '#4a352d') +
  rect(15, 14, 5, 4, '#b7856b')
const torso =
  rect(11, 18, 11, 21, '#202b33') +
  rect(9, 19, 3, 10, '#28343d') +
  rect(14, 18, 5, 19, '#3a4a60') +
  rect(12, 19, 2, 18, '#2b353d') +
  rect(19, 20, 3, 17, '#18232b') +
  rect(18, 24, 1, 13, '#65727b') +
  rect(11, 36, 11, 3, '#2b3742') +
  rect(12, 18, 2, 5, '#46525a') +
  rect(20, 18, 2, 5, '#414d55')
function render(kind, frame = 0) {
  const run = kind === 'run',
    gait = run || kind === 'walk',
    phase = frame / 12
  const bodyY = gait
    ? -(run
        ? Math.round(Math.sin(phase * Math.PI * 2) ** 2 * 3)
        : Math.round((1 - Math.cos(phase * Math.PI * 4)) * 0.5))
    : kind === 'slide'
      ? 10
      : 0
  const hip = [17, 38 + bodyY]
  const knee = (foot) => {
    const dx = foot[0] - hip[0],
      dy = foot[1] - hip[1],
      d = Math.hypot(dx, dy) || 1,
      h = Math.sqrt(Math.max(0, (run ? 13 : 12) ** 2 - Math.min(run ? 25.9 : 23.9, d) ** 2 / 4))
    return [(hip[0] + foot[0]) / 2 + (dy / d) * h, (hip[1] + foot[1]) / 2 - (dx / d) * h, ...foot]
  }
  const foot = (t) => {
    t = (t + 1) % 1
    const stance = run ? 0.4 : 0.6,
      spread = run ? 10 : 7
    return t < stance
      ? [17 + spread - (2 * spread * t) / stance, 61]
      : [
          17 - spread + (2 * spread * (t - stance)) / (1 - stance),
          61 - Math.sin((Math.PI * (t - stance)) / (1 - stance)) * (run ? 13 : 7),
        ]
  }
  const arm = (t) => {
    const angle = Math.cos(t * Math.PI * 2) * (run ? 0.9 : 0.55),
      sx = 17,
      sy = 21 + bodyY,
      ex = sx + Math.sin(angle) * 9,
      ey = sy + Math.cos(angle) * 9
    return run
      ? [ex, ey, ex + 7, ey - 4]
      : [ex, ey, ex + Math.sin(angle + 0.1) * 8, ey + Math.cos(angle + 0.1) * 8]
  }
  let front = [17, 50, 17, 61],
    back = [19, 50, 19, 61],
    frontArm = [15, 29, 16, 38],
    backArm = [20, 29, 21, 38]
  if (gait) {
    front = knee(foot(phase))
    back = knee(foot(phase + 0.5))
    frontArm = arm(phase + 0.5)
    backArm = arm(phase)
  } else if (kind === 'jump') {
    front = knee([24, 53])
    back = knee([10, 52])
    frontArm = [10, 24, 9, 18]
    backArm = [24, 23, 25, 17]
  } else if (kind === 'fall') {
    front = knee([20, 61])
    back = knee([12, 57])
    frontArm = [9, 28, 8, 34]
    backArm = [24, 27, 25, 33]
  } else if (kind === 'climb') {
    const flip = frame % 4 < 2
    front = knee([23, flip ? 53 : 61])
    back = knee([11, flip ? 61 : 53])
    frontArm = [23, 25, 23, flip ? 13 : 23]
    backArm = [11, 25, 11, flip ? 23 : 13]
  } else if (kind === 'slide') {
    front = knee([28, 61])
    back = knee([24, 61])
    frontArm = [19, 42, 24, 45]
    backArm = [24, 40, 27, 44]
  }
  const leg = (pose, color) =>
    limb(17, 38 + bodyY, pose, color, 4) +
    rect(
      Math.round(pose[2]) - 2,
      Math.round(pose[3]),
      6,
      3,
      color === '#344552' ? '#dedfce' : '#9eadae',
    )
  const hand = (pose, color) =>
    limb(17, 21 + bodyY, pose, color, 3) +
    rect(Math.round(pose[2]) - 1, Math.round(pose[3]), 3, 3, '#c79578')
  return `<g shape-rendering="crispEdges">${leg(back, '#25343e')}${hand(backArm, '#1a252e')}<g transform="translate(0 ${bodyY})">${head}${torso}</g>${leg(front, '#344552')}${hand(frontArm, '#303f49')}</g>`
}
const actions = [
  ['idle', 0],
  ...Array.from({ length: 12 }, (_, i) => ['walk', i]),
  ['jump', 0],
  ['fall', 0],
  ...Array.from({ length: 4 }, (_, i) => ['climb', i]),
  ['slide', 0],
  ...Array.from({ length: 12 }, (_, i) => ['run', i]),
]
await fs.mkdir('public/sprites', { recursive: true })
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${actions.length * 32}" height="64">${actions.map(([kind, frame], i) => `<g transform="translate(${i * 32} 0)">${render(kind, frame)}</g>`).join('')}</svg>`
await sharp(Buffer.from(sheet)).png().toFile('public/sprites/navi.png')
const reviewDir = process.env.CHARACTER_REVIEW_DIR
if (reviewDir) {
  await fs.mkdir(reviewDir, { recursive: true })
  const thumbnails = actions
    .map(
      ([kind, frame], i) =>
        `<g transform="translate(${(i % 8) * 112} ${Math.floor(i / 8) * 220})"><path d="M5 193h102" stroke="#8a9b81"/><g transform="translate(8 0) scale(3)">${render(kind, frame)}</g><text x="56" y="211" text-anchor="middle" font-family="sans-serif" font-size="11" fill="#3c5c4d">${kind} ${frame}</text></g>`,
    )
    .join('')
  await sharp(
    Buffer.from(
      `<svg xmlns="http://www.w3.org/2000/svg" width="896" height="880"><rect width="100%" height="100%" fill="#e0e3d4"/>${thumbnails}</svg>`,
    ),
  )
    .png()
    .toFile(`${reviewDir}/sprite-review.png`)
  for (let i = 0; i < 12; i++)
    await sharp(
      Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="64">${render('walk', i)}</svg>`,
      ),
    )
      .resize(128, 256, { kernel: 'nearest' })
      .png()
      .toFile(`${reviewDir}/navi-walk-${i}.png`)
}
console.log('Generated 32 fixed pixel frames.')
