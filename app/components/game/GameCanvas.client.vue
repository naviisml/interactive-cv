<script setup lang="ts">
import type { ActivitySystem } from '~/game/engine/ActivitySystem'
import type { WorldModel, WorldFrame } from '~/game/rendering/types'
import type { WorldRenderer } from '~/game/rendering/WorldRenderer'
const props = defineProps<{
  activities: ActivitySystem
  model: WorldModel
  getFrame: () => WorldFrame
  subscribe: (callback: () => void) => () => void
}>()
const emit = defineEmits<{
  unlockRoute: []
  skill: [name: string, count: number]
  details: [index: number]
  seek: [progress: number]
}>()
const { t } = useI18n()
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
      unlock: () => emit('unlockRoute'),
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
.game-canvas p {
  padding: 130px 20px;
  color: #294b43;
}
</style>
