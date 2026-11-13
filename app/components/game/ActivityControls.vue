<script setup lang="ts">
const props = defineProps<{ id: string; paused: boolean }>()
const emit = defineEmits<{ command: [action: string, index?: number] }>()
const { t } = useI18n()
</script>
<template>
  <div
    v-if="['panta-rhei', 'roc-hilversum', 'coding-college'].includes(id)"
    class="activity-controls"
    data-world-activity
  >
    <template v-if="id === 'panta-rhei'"
      ><button :disabled="paused" @click="emit('command', 'kick')">{{ t('activity.kick') }}</button
      ><button :disabled="paused" @click="emit('command', 'reset')">
        {{ t('activity.reset') }}
      </button></template
    >
    <template v-else-if="id === 'roc-hilversum'"
      ><span>{{ t('activity.wires') }}</span
      ><button
        v-for="i in 6"
        :key="i"
        :aria-label="t('activity.wire', { n: i })"
        :disabled="paused"
        @click="emit('command', 'wire', i - 1)"
      >
        {{ i }}
      </button></template
    >
    <template v-else
      ><button
        v-for="(token, i) in ['{', ';', '}']"
        :key="i"
        :disabled="paused"
        @click="emit('command', 'code', i)"
      >
        {{ token }}
      </button></template
    >
  </div>
</template>
<style scoped>
.activity-controls {
  position: absolute;
  z-index: 7;
  right: 20px;
  bottom: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px;
  background: #f4f1e9;
  border: 1px solid #a7b595;
  border-radius: 5px;
  max-width: calc(100% - 24px);
  font-size: 11px;
}
.activity-controls button {
  min-width: 44px;
  min-height: 44px;
  padding: 8px;
  background: #e3e8d8;
  border-radius: 3px;
  white-space: nowrap;
  touch-action: manipulation;
}
.activity-controls span {
  font-size: 10px;
  max-width: 90px;
}
</style>

<style scoped>
@media (pointer: coarse) {
  /* Touch users rotate the full-size tiles directly in the world. Keep the
     equivalent controls available to assistive technology and keyboard focus. */
  .activity-controls:not(:focus-within) {
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
}
@media (max-width: 600px) {
  .activity-controls span {
    display: none;
  }
}
</style>
