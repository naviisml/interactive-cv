<script setup lang="ts">
import { FileText, DoorOpen } from '@lucide/vue'
import { hasDetails, type TimelineEvent } from '~/content/timeline'
defineProps<{
  current: TimelineEvent
  running: boolean
  destinationTitle?: string
  feedback?: string
  enterable?: boolean
}>()
const emit = defineEmits<{ details: [event: MouseEvent]; cancel: []; enter: [] }>()
const { t, locale } = useI18n()
const sceneHints: Record<string, [string, string]> = {
  'panta-rhei': ['Houd de bal vast en laat los om te schieten.', 'Hold the ball and release to shoot.'],
  'roc-hilversum': [
    'Tik op de werkbank om de verbinding te maken.',
    'Tap the workstation to connect the circuit.',
  ],
  'coding-college': [
    'Tik op de computer: bouwen, testen, uitvoeren.',
    'Tap the computer: build, test, run.',
  ],
  fletcher: [
    'Tik op de bel bij de ingang voor de bagage.',
    'Ring the bell at the entrance for luggage.',
  ],
  'get-e': ['Houd het vliegtuig vast om snelheid op te bouwen, laat los om op te stijgen.', 'Hold the aircraft to build speed, release to take off.'],
  appjection: [
    'Houd de auto vast om te accelereren en laat los bij de juiste snelheid.',
    'Hold the car to accelerate, release at a safe speed.',
  ],
}
</script>
<template>
  <header class="world-caption">
    <p class="caption-meta">
      <CategoryBadge :category="current.category" /><span
        v-if="current.label !== 'SKILLS' && current.category !== 'contact'"
        >{{ current.label }}</span
      >
    </p>
    <div class="caption-title">
      <h1>{{ current.title }}</h1>
      <button
        v-if="hasDetails(current) && current.category !== 'work' && current.category !== 'school'"
        class="caption-details"
        aria-haspopup="dialog"
        :aria-label="t('common.detailsAbout', { title: current.title })"
        @click="emit('details', $event)"
      >
        <FileText :size="16" aria-hidden="true" />{{ t('common.details') }}
      </button>
    </div>
    <button
      v-if="enterable && !running"
      class="caption-details caption-enter"
      :aria-label="t('building.enter')"
      @click="emit('enter')"
    >
      <DoorOpen :size="18" />{{ t('building.enter') }}<kbd aria-hidden="true">E</kbd>
    </button>
    <p class="caption-summary">{{ current.summary }}</p>
    <p v-if="sceneHints[current.id] && !running" class="scene-hint">
      {{ sceneHints[current.id]?.[locale === 'nl' ? 0 : 1] }}
    </p>
    <a v-if="current.id === 'contact'" class="caption-details" href="mailto:contact@navel.dev"
      >contact@navel.dev</a
    >
    <p v-if="running" class="caption-travel" role="status">
      <span>{{ t('common.running', { title: destinationTitle }) }}</span><button
        @click="emit('cancel')"
      >
        {{ t('common.cancel') }}
      </button>
    </p>
    <p v-if="feedback" class="caption-activity" role="status">{{ feedback }}</p>
  </header>
</template>

<style scoped>
.scene-hint {
  font-size: 12px;
  margin-top: 8px;
  color: #395c50;
}
@media (max-width: 700px) {
  .scene-hint {
    font-size: 11px;
    max-width: 290px;
  }
}

@media (pointer: coarse) {
  .caption-enter kbd {
    display: none;
  }
}
</style>
