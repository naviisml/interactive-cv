import fs from 'node:fs/promises'
import sharp from 'sharp'
// Keep the Figma originals untouched; only the runtime PNG decode size changes.
for (const name of await fs.readdir('art/skills')) {
  if (!name.endsWith('.png')) continue
  await sharp(`art/skills/${name}`)
    .resize({ width: 160, height: 160, fit: 'inside', withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(`public/skills/${name}`)
}
