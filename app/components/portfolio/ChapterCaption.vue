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
const emit = defineEmits<{ details: [event: MouseEvent]; cancel: []; enter: [event: MouseEvent] }>()
const { t, locale } = useI18n()
const sceneHints: Record<string, [string, string]> = {
  'first-lines': [
    'Open de monitor om HTML en CSS te bewerken.',
    'Open the monitor to edit HTML and CSS.',
  ],
  'navel-development': [
    'Open het scherm om mijn projecten te bekijken.',
    'Select the project screen to explore my work.',
  ],
  'panta-rhei': [
    'Houd de bal vast en laat los om te schieten.',
    'Hold the ball and release to shoot.',
  ],
  'roc-hilversum': [
    'Draai de kabels en breng de campus tot leven.',
    'Rotate the wires to power the campus.',
  ],
  'coding-college': [
    'Programmeer de rover. Spring over de gaten.',
    'Program the rover. Jump across the gaps.',
  ],
  fletcher: [
    'Tik op de bel bij de ingang voor de bagage.',
    'Ring the bell at the entrance for luggage.',
  ],
  'get-e': [
    'Houd het vliegtuig vast om snelheid op te bouwen, laat los om op te stijgen.',
    'Hold the aircraft to build speed, release to take off.',
  ],
  appjection: [
    'Houd de auto vast om te accelereren en laat los bij de juiste snelheid.',
    'Hold the car to accelerate, release at a safe speed.',
  ],
}
</script>
<template>
  <header class="world-caption" :class="{ 'is-intro': current.id === 'first-lines' }">
    <p v-if="current.id === 'first-lines'" class="identity-banner">
      <strong>Navarone Ismail</strong>
      <span>{{
        locale === 'nl'
          ? 'Full-stack developer · Technisch lead'
          : 'Full-stack developer · Technical lead'
      }}</span>
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
        @click="emit('enter', $event)"
      >
        <DoorOpen :size="18" />{{ t('building.enter') }}<kbd aria-hidden="true">E</kbd>
      </button>
    </div>
    <p class="caption-summary">{{ current.summary }}</p>
    <p
      v-if="sceneHints[current.id] && !running"
      class="scene-hint"
    >
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
  display: grid;
  justify-items: start;
  gap: 9px;
  width: fit-content;
  max-width: 100%;
  margin: 0 0 clamp(16px, 3vw, 28px);
  color: #244b3e;
}
.identity-banner strong {
  font: 700 clamp(32px, 5vw, 66px)/.98 'Space Grotesk', sans-serif;
  letter-spacing: -.06em;
  text-wrap: balance;
}
.identity-banner span {
  font: 600 clamp(12px, 1.2vw, 15px)/1.5 'DM Sans', sans-serif;
  color: #446c58;
  letter-spacing: .012em;
}
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
  width: fit-content;
  max-width: 100%;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  margin: 12px 0 0;
  padding: 7px 12px;
  border: 1px solid #acbca3;
  border-left: 3px solid #4e785d;
  border-radius: 0 5px 5px 0;
  background: #f5f2e9de;
  color: #294e3e;
  box-shadow: 0 3px 14px #1f483816;
}
@media (max-width: 700px) {
  .identity-banner { gap: 6px; margin-bottom: 17px; }
  .identity-banner strong { font-size: clamp(29px, 8.5vw, 39px); }
  .identity-banner span { font-size: 12px; }
  .scene-hint { font-size: 11px; max-width: 325px; margin-top: 9px; padding: 6px 10px; }
}

@media (max-width: 700px) and (max-height: 740px) {
  .world-caption.is-intro .identity-banner { gap: 3px; margin-bottom: 8px; }
  .world-caption.is-intro .identity-banner strong { font-size: 26px; }
  .world-caption.is-intro .caption-summary { display: none; }
  .world-caption.is-intro .scene-hint { margin-top: 6px; }
}
@media (pointer: coarse) {
  .caption-enter kbd {
    display: none;
  }
}
</style>
