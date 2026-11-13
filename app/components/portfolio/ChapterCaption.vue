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
  'first-lines': ['Open de monitor om HTML en CSS te bewerken.', 'Open the monitor to edit HTML and CSS.'],
  'navel-development': ['Open het scherm om mijn projecten te bekijken.', 'Select the project screen to explore my work.'],
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
    <p v-if="current.id === 'first-lines'" class="identity-banner">
      <strong>Navarone Ismail</strong>
      <span>{{ locale === 'nl' ? 'Full-stack developer · Technisch lead' : 'Full-stack developer · Technical lead' }}</span>
    </p>
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
    <button
      v-if="enterable && !running"
      class="caption-details caption-enter"
      :aria-label="t('building.enter')"
      @click="emit('enter')"
    >
      <DoorOpen :size="18" />{{ t('building.enter') }}<kbd aria-hidden="true">E</kbd>
    </button>
    </div>
    <p class="caption-summary">{{ current.summary }}</p>
    <p v-if="sceneHints[current.id] && !running" class="scene-hint" :class="{ 'sr-only': current.id !== 'first-lines' && current.id !== 'navel-development' }">
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
.identity-banner {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  width: fit-content;
  margin: 0 0 13px;
  padding-bottom: 8px;
  border-bottom: 1px solid #6b8b7580;
  font: 600 11px 'Space Grotesk', sans-serif;
  color: #2b5345;
}
.identity-banner strong { text-transform: uppercase; letter-spacing: 1.15px; }
.identity-banner span { font-weight: 500; color: #4c6a59; }
.sr-only {
  position: absolute;
  height: 1px;
  width: 1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.scene-hint {
  font-size: 12px;
  font-weight: 500;
  margin-top: 10px;
  padding-left: 12px;
  border-left: 2px solid #66836b;
  color: #365f4b;
}
@media (max-width: 700px) {
  .scene-hint {
    font-size: 12px;
    max-width: 290px;
  }
}

@media (pointer: coarse) {
  .caption-enter kbd {
    display: none;
  }
}
</style>
