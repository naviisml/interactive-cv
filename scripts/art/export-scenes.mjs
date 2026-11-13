import { parse, compileScript } from '@vue/compiler-sfc'
import ts from 'typescript'
import fs from 'node:fs/promises'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
const source = await fs.readFile('art/scenes/FirstLines.vue', 'utf8')
const compiled = compileScript(parse(source).descriptor, { id: 'scene-art', inlineTemplate: true })
await fs.mkdir('node_modules/.cache', { recursive: true })
await fs.writeFile(
  'node_modules/.cache/story-art.mjs',
  ts.transpileModule(compiled.content, {
    compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext },
  }).outputText,
)
const component = (await import('../../node_modules/.cache/story-art.mjs')).default
await fs.mkdir('public/world/scenes', { recursive: true })
for (const id of ['first-lines']) {
  const html = await renderToString(createSSRApp({ render: () => h(component, { active: true }) }))
  const svg = html
    .match(/<svg[\s\S]*?<\/svg>/)[0]
    .replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="310" ')
  await fs.writeFile(`public/world/scenes/${id}.svg`, svg.replace(/\sdata-v-[\w-]+(?=[\s>])/g, ''))
}
