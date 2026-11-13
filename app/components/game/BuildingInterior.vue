<script setup lang="ts">
import { DoorOpen, BriefcaseBusiness, GraduationCap, Layers, ArrowRight, X } from '@lucide/vue'
import type { TimelineEvent } from '~/content/timeline'
import { storyParagraphs } from '~/content/timeline'
import { buildings } from '~/content/buildings'
const props = defineProps<{ event: TimelineEvent }>()
const emit = defineEmits<{ leave: [] }>()
const { t, locale } = useI18n()
const technicalNotes = computed(() => storyParagraphs(props.event).slice(0, 2))
const technicalTags = computed(() => {
  const tags = props.event.tags?.filter(Boolean) ?? []
  return tags.length
    ? tags
    : [props.event.role, props.event.location].filter((value): value is string => !!value)
})
const tab = ref(0),
  room = ref<HTMLElement>()
const sections = computed(() => [
  {
    title: t('building.story'),
    icon: props.event.category === 'school' ? GraduationCap : BriefcaseBusiness,
    text: [props.event.summary, ...storyParagraphs(props.event)],
  },
  {
    title: t('building.stack'),
    icon: Layers,
    text: props.event.tags?.length
      ? props.event.tags
      : [props.event.role ?? props.event.chapter, props.event.period ?? props.event.label],
  },
])
function key(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('leave')
  }
  if (event.key !== 'Tab') return
  const controls = [...room.value!.querySelectorAll<HTMLElement>('button,a[href]')],
    first = controls[0],
    last = controls.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onMounted(() => room.value?.querySelector<HTMLButtonElement>('button')?.focus())
</script>
<template>
  <section
    ref="room"
    class="building-interior"
    :data-building="buildings[event.id]"
    data-world-panel
    role="dialog"
    aria-modal="true"
    aria-labelledby="room-title"
    @keydown="key"
  >
    <div class="room-windows" aria-hidden="true"><i /><i /><i /></div>
    <div class="room-floor" aria-hidden="true" />
    <header class="room-header">
      <span>{{
        t(event.category === 'school' ? 'building.education' : 'building.workplace')
      }}</span><button @click="emit('leave')" :aria-label="t('building.leave')">
        <X :size="23" />
      </button>
    </header>
    <div class="room-content">
      <div class="room-intro">
        <p class="room-period">
          {{ event.period || event.label }}
          <span v-if="event.location">· {{ event.location }}</span>
        </p>
        <h2 id="room-title">{{ event.title }}</h2>
        <p class="room-role">{{ event.role }}</p>
      </div>
      <div class="room-detail">
        <nav
          v-if="event.category !== 'school'"
          class="room-tabs"
          :aria-label="t('building.explore')"
        >
          <button
            v-for="(section, i) in sections"
            :key="i"
            :aria-pressed="tab === i"
            @click="tab = i"
          >
            <component :is="section.icon" :size="18" />{{ section.title }}
          </button>
        </nav>
        <div class="room-board" :class="{ 'is-stack': tab === 1 }" aria-live="polite" :key="tab">
          <template v-if="tab === 0"
            ><p v-for="(paragraph, i) in sections[0]!.text" :key="i">{{ paragraph }}</p>
            <ul v-if="event.category === 'school' && event.tags?.length" class="stack-tags">
              <li v-for="tag in event.tags" :key="tag">{{ tag }}</li>
            </ul></template
          >
          <template v-else>
            <div class="stack-layout">
              <div class="stack-main">
                <p class="stack-kicker">
                  {{ locale === 'nl' ? 'ROL & CONTEXT' : 'ROLE & CONTEXT' }}
                </p>
                <h3>{{ event.chapter }}</h3>
                <p class="stack-lead">{{ event.summary }}</p>
                <dl class="stack-facts">
                  <div v-if="event.role">
                    <dt>{{ locale === 'nl' ? 'Functie' : 'Role' }}</dt>
                    <dd>{{ event.role }}</dd>
                  </div>
                  <div v-if="event.period">
                    <dt>{{ locale === 'nl' ? 'Periode' : 'Period' }}</dt>
                    <dd>{{ event.period }}</dd>
                  </div>
                  <div v-if="event.location">
                    <dt>{{ locale === 'nl' ? 'Locatie' : 'Location' }}</dt>
                    <dd>{{ event.location }}</dd>
                  </div>
                  <div v-if="event.via">
                    <dt>{{ locale === 'nl' ? 'Opdracht via' : 'Assignment via' }}</dt>
                    <dd>{{ event.via }}</dd>
                  </div>
                </dl>
              </div>
              <div class="stack-side">
                <p class="stack-kicker">
                  {{ locale === 'nl' ? 'TECHNOLOGIE & VAARDIGHEDEN' : 'TECHNOLOGY & SKILLS' }}
                </p>
                <ul class="stack-tags">
                  <li v-for="item in technicalTags" :key="item">{{ item }}</li>
                </ul>
                <p v-if="technicalNotes.length" class="stack-note">{{ technicalNotes[0] }}</p>
              </div>
            </div>
          </template>
        </div>
        <footer>
          <button class="room-exit" @click="emit('leave')">
            <DoorOpen :size="20" />{{ t('building.leave') }}<ArrowRight :size="18" /></button
          ><NuxtLink v-if="event.category === 'work'" :to="`/events/${event.id}`"
            >{{ t('common.fullPage') }} ↗</NuxtLink
          >
        </footer>
      </div>
    </div>
  </section>
</template>
<style scoped>
.building-interior {
  --room-wall: #466a5c;
  --room-contrast: #e6eee0;
  position: absolute;
  inset: 0;
  z-index: 25;
  isolation: isolate;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  user-select: text;
  -webkit-user-select: text;
  background:
    radial-gradient(ellipse at 75% 16%, #d7d8a522 0, transparent 40%),
    linear-gradient(125deg, var(--room-wall), #203f38);
  color: var(--room-contrast);
  box-shadow: inset 0 0 0 7px #16392d40;
  animation: enter-room 0.28s ease-out;
}
.building-interior[data-building='hotel'] {
  --room-wall: #736c52;
}
.building-interior[data-building='airport'] {
  --room-wall: #456c70;
}
.building-interior[data-building='mobility'] {
  --room-wall: #4d6464;
}
.building-interior[data-building='codam'] {
  --room-wall: #325e57;
}

.room-windows {
  position: absolute;
  inset: 90px 4% 85px;
  display: flex;
  justify-content: space-between;
  opacity: 0.11;
  z-index: -2;
  pointer-events: none;
}
.room-windows i {
  width: 21%;
  max-height: 320px;
  border: 10px solid #15352e;
  background:
    linear-gradient(90deg, transparent 47%, #15352e 47% 52%, transparent 52%),
    linear-gradient(transparent 51%, #15352e 51% 55%, transparent 55%), #f0e2b6;
  box-shadow: 0 18px 0 #173a2f;
}
.room-floor {
  position: absolute;
  inset: auto 0 0;
  height: 75px;
  z-index: -1;
  background: repeating-linear-gradient(90deg, #294d3b66 0 39px, #9baf7b40 40px 42px);
  border-top: 8px solid #d8d4a73b;
  pointer-events: none;
}
.room-header {
  position: sticky;
  top: 0;
  z-index: 3;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 13px clamp(18px, 4.5vw, 70px);
  border-bottom: 1px solid #d7e0c446;
  background: #1f4138ed;
  backdrop-filter: blur(10px);
  font:
    600 11px 'Space Grotesk',
    sans-serif;
  letter-spacing: 1.7px;
  text-transform: uppercase;
  color: #e9edce;
}
.room-header button {
  min-width: 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #d9e4cb20;
  border: 1px solid #c7dabc70;
}
.room-header button:hover {
  background: #d9e4cb35;
}
.room-content {
  position: relative;
  display: grid;
  grid-template-columns: minmax(230px, 0.72fr) minmax(0, 1.28fr);
  gap: clamp(24px, 5vw, 82px);
  align-items: start;
  width: min(1170px, calc(100% - 72px));
  margin: 0 auto;
  padding: clamp(30px, 7vh, 76px) 0 70px;
}
.room-intro {
  min-width: 0;
  padding-top: 12px;
}
.room-period {
  margin: 0 0 24px;
  font:
    600 12px 'Space Grotesk',
    sans-serif;
  letter-spacing: 1px;
  line-height: 1.65;
  text-transform: uppercase;
  color: #c5dabd;
}
.room-intro h2 {
  font:
    600 clamp(36px, 4.5vw, 58px)/1.04 'Space Grotesk',
    sans-serif;
  letter-spacing: -1.8px;
  margin: 0 0 20px;
  text-wrap: balance;
}
.room-role {
  font:
    500 16px/1.7 'DM Sans',
    sans-serif;
  color: #e5ead2;
  margin: 0;
  max-width: 350px;
}
.room-detail {
  min-width: 0;
  background: #f5f2e7;
  border: 1px solid #d5dec8;
  border-radius: 10px;
  color: #2c5043;
  box-shadow:
    0 18px 45px #102d2e5b,
    0 4px 0 #0c2d2644;
  overflow: hidden;
}
.room-tabs {
  display: flex;
  padding: 10px 12px 0;
  gap: 7px;
  border-bottom: 1px solid #cbd6c5;
  background: #e7eadb;
}
.room-tabs button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  min-height: 46px;
  padding: 11px 17px;
  border: 1px solid transparent;
  border-radius: 6px 6px 0 0;
  font:
    600 12px 'Space Grotesk',
    sans-serif;
  color: #496957;
}
.room-tabs button:hover {
  background: #dbe4d4;
}
.room-tabs button[aria-pressed='true'] {
  border-color: #cbd6c5;
  border-bottom-color: #f5f2e7;
  background: #f5f2e7;
  color: #24483c;
}
.room-board {
  min-height: 240px;
  padding: 27px 30px 24px;
  animation: board-in 0.2s ease-out;
}
.room-board p {
  font-size: 14px;
  line-height: 1.85;
  margin: 0 0 17px;
  color: #315341;
}
.room-board p:first-child {
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  color: #294e3c;
}
.room-board p:last-child {
  margin-bottom: 0;
}
.room-board.is-stack {
  min-height: 260px;
  padding: 20px;
}
.stack-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 20px;
  align-items: stretch;
}
.stack-main {
  padding: 20px;
  border-radius: 7px;
  background: #e7ecdf;
  border: 1px solid #d4ddcf;
}
.stack-kicker {
  margin: 0 0 12px !important;
  font:
    700 10px/1.5 'Space Grotesk',
    sans-serif !important;
  letter-spacing: 0.12em;
  color: #4c6757 !important;
}
.stack-main h3 {
  margin: 0 0 12px;
  font:
    600 clamp(18px, 1.7vw, 24px)/1.2 'Space Grotesk',
    sans-serif;
  letter-spacing: -0.035em;
  color: #244b3e;
}
.stack-lead {
  margin: 0 0 20px !important;
  font:
    500 13px/1.65 'DM Sans',
    sans-serif !important;
  color: #315140 !important;
}
.stack-facts {
  display: grid;
  gap: 12px;
  margin: 0;
  padding-top: 14px;
  border-top: 1px solid #c7d5c8;
}
.stack-facts div {
  display: grid;
  gap: 3px;
}
.stack-facts dt {
  font:
    600 10px 'Space Grotesk',
    sans-serif;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #516d5b;
}
.stack-facts dd {
  margin: 0;
  font:
    500 13px/1.5 'DM Sans',
    sans-serif;
  color: #2b5040;
}
.stack-side {
  min-width: 0;
  padding: 8px 2px 8px 0;
}
.stack-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.stack-tags li {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 8px 12px;
  border: 1px solid #b7cbb9;
  border-radius: 5px;
  background: #e7eddd;
  color: #244634;
  font:
    600 12px/1.35 'Space Grotesk',
    sans-serif;
}
.room-board p.stack-note {
  margin: 20px 0 0;
  padding-top: 16px;
  border-top: 1px solid #d4dfd0;
  font:
    400 13px/1.75 'DM Sans',
    sans-serif;
  color: #375c48;
}
@media (max-width: 1100px) {
  .stack-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .stack-main {
    padding: 16px;
  }
  .stack-side {
    padding: 0 4px 4px;
  }
}
.room-detail footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  padding: 18px 26px;
  border-top: 1px solid #ccd8c9;
  background: #edeedf;
  font-size: 12px;
}
.room-detail footer a {
  color: #345c49;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 4px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}
.room-exit {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #315747;
  border: 1px solid #214535;
  border-radius: 6px;
  padding: 11px 15px;
  min-height: 46px;
  color: #f5f1dd;
  font:
    600 12px 'Space Grotesk',
    sans-serif;
}
.room-exit:hover {
  background: #254839;
}
@keyframes enter-room {
  from {
    opacity: 0.5;
    transform: translateY(8px);
  }
}
@keyframes board-in {
  from {
    opacity: 0.55;
    transform: translateY(5px);
  }
}
@media (max-width: 850px) {
  .room-content {
    grid-template-columns: 1fr;
    gap: 24px;
    width: calc(100% - 38px);
    padding: 25px 0 36px;
  }
  .room-intro {
    padding-top: 0;
  }
  .room-period {
    margin-bottom: 8px;
    font-size: 10px;
  }
  .room-intro h2 {
    font-size: clamp(27px, 7vw, 38px);
    margin-bottom: 7px;
    letter-spacing: -0.8px;
  }
  .room-role {
    font-size: 13px;
  }
  .room-board {
    min-height: 160px;
    padding: 19px;
  }
  .room-board.is-stack {
    padding: 15px;
  }
  .stack-layout {
    gap: 12px;
  }
  .room-board p {
    font-size: 13px;
    line-height: 1.7;
  }
  .room-board p:first-child {
    font-size: 15px;
  }
  .room-detail footer {
    padding: 12px 16px;
  }
  .room-tabs button {
    padding: 10px 14px;
  }
}
@media (max-width: 420px) {
  .room-content {
    width: calc(100% - 24px);
    gap: 14px;
    padding-top: 19px;
  }
  .room-header {
    padding: 9px 13px;
  }
  .room-tabs {
    padding-inline: 7px;
  }
  .room-tabs button {
    padding-inline: 10px;
  }
  .room-detail footer {
    align-items: stretch;
  }
}
@media (prefers-reduced-motion: reduce) {
  .building-interior,
  .room-board {
    animation: none;
  }
}
</style>
