<script setup lang="ts">
import { FileText } from '@lucide/vue'
import { hasDetails, type TimelineEvent } from '~/content/timeline'
defineProps<{
  current: TimelineEvent
  running: boolean
  destinationTitle?: string
  feedback?: string
}>()
const emit = defineEmits<{ details: [event: MouseEvent]; cancel: [] }>()
const { t } = useI18n()
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
        v-if="hasDetails(current)"
        class="caption-details"
        aria-haspopup="dialog"
        :aria-label="t('common.detailsAbout', { title: current.title })"
        @click="emit('details', $event)"
      >
        <FileText :size="16" aria-hidden="true" />{{ t('common.details') }}
      </button>
    </div>
    <p class="caption-summary">{{ current.summary }}</p>
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
