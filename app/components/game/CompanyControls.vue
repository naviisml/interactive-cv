<script setup lang="ts">
import { ArrowLeft, ArrowRight, SkipForward } from '@lucide/vue'
import { presentationSlide } from '~/game/core/presentation'
import type { companySlides } from '~/content/company'
const props = defineProps<{ progress: number; slides: ReturnType<typeof companySlides> }>()
const emit = defineEmits<{ seek: [progress: number] }>()
const { t } = useI18n()
const index = computed(() => presentationSlide(props.progress, props.slides.length))
</script>
<template>
  <div class="company-controls" data-world-activity :aria-label="t('company.slideshow')">
    <p>{{ t('company.walk') }}</p>
    <div>
      <button
        :aria-label="t('company.previous')"
        @click="emit('seek', Math.max(0, (index - 1) / slides.length))"
      >
        <ArrowLeft :size="18" /></button
      ><button
        v-for="(slide, i) in slides"
        :key="slide.id"
        :aria-label="slide.title"
        :aria-pressed="i === index"
        @click="emit('seek', i / slides.length)"
      >
        <span>{{ i + 1 }}</span></button
      ><button
        :aria-label="t('company.next')"
        @click="emit('seek', Math.min(1, (index + 1) / slides.length))"
      >
        <ArrowRight :size="18" /></button
      ><button class="skip" @click="emit('seek', 1)">
        <SkipForward :size="16" />{{ t('company.continue') }}
      </button>
    </div>
  </div>
</template>
<style scoped>
.company-controls {
  position: absolute;
  z-index: 8;
  left: 50%;
  bottom: 102px;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 24px);
  background: #f4f1e9;
  border: 1px solid #9eaf90;
  border-radius: 6px;
  padding: 8px 10px;
  box-shadow: 0 4px 0 #294b4320;
}
.company-controls p {
  margin: 0 0 4px;
  font-size: 11px;
  text-align: center;
}
.company-controls > div {
  display: flex;
  align-items: center;
  gap: 3px;
}
.company-controls button {
  min-width: 32px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border-radius: 4px;
  font: 11px 'Space Grotesk';
}
.company-controls button[aria-pressed='true'] {
  background: #365b4b;
  color: #f4f1e9;
}
.company-controls .skip {
  padding-inline: 8px;
}
@media (max-width: 500px) {
  .company-controls button {
    min-width: 26px;
  }
  .company-controls .skip {
    font-size: 0;
    padding: 3px;
  }
  .company-controls {
    padding-inline: 5px;
  }
  .company-controls p {
    font-size: 10px;
  }
}
</style>
