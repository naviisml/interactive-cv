import sharp from 'sharp'
import fs from 'node:fs/promises'
await fs.mkdir('public/world/textures', { recursive: true })
let seed = 713
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
for (const [name, palette] of [['earth', [0x294a3e, 0x315347, 0x3b5947, 0x45604b, 0x4c6350]]]) {
  const size = 64,
    pixels = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const tone = palette[Math.floor(random() * palette.length)]
      const offset = (y * size + x) * 4
      pixels[offset] = tone >> 16
      pixels[offset + 1] = (tone >> 8) & 255
      pixels[offset + 2] = tone & 255
      pixels[offset + 3] = 255
    }
  // Coarse pixel grains keep the texture quiet at a one-pixel render scale.
  const image = await sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .resize(16, 16, { kernel: 'nearest' })
    .resize(size, size, { kernel: 'nearest' })
    .png()
    .toBuffer()
  await fs.writeFile(`public/world/textures/${name}.png`, image)
}
