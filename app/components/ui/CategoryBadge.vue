<script setup lang="ts">
import { categoryNames, categoryColors, type EventCategory } from '~/content/timeline'
const { t } = useI18n()
defineProps<{ category: EventCategory }>()
</script>
<template>
  <span
    class="category-badge"
    :class="`category-${category}`"
    :style="{ '--category-color': categoryColors[category] }"
    ><i aria-hidden="true" />{{ t('category.' + category) }}</span
  >
</template>
<style scoped>
.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--category-color);
  font: 500 10px 'Space Grotesk';
  letter-spacing: 0.7px;
  text-transform: uppercase;
}
i {
  display: inline-block;
  width: 8px;
  height: 8px;
  background: currentColor;
}
.category-projects i {
  transform: rotate(45deg);
  width: 7px;
  height: 7px;
}
.category-school i {
  border-radius: 50%;
  background: transparent;
  border: 2px solid currentColor;
  width: 9px;
  height: 9px;
}
</style>
