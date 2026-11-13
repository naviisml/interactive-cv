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
      <p class="room-period">
        {{ event.period || event.label }} <span v-if="event.location">· {{ event.location }}</span>
      </p>
      <h2 id="room-title">{{ event.title }}</h2>
      <p class="room-role">{{ event.role }}</p>
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
  </section>
</template>
<style scoped>
.building-interior {
  position: absolute;
  inset: 0;
  z-index: 25;
  isolation: isolate;
  overflow: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
  color: #e8e4cc;
  background: #506d61;
  user-select: text;
  -webkit-user-select: text;
  box-shadow: inset 0 0 0 12px #365447;
  animation: enter-room 0.35s ease-out;
}
.building-interior[data-building='hotel'] {
  background: #716f56;
}
.building-interior[data-building='airport'] {
  background: #4e7270;
}
.building-interior[data-building='mobility'] {
  background: #556b68;
}
.building-interior[data-building='codam'] {
  background: #365b58;
}
.room-windows {
  position: absolute;
  inset: 85px 25px 80px;
  display: flex;
  justify-content: space-around;
  opacity: 0.23;
  z-index: -2;
  pointer-events: none;
}
.room-windows i {
  width: 19%;
  height: 60%;
  background:
    linear-gradient(90deg, transparent 47%, #516c59 47% 51%, transparent 51%),
    linear-gradient(transparent 48%, #516c59 48% 52%, transparent 52%), #c2cba5;
  border: 8px solid #2d5045;
  box-shadow: 0 8px 0 #9eaa86;
}
.room-floor {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 85px;
  background: repeating-linear-gradient(0deg, #6c7153 0 17px, #8b8a65 18px 20px);
  z-index: -1;
  transform-origin: bottom;
  pointer-events: none;
}
.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 26px;
  font: 10px 'Space Grotesk';
  letter-spacing: 2px;
  color: #d1d6b7;
}
.room-header button {
  min-width: 44px;
  min-height: 44px;
  color: inherit;
  display: grid;
  place-items: center;
  background: #203e3659;
  border: 1px solid #b0bc915c;
  border-radius: 4px;
}
.room-content {
  position: relative;
  width: min(820px, calc(100% - 70px));
  margin: 5px auto 30px;
}
.room-period {
  font-size: 11px;
  color: #c7cfaf;
  letter-spacing: 0.5px;
}
h2 {
  font: 500 clamp(25px, 4vw, 45px)/1.1 'Space Grotesk';
  margin: 13px 0;
}
.room-role {
  font-size: 14px;
  line-height: 1.5;
}
.room-tabs {
  display: flex;
  gap: 8px;
  margin: 24px 0 0;
}
.room-tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 18px;
  background: #294d40;
  color: #d7dec0;
  border: 1px solid #a4b18b;
  border-radius: 4px 4px 0 0;
  font-size: 12px;
}
.room-tabs button[aria-pressed='true'] {
  background: #ece6ce;
  color: #2e5143;
  border-bottom-color: #ece6ce;
}
.room-board {
  background: #ece6ce;
  color: #355748;
  padding: 24px 28px;
  border: 1px solid #bfc3a3;
  box-shadow: 7px 8px 0 #263f3538;
  min-height: 160px;
  max-height: 32vh;
  overflow: auto;
  animation: board-in 0.2s ease-out;
}
.room-board p {
  font-size: 14px;
  line-height: 1.8;
  margin: 0 0 16px;
}
.room-board p:first-child {
  font-size: 17px;
  color: #294d3e;
}
.room-board p:last-child {
  margin-bottom: 0;
}
.is-stack {
  display: flex;
  gap: 12px;
  align-content: flex-start;
  flex-wrap: wrap;
}
.is-stack span {
  padding: 13px 18px;
  background: #d6ddbf;
  border: 1px solid #a1b08b;
  font: 13px 'Space Grotesk';
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin-top: 23px;
  font-size: 12px;
}
footer a {
  color: #e0dfc1;
}
.room-exit {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #2d5143;
  border: 1px solid #aab58b;
  border-radius: 4px;
  padding: 12px 18px;
  min-height: 48px;
  color: #eeebd0;
}
@keyframes enter-room {
  from {
    opacity: 0;
    transform: scale(1.03);
  }
}
@keyframes board-in {
  from {
    opacity: 0.3;
    transform: translateY(4px);
  }
}
@media (max-width: 600px) {
  .room-header {
    padding: 10px 16px;
  }
  .room-content {
    width: calc(100% - 32px);
    margin-top: 0;
  }
  .room-period {
    font-size: 10px;
  }
  .room-role {
    font-size: 12px;
  }
  .room-tabs {
    margin-top: 15px;
  }
  .room-tabs button {
    padding: 9px 12px;
  }
  .room-board {
    padding: 17px;
    max-height: 35vh;
    min-height: 100px;
  }
  .room-board p {
    font-size: 12px;
    line-height: 1.65;
  }
  .room-board p:first-child {
    font-size: 14px;
  }
  footer {
    margin-top: 16px;
    gap: 12px;
    flex-wrap: wrap;
  }
  .is-stack span {
    font-size: 11px;
    padding: 9px;
  }
  .room-exit {
    font-size: 12px;
  }
  .room-windows {
    inset-inline: 15px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .building-interior,
  .room-board {
    animation: none;
  }
}
</style>
