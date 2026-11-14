<script setup lang="ts">
import { codePreviewDocument } from '~/game/core/codePreview'
import { Code2, RotateCcw, X } from '@lucide/vue'

const emit = defineEmits<{ close: [] }>()
const { locale } = useI18n()
const initialHtml =
  '<main class="retro"><h1>RetroNet</h1><p>My first website</p><button>Enter the community</button></main>'
const initialCss =
  'body { font-family: Arial, sans-serif; background: #d7e2d3; }\n.retro { max-width: 360px; margin: 35px auto; padding: 24px; background: white; border: 3px solid #43694f; }\nh1 { color: #43694f; }\nbutton { background: #43694f; color: white; padding: 10px 15px; border: 0; }\n@media (max-width: 480px) { .retro { margin: 8px; padding: 12px; border-width: 2px; } .retro h1 { font-size: 22px; margin: 0 0 8px; } .retro p { margin: 0 0 10px; } }'
const html = useState('first-code-html', () => initialHtml)
const css = useState('first-code-css', () => initialCss)
const tab = ref<'html' | 'css'>('html')
const mobilePane = ref<'editor' | 'preview'>('editor')
const dialog = ref<HTMLElement>()
const preview = ref(codePreviewDocument(html.value, css.value))
let previewTimer: ReturnType<typeof setTimeout> | undefined
watch([html, css], () => {
  clearTimeout(previewTimer)
  previewTimer = setTimeout(() => {
    preview.value = codePreviewDocument(html.value, css.value)
  }, 180)
})
onBeforeUnmount(() => clearTimeout(previewTimer))

function reset() {
  html.value = initialHtml
  css.value = initialCss
}
function handleKey(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('close')
  }
  if (event.key !== 'Tab' || !dialog.value) return
  const elements = [...dialog.value.querySelectorAll<HTMLElement>('button, textarea')]
  const first = elements[0]
  const last = elements.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onMounted(() => dialog.value?.querySelector<HTMLButtonElement>('.code-close')?.focus())
</script>

<template>
  <section
    ref="dialog"
    class="first-code-lab"
    data-world-panel
    role="region"
    aria-labelledby="code-lab-title"
    @keydown="handleKey"
  >
    <div class="lab-window">
      <header class="lab-header">
        <div class="lab-heading">
          <Code2 :size="21" aria-hidden="true" />
          <span>{{ locale === 'nl' ? '2011 / Mijn eerste code' : '2011 / My first code' }}</span>
        </div>
        <button
          class="code-close"
          :aria-label="locale === 'nl' ? 'Sluiten' : 'Close'"
          @click="emit('close')"
        >
          <X :size="21" />
        </button>
      </header>
      <div class="lab-intro">
        <h2 id="code-lab-title">{{ locale === 'nl' ? 'Ontdek de code' : 'Explore the code' }}</h2>
        <p>
          {{
            locale === 'nl'
              ? 'Zo begon het: HTML en CSS aanpassen, zien wat verandert en begrijpen waarom. Bewerk de code en bekijk direct het resultaat.'
              : 'This is how it started: editing HTML and CSS, watching what changed, and finding out why. Change the code and see the result instantly.'
          }}
        </p>
      </div>
      <div
        class="lab-mobile-switch"
        role="group"
        :aria-label="locale === 'nl' ? 'Werkruimte' : 'Workspace'"
      >
        <button :aria-pressed="mobilePane === 'editor'" @click="mobilePane = 'editor'">
          {{ locale === 'nl' ? 'Code bewerken' : 'Edit code' }}
        </button>
        <button :aria-pressed="mobilePane === 'preview'" @click="mobilePane = 'preview'">
          {{ locale === 'nl' ? 'Live voorbeeld' : 'Live preview' }}
        </button>
      </div>
      <div class="lab-workbench" :class="{ 'mobile-preview': mobilePane === 'preview' }">
        <div class="lab-editor">
          <div class="editor-toolbar">
            <div role="group" :aria-label="locale === 'nl' ? 'Code kiezen' : 'Choose code'">
              <button :aria-pressed="tab === 'html'" @click="tab = 'html'">index.html</button>
              <button :aria-pressed="tab === 'css'" @click="tab = 'css'">style.css</button>
            </div>
            <button class="reset-button" @click="reset">
              <RotateCcw :size="14" /> {{ locale === 'nl' ? 'Herstel' : 'Reset' }}
            </button>
          </div>
          <label class="editor-label" for="first-code-editor">{{
            tab === 'html' ? 'HTML' : 'CSS'
          }}</label>
          <textarea
            v-if="tab === 'html'"
            id="first-code-editor"
            v-model="html"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            aria-label="HTML editor"
          />
          <textarea
            v-else
            id="first-code-editor"
            v-model="css"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            aria-label="CSS editor"
          />
        </div>
        <div class="lab-preview">
          <div class="preview-toolbar">
            <span class="preview-dot" /> {{ locale === 'nl' ? 'Live voorbeeld' : 'Live preview' }}
          </div>
          <iframe :srcdoc="preview" sandbox="" title="Editable HTML preview" />
        </div>
      </div>
      <footer>
        <p>
          {{
            locale === 'nl'
              ? 'Alleen HTML en CSS. Je wijzigingen blijven in dit voorbeeld.'
              : 'HTML and CSS only. Your changes stay in this preview.'
          }}
        </p>
        <button @click="emit('close')">
          {{ locale === 'nl' ? 'Terug naar de reis' : 'Back to the journey' }}
        </button>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.first-code-lab {
  position: absolute;
  inset: 0;
  z-index: 28;
  display: grid;
  place-items: center;
  padding: 0;
  background: #223b35;
  border: 0;
  border-radius: 0;
  overflow: auto;
  color: #d7e5d2;
  user-select: text;
  -webkit-user-select: text;
  touch-action: pan-y;
}
.lab-window {
  container-type: size;
  container-name: code-window;
  width: 100%;
  height: 100%;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  background: #223b35;
  border: 0;
  box-shadow: none;
  overflow-x: hidden;
  overflow-y: hidden;
  overscroll-behavior: contain;
}
.lab-header,
.lab-heading,
.editor-toolbar,
.editor-toolbar > div,
footer {
  display: flex;
  align-items: center;
}
.lab-header {
  flex-shrink: 0;
  justify-content: space-between;
  padding: 9px 16px;
  background: #152d28;
  border-bottom: 1px solid #517866;
}
.lab-heading {
  gap: 10px;
  font: 600 12px 'Space Grotesk';
  letter-spacing: 0.04em;
}
.code-close {
  display: grid;
  place-items: center;
  min-width: 44px;
  min-height: 44px;
}
.lab-intro {
  flex-shrink: 0;
  padding: 16px 22px;
}
.lab-intro h2 {
  font: 500 clamp(22px, 3vw, 33px) 'Space Grotesk';
  margin: 0 0 6px;
}
.lab-intro p {
  font-size: 13px;
  line-height: 1.6;
  max-width: 750px;
  color: #bed0be;
}
.lab-mobile-switch {
  display: none;
}
.lab-workbench {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 0;
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  border-block: 1px solid #547565;
}
.lab-editor,
.lab-preview {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.lab-editor {
  border-right: 1px solid #547565;
}
.editor-toolbar,
.preview-toolbar {
  min-height: 43px;
  background: #2d4a40;
  font: 11px 'Space Grotesk';
}
.editor-toolbar {
  justify-content: space-between;
}
.editor-toolbar button {
  min-height: 44px;
  padding: 8px 13px;
}
.editor-toolbar button[aria-pressed='true'] {
  background: #d9e1cd;
  color: #284739;
}
.reset-button {
  display: flex;
  align-items: center;
  gap: 5px;
}
.editor-label {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
textarea {
  width: 100%;
  min-height: 240px;
  flex: 1;
  border: 0;
  resize: vertical;
  padding: 16px;
  outline-offset: -3px;
  color: #d0eecf;
  background: #182b28;
  font:
    12px/1.8 ui-monospace,
    SFMono-Regular,
    Consolas,
    monospace;
  tab-size: 2;
}
.preview-toolbar {
  display: flex;
  align-items: center;
  gap: 9px;
  padding-inline: 13px;
  color: #d5e7d3;
}
.preview-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #a1cd8f;
}
iframe {
  border: 0;
  width: 100%;
  flex: 1;
  min-height: 245px;
  background: #fff;
}
footer {
  flex-shrink: 0;
  padding: 11px 16px;
  justify-content: space-between;
  gap: 20px;
}
footer p {
  color: #b4c9b7;
  font-size: 11px;
  line-height: 1.5;
  margin: 0;
}
footer button {
  min-height: 44px;
  white-space: nowrap;
  background: #dbe4cb;
  color: #254639;
  padding: 10px 14px;
  font: 12px 'Space Grotesk';
}
button:focus-visible,
textarea:focus-visible {
  outline: 3px solid #e8cc90;
  outline-offset: -3px;
}
@media (max-width: 680px) {
  .first-code-lab {
    padding: 0;
  }
  .lab-window {
    min-height: 0;
    height: 100%;
  }
  .lab-header {
    position: relative;
    top: auto;
    z-index: 2;
  }
  .lab-intro {
    padding: 11px 16px;
  }
  .lab-intro h2 {
    font-size: 22px;
  }
  .lab-intro p {
    font-size: 12px;
    line-height: 1.5;
    margin: 6px 0 0;
  }
  .lab-mobile-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    flex-shrink: 0;
    border-top: 1px solid #527263;
    background: #152f29;
    padding: 5px;
    gap: 4px;
  }
  .lab-mobile-switch button {
    min-height: 44px;
    padding: 9px 8px;
    font:
      600 12px 'Space Grotesk',
      sans-serif;
    border-radius: 4px;
    color: #bed1be;
  }
  .lab-mobile-switch button[aria-pressed='true'] {
    background: #dbe5ce;
    color: #254839;
  }
  .lab-workbench {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
  }
  .lab-workbench .lab-editor,
  .lab-workbench .lab-preview {
    flex: 1 1 auto;
    min-height: 0;
    border: 0;
  }
  .lab-workbench .lab-preview {
    display: none;
  }
  .lab-workbench.mobile-preview .lab-editor {
    display: none;
  }
  .lab-workbench.mobile-preview .lab-preview {
    display: flex;
  }
  textarea {
    min-height: 0;
    max-height: none;
    resize: none;
    flex: 1 1 auto;
    overflow: auto;
    font-size: 13px;
  }
  iframe {
    min-height: 0;
    height: 100%;
    flex: 1 1 auto;
    display: block;
  }
  footer {
    display: flex;
    align-items: center;
    flex-direction: row;
    padding: 9px 12px;
    gap: 10px;
  }
  footer p {
    font-size: 10px;
    max-width: 55%;
  }
  footer button {
    min-height: 44px;
    white-space: normal;
    text-align: center;
  }
}
@media (max-width: 680px) and (max-height: 740px) {
  .lab-header {
    padding: 4px 12px;
  }
  .lab-intro {
    padding: 8px 12px;
  }
  .lab-intro h2 {
    font-size: 19px;
  }
  .lab-intro p {
    display: none;
  }
  .lab-mobile-switch {
    padding: 3px;
  }
  .lab-mobile-switch button {
    min-height: 40px;
  }
  .preview-toolbar,
  .editor-toolbar {
    min-height: 38px;
  }
  footer {
    padding: 6px 10px;
  }
  footer p {
    display: none;
  }
  footer button {
    width: 100%;
  }
}
@container code-window (max-height: 420px) {
  .lab-intro {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
  }
  footer {
    display: none;
  }
}
</style>
