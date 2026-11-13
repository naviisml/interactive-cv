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
  openFirstComputer: []
  openWorkshop: [index: number]
  skill: [name: string, count: number]
  details: [index: number]
  seek: [progress: number]
}>()
const { t } = useI18n()
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
    unsubscribe = props.subscribe(() => renderer?.render(props.getFrame()))
    renderer.render(props.getFrame())
  } catch (cause) {
    error.value = t('common.rendererError')
    console.error(cause)
  }
})
watch(
  () => props.model,
  (model) => renderer?.setModel(model),
)
onBeforeUnmount(() => {
  disposed = true
  unsubscribe?.()
  renderer?.destroy()
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
    <p v-if="error" role="alert">{{ error }}</p>
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
.game-canvas p {
  padding: 130px 20px;
  color: #294b43;
}
</style>
