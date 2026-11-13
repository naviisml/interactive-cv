<script setup lang="ts">
import { skillGroups } from '~/content/skills'
import { circuitConnected, pipelineSteps, type PipelineStep } from '~/game/core/learningActivities'
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
  skill: [name: string, count: number]
  details: [index: number]
  seek: [progress: number]
}>()
const { t, locale } = useI18n()
const currentAction = computed(() => buildingActions[props.activeId])
const currentIndex = computed(() => props.model.entries.find((entry) => entry.event.id === props.activeId)?.index)

function runAccessibleAction(index = 0) {
  const id = props.activeId,
    action = buildingActions[id]
  if (!action) return
  if (action === 'circuit')
    props.activities.circuit[index] = (props.activities.circuit[index]! + 1) % 4
  else if (action === 'compile') {
    if (index === 3) props.activities.runRover()
    else props.activities.editRover((['step', 'jump', 'undo'] as const)[index]!)
  } else
    props.activities.trigger(
      id,
      action,
      ['basketball', 'camera', 'departure'].includes(action)
        ? action === 'departure'
          ? 0.85
          : action === 'camera'
            ? 0.33
            : 0.65
        : undefined,
    )
}
function activateSkills(index: number) {
  if (props.activities.activateSkillGroup(index))
    emit(
      'skill',
      skillGroups[index]!.title[locale.value === 'nl' ? 'nl' : 'en'],
      props.activities.exploredSkills.length,
    )
}
function runPipelineStep(step: PipelineStep) {
  activateSkills(0)
  props.activities.playPipelineStep(step)
}
function adjustWeb(action: 'theme' | 'data') {
  activateSkills(1)
  if (action === 'theme') props.activities.web.theme = (props.activities.web.theme + 1) % 3
  else props.activities.web.records = (props.activities.web.records % 3) + 1
}
function scaleWorkers(workers: number) {
  activateSkills(2)
  props.activities.cloud.workers = workers
}
const learningStatus = ref('')
let lastLearningReadout = 0
function readLearningStatus() {
  if (performance.now() - lastLearningReadout < 300) return
  lastLearningReadout = performance.now()
  const nl = locale.value === 'nl'
  learningStatus.value =
    props.activeId === 'roc-hilversum'
      ? circuitConnected(props.activities.circuit)
        ? nl
          ? 'Verbonden. De campus is verlicht.'
          : 'Connected. The campus is lit.'
        : nl
          ? 'Draai de kabels om de bron met de lamp te verbinden.'
          : 'Rotate the wires to connect the source to the lamp.'
      : props.activeId === 'coding-college'
        ? `${props.activities.rover.commands.join(', ')} · ${props.activities.rover.status}`
        : ''
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
      skill: (name, count) => emit('skill', name, count),
      details: (index) => emit('details', index),
      seek: (progress) => emit('seek', progress),
    })
    await renderer.init()
    if (disposed) return
    emit('availability', true)
    canvas = host.value.querySelector('canvas') ?? undefined
    canvas?.addEventListener('webglcontextlost', contextLost)
    unsubscribe = props.subscribe(() => {
      renderer?.render(props.getFrame())
      readLearningStatus()
    })
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
defineExpose({ interactNearest: () => renderer?.interactNearest() ?? false })
</script>
<template>
  <div ref="host" class="game-canvas">
    <div
      v-if="currentAction || activeId === 'navel-development' || activeId === 'skills-road' || activeId === 'first-lines'"
      class="canvas-accessibility"
      @keydown.esc.stop.prevent="host?.closest<HTMLElement>('.world')?.focus()"
    >
      <button v-if="activeId === 'first-lines'" @click="emit('openFirstComputer')">
        {{ locale === 'nl' ? 'Open de eerste computer' : 'Open the first computer' }}
      </button>
      <button v-if="currentAction && currentIndex !== undefined"
        @click="emit('details', currentIndex)">
        {{ t('building.enter') }}
      </button>
      <template v-if="currentAction === 'circuit'">
        <button v-for="i in 6" :key="i" @click="runAccessibleAction(i - 1)">
          {{ locale === 'nl' ? 'Draai kabel' : 'Rotate wire' }} {{ i }}
        </button>
      </template>
      <template v-else-if="currentAction === 'compile'">
        <button
          v-for="(command, index) in locale === 'nl'
            ? ['Stap', 'Spring', 'Verwijder stap', 'Voer programma uit']
            : ['Step', 'Jump rover', 'Undo command', 'Run program']"
          :key="command"
          @click="runAccessibleAction(index)"
        >
          {{ command }}
        </button>
      </template>
      <button v-else-if="currentAction" @click="runAccessibleAction()">
        {{ t('scene.' + currentAction) }}
      </button>
      <template v-if="activeId === 'skills-road'">
        <button v-for="step in pipelineSteps" :key="step" @click="runPipelineStep(step)">
          Pipeline: {{ step }}
        </button>
        <button
          v-for="(group, index) in skillGroups"
          :key="group.id"
          @click="activateSkills(index)"
        >
          {{ locale === 'nl' ? 'Activeer' : 'Activate' }}
          {{ group.title[locale === 'nl' ? 'nl' : 'en'] }}
        </button>
      </template>
      <template v-if="activeId === 'skills-road'">
        <button @click="adjustWeb('theme')">
          {{ locale === 'nl' ? 'Wijzig CSS-stijl' : 'Change CSS theme' }}
        </button>
        <button @click="adjustWeb('data')">
          {{ locale === 'nl' ? 'Laad API-data' : 'Load API data' }}
        </button>
        <button v-for="workers in 3" :key="workers" @click="scaleWorkers(workers)">
          {{ workers }} {{ locale === 'nl' ? 'workers' : 'workers' }}
        </button>
      </template>
      <span v-if="learningStatus" role="status">{{ learningStatus }}</span>
      <button v-if="activeId === 'navel-development'" @click="emit('startComputer')">
        {{ t('company.start') }}
      </button>
    </div>
    <div v-if="error" class="renderer-fallback" role="alert">
      <strong>{{
        locale === 'nl' ? 'Interactieve weergave niet beschikbaar' : 'Interactive view unavailable'
      }}</strong>
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
  max-width: min(360px, calc(100% - 32px));
  height: auto;
  display: flex;
  flex-wrap: wrap;
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
.renderer-fallback strong {
  font:
    600 clamp(18px, 3vw, 26px) 'Space Grotesk',
    sans-serif;
}
.renderer-fallback p {
  padding: 0;
  margin: 0;
  max-width: 480px;
  font-size: 14px;
  line-height: 1.6;
}
.renderer-fallback button {
  min-height: 46px;
  padding: 12px 20px;
  border-radius: 6px;
  background: #315747;
  color: #f9f5e9;
  font:
    600 13px 'Space Grotesk',
    sans-serif;
}
</style>
