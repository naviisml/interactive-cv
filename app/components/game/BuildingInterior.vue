<script setup lang="ts">
import { DoorOpen, BriefcaseBusiness, GraduationCap, Layers, ArrowRight, X } from '@lucide/vue'
import type { TimelineEvent } from '~/content/timeline'
import { storyParagraphs } from '~/content/timeline'
import { buildings } from '~/content/buildings'
const props = defineProps<{ event: TimelineEvent }>()
const emit = defineEmits<{ leave: [] }>()
const { t } = useI18n()
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
        {{ event.period || event.label }} <span v-if="event.location">· {{ event.location }}</span>
      </p>
      <h2 id="room-title">{{ event.title }}</h2>
      <p class="room-role">{{ event.role }}</p>
      </div>
      <div class="room-detail">
      <nav class="room-tabs" :aria-label="t('building.explore')">
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
          ><p v-for="(paragraph, i) in sections[0]!.text" :key="i">{{ paragraph }}</p></template
        >
        <template v-else
          ><span v-for="item in sections[1]!.text" :key="item">{{ item }}</span></template
        >
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
  animation: enter-room .28s ease-out;
}
.building-interior[data-building='hotel'] { --room-wall: #736c52; }
.building-interior[data-building='airport'] { --room-wall: #456c70; }
.building-interior[data-building='mobility'] { --room-wall: #4d6464; }
.building-interior[data-building='codam'] { --room-wall: #325e57; }

.room-windows {
  position: absolute;
  inset: 90px 4% 85px;
  display: flex;
  justify-content: space-between;
  opacity: .11;
  z-index: -2;
  pointer-events: none;
}
.room-windows i {
  width: 21%;
  max-height: 320px;
  border: 10px solid #15352e;
  background:
    linear-gradient(90deg, transparent 47%, #15352e 47% 52%, transparent 52%),
    linear-gradient(transparent 51%, #15352e 51% 55%, transparent 55%),
    #f0e2b6;
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
  font: 600 11px 'Space Grotesk', sans-serif;
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
.room-header button:hover { background: #d9e4cb35; }
.room-content {
  position: relative;
  display: grid;
  grid-template-columns: minmax(230px, .72fr) minmax(0, 1.28fr);
  gap: clamp(24px, 5vw, 82px);
  align-items: start;
  width: min(1170px, calc(100% - 72px));
  margin: 0 auto;
  padding: clamp(30px, 7vh, 76px) 0 70px;
}
.room-intro { min-width: 0; padding-top: 12px; }
.room-period {
  margin: 0 0 24px;
  font: 600 12px 'Space Grotesk', sans-serif;
  letter-spacing: 1px;
  line-height: 1.65;
  text-transform: uppercase;
  color: #c5dabd;
}
.room-intro h2 {
  font: 600 clamp(36px, 4.5vw, 58px)/1.04 'Space Grotesk', sans-serif;
  letter-spacing: -1.8px;
  margin: 0 0 20px;
  text-wrap: balance;
}
.room-role {
  font: 500 16px/1.7 'DM Sans', sans-serif;
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
  box-shadow: 0 18px 45px #102d2e5b, 0 4px 0 #0c2d2644;
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
  font: 600 12px 'Space Grotesk', sans-serif;
  color: #496957;
}
.room-tabs button:hover { background: #dbe4d4; }
.room-tabs button[aria-pressed='true'] {
  border-color: #cbd6c5;
  border-bottom-color: #f5f2e7;
  background: #f5f2e7;
  color: #24483c;
}
.room-board {
  min-height: 240px;
  padding: 27px 30px 24px;
  animation: board-in .2s ease-out;
}
.room-board p {
  font-size: 14px;
  line-height: 1.85;
  margin: 0 0 17px;
  color: #425f50;
}
.room-board p:first-child {
  font-size: 18px;
  line-height: 1.6;
  font-weight: 500;
  color: #294e3c;
}
.room-board p:last-child { margin-bottom: 0; }
.room-board.is-stack {
  display: flex;
  gap: 10px;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
}
.room-board.is-stack span {
  display: inline-flex;
  align-items: center;
  min-height: 36px;
  padding: 9px 13px;
  border-radius: 5px;
  background: #e4ead9;
  border: 1px solid #b9cbb7;
  color: #315849;
  font: 500 12px 'Space Grotesk', sans-serif;
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
  font: 600 12px 'Space Grotesk', sans-serif;
}
.room-exit:hover { background: #254839; }
@keyframes enter-room {
  from { opacity: .5; transform: translateY(8px); }
}
@keyframes board-in {
  from { opacity: .55; transform: translateY(5px); }
}
@media (max-width: 850px) {
  .room-content {
    grid-template-columns: 1fr;
    gap: 24px;
    width: calc(100% - 38px);
    padding: 25px 0 36px;
  }
  .room-intro { padding-top: 0; }
  .room-period { margin-bottom: 8px; font-size: 10px; }
  .room-intro h2 { font-size: clamp(27px, 7vw, 38px); margin-bottom: 7px; letter-spacing: -.8px; }
  .room-role { font-size: 13px; }
  .room-board { min-height: 160px; padding: 19px; }
  .room-board p { font-size: 13px; line-height: 1.7; }
  .room-board p:first-child { font-size: 15px; }
  .room-detail footer { padding: 12px 16px; }
  .room-tabs button { padding: 10px 14px; }
}
@media (max-width: 420px) {
  .room-content { width: calc(100% - 24px); gap: 14px; padding-top: 19px; }
  .room-header { padding: 9px 13px; }
  .room-tabs { padding-inline: 7px; }
  .room-tabs button { padding-inline: 10px; }
  .room-detail footer { align-items: stretch; }
}
@media (prefers-reduced-motion: reduce) {
  .building-interior, .room-board { animation: none; }
}
</style>
