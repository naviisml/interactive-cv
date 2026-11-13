<script setup lang="ts">
import { buildingActions } from '~/game/core/sceneActivities'
import type { ActivitySystem } from '~/game/engine/ActivitySystem'
import type { WorldModel, WorldFrame } from '~/game/rendering/types'
import type { WorldRenderer } from '~/game/rendering/WorldRenderer'
const props = defineProps<{
  activeId: string
  activities: ActivitySystem
  model: WorldModel
  getFrame: () => WorldFrame
  subscribe: (callback: () => void) => () => void
}>()
const emit = defineEmits<{
  startComputer: []
  readFallback: []
  availability: [available: boolean]
  openFirstComputer: []
  openWorkshop: [index: number]
  skill: [name: string, count: number]
  details: [index: number]
  seek: [progress: number]
}>()
const { t, locale } = useI18n()
const currentAction = computed(() => buildingActions[props.activeId])
function runAccessibleAction(index = 0) {
  const id = props.activeId,
    action = buildingActions[id]
  if (!action) return
  if (action === 'compile' || action === 'circuit') {
    if (props.activities.toggle(id, index)) props.activities.trigger(id, action)
  } else props.activities.trigger(id, action, ['basketball', 'camera', 'departure'].includes(action) ? (action === 'departure' ? 0.85 : action === 'camera' ? 0.33 : 0.65) : undefined)
}
const host = ref<HTMLElement>(),
  error = ref('')
let renderer: WorldRenderer | undefined,
  unsubscribe: (() => void) | undefined,
  disposed = false
let canvas: HTMLCanvasElement | undefined
function releaseRenderer() {
  unsubscribe?.()
  unsubscribe = undefined
  canvas?.removeEventListener('webglcontextlost', contextLost)
  renderer?.destroy()
  renderer = undefined
  canvas = undefined
}
function contextLost(event: Event) {
  event.preventDefault()
  error.value = t('common.rendererError')
  emit('availability', false)
  releaseRenderer()
}
onMounted(async () => {
  try {
    const { WorldRenderer } = await import('~/game/rendering/WorldRenderer')
    if (disposed || !host.value) return
    renderer = new WorldRenderer(host.value, props.model, props.activities, {
      startComputer: () => emit('startComputer'),
      openFirstComputer: () => emit('openFirstComputer'),
      openWorkshop: (index) => emit('openWorkshop', index),
      skill: (name, count) => emit('skill', name, count),
      details: (index) => emit('details', index),
      seek: (progress) => emit('seek', progress),
    })
    await renderer.init()
    if (disposed) return
    emit('availability', true)
    canvas = host.value.querySelector('canvas') ?? undefined
    canvas?.addEventListener('webglcontextlost', contextLost)
    unsubscribe = props.subscribe(() => renderer?.render(props.getFrame()))
    renderer.render(props.getFrame())
  } catch (cause) {
    releaseRenderer()
    if (disposed) return
    error.value = t('common.rendererError')
    emit('availability', false)
    console.error(cause)
  }
})
watch(
  () => props.model,
  (model) => renderer?.setModel(model),
)
onBeforeUnmount(() => {
  disposed = true
  releaseRenderer()
})
</script>
<template>
  <div ref="host" class="game-canvas">
    <div v-if="currentAction || activeId === 'navel-development'" class="canvas-accessibility">
      <template v-if="currentAction === 'compile' || currentAction === 'circuit'"
        ><button v-for="i in 3" :key="i" @click="runAccessibleAction(i - 1)">
          {{ t('scene.' + currentAction) }} {{ i }}
        </button></template
      >
      <button v-else-if="currentAction" @click="runAccessibleAction()">{{ t('scene.' + currentAction) }}</button>
      <button v-if="activeId === 'navel-development'" @click="emit('startComputer')">
        {{ t('company.start') }}
      </button>
    </div>
    <div v-if="error" class="renderer-fallback" role="alert">
      <strong>{{ locale === 'nl' ? 'Interactieve weergave niet beschikbaar' : 'Interactive view unavailable' }}</strong>
      <p>{{ error }}</p>
      <button @click="emit('readFallback')">
        {{ locale === 'nl' ? 'Lees mijn CV' : 'Read my CV' }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.game-canvas {
  position: absolute;
  inset: 0;
  pointer-events: auto;
}
.game-canvas :deep(canvas) {
  display: block;
  width: 100%;
  height: 100%;
}
.canvas-accessibility {
  position: absolute;
  z-index: 9;
  right: 16px;
  bottom: 110px;
  clip-path: inset(50%);
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.canvas-accessibility:focus-within {
  clip-path: none;
  width: auto;
  height: auto;
  display: flex;
  gap: 5px;
  padding: 9px;
  background: #e7e4ce;
  color: #315443;
}
.canvas-accessibility button {
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid #809875;
}
.renderer-fallback {
  position: absolute;
  inset: 0;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  background: #f4f1e9ed;
  color: #294b43;
  text-align: center;
}
.renderer-fallback strong { font: 600 clamp(18px, 3vw, 26px) 'Space Grotesk', sans-serif; }
.renderer-fallback p { padding: 0; margin: 0; max-width: 480px; font-size: 14px; line-height: 1.6; }
.renderer-fallback button {
  min-height: 46px;
  padding: 12px 20px;
  border-radius: 6px;
  background: #315747;
  color: #f9f5e9;
  font: 600 13px 'Space Grotesk', sans-serif;
}
</style>
