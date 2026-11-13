<script setup lang="ts">
import {
  hasDetails,
  isBriefEvent,
  storyParagraphs,
  categoryColors,
  type TimelineEvent,
} from '~/content/timeline'
const props = defineProps<{ entries: { event: TimelineEvent; index: number }[]; active: number }>()
const emit = defineEmits<{ open: [index: number]; back: [] }>()
const { t } = useI18n()
const order = computed(() => props.entries.map((entry) => entry.index))
</script>
<template>
  <div>
    <div class="list-intro">
      <p class="eyebrow">{{ t('list.eyebrow') }}</p>
      <h1>{{ t('list.title') }}</h1>
      <p>{{ t('list.intro') }}</p>
    </div>
    <article
      v-for="{ event, index } in entries"
      :key="event.id"
      :data-timeline-index="index"
      :id="`chapter-${event.id}`"
      class="reading-event"
      :data-category="event.category"
      :class="{ 'is-current': index === active, 'is-past': index < active }"
      :style="{ '--accent': categoryColors[event.category] }"
    >
      <div class="reading-rail">
        <i /><span>{{ String(order.indexOf(index) + 1).padStart(2, '0') }}</span>
      </div>
      <div class="reading-content">
        <p class="eyebrow">
          {{ t('category.' + event.category)
          }}<template v-if="event.label !== 'SKILLS'"> / {{ event.label }}</template> /
          {{ event.chapter }}
        </p>
        <h2>{{ event.title }}</h2>
        <p v-if="event.role" class="reading-role">
          {{ event.role }}<br /><span
            >{{ event.period }}<template v-if="event.location"> · {{ event.location }}</template
            ><template v-if="event.via"> · via {{ event.via }}</template></span
          >
        </p>
        <p class="reading-summary">{{ event.summary }}</p>
        <template v-if="!isBriefEvent(event)"
          ><p v-for="paragraph in storyParagraphs(event)" :key="paragraph">
            {{ paragraph }}
          </p></template
        >
        <div v-if="event.tags?.length" class="tech-tags">
          <span v-for="tag in event.tags" :key="tag">{{ tag }}</span>
        </div>
        <button v-if="hasDetails(event)" class="reading-link" @click="emit('open', index)">
          {{ t(event.category === 'projects' ? 'list.project' : 'list.experience') }} ↗</button
        ><a v-if="event.id === 'contact'" class="reading-link" href="mailto:contact@navel.dev"
          >contact@navel.dev ↗&#xfe0e;</a
        >
      </div>
    </article>
    <div class="list-ending">
      <button class="text-button" @click="emit('back')">{{ t('list.back') }} →</button>
    </div>
  </div>
</template>
