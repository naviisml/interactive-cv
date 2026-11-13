<script setup lang="ts">
import type { TimelineEvent } from '~/content/timeline'
const props = defineProps<{
  entries: { event: TimelineEvent; index: number }[]
  active: number
  progress: number
  list: boolean
}>()
const emit = defineEmits<{ navigate: [index: number] }>()
const { t } = useI18n()
const rail = ref<HTMLElement>()
const order = computed(() => props.entries.map((entry) => entry.index))
const current = computed(() => props.entries.find((entry) => entry.index === props.active)?.event)
async function centerActive() {
  await nextTick()
  const element = rail.value,
    button = element?.querySelector<HTMLElement>('[aria-current="step"]')
  if (element && button)
    element.scrollTo({
      left: button.offsetLeft - element.clientWidth / 2 + button.clientWidth / 2,
      behavior: 'instant',
    })
}
watch(() => props.active, centerActive)
onMounted(centerActive)
</script>
<template>
  <footer class="journey-footer">
    <div class="footer-heading">
      <span class="eyebrow">{{ t('list.journey') }}</span><span
        >{{ progress }}% {{ t(list ? 'list.read' : 'list.explored') }}</span
      >
    </div>
    <div ref="rail" class="timeline-scroll">
      <nav
        class="timeline-nav"
        :aria-label="t('list.timeline')"
        :style="{
          '--timeline-progress': `${progress}%`,
          minWidth: `${entries.length * 104}px`,
        }"
      >
        <button
          v-for="{ event, index } in entries"
          :key="event.id"
          :aria-label="`${event.title}, ${event.period || event.label}`"
          :data-category="event.category"
          :class="{
            selected: index === active,
            visited: order.indexOf(index) < order.indexOf(active),
          }"
          :aria-current="index === active ? 'step' : undefined"
          @click="emit('navigate', index)"
        >
          <i /><span :title="`${event.title} · ${event.period || event.label}`">{{
            event.category === 'skills' ? event.title : event.label
          }}</span>
        </button>
      </nav>
    </div>
    <div class="footer-meta">
      <span>{{ current?.title }}</span><span
        >{{ String(order.indexOf(active) + 1).padStart(2, '0') }} / {{ entries.length }}</span
      >
    </div>
  </footer>
</template>
