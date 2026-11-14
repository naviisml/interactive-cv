<script setup lang="ts">
import type { companySlides } from '~/content/company'

const props = defineProps<{ slides: ReturnType<typeof companySlides> }>()
const { locale } = useI18n()
const selectedId = ref(props.slides[0]?.id)
const project = computed(
  () => props.slides.find((item) => item.id === selectedId.value) ?? props.slides[0],
)
const article = ref<HTMLElement>()
watch(selectedId, () => article.value?.scrollTo(0, 0))
</script>

<template>
  <section
    v-if="project"
    class="project-screen"
    :aria-label="locale === 'nl' ? 'Mijn projecten' : 'My projects'"
  >
    <label>
      <span>{{ locale === 'nl' ? 'Projecten' : 'Projects' }}</span>
      <select v-model="selectedId">
        <option v-for="item in slides" :key="item.id" :value="item.id">{{ item.title }}</option>
      </select>
    </label>
    <article ref="article" tabindex="0" :aria-label="project.title">
      <small>{{ project.period }}</small>
      <h2>{{ project.title }}</h2>
      <p>{{ project.summary }}</p>
      <p
        v-for="paragraph in project.body.filter((line) => line !== project?.summary)"
        :key="paragraph"
      >
        {{ paragraph }}
      </p>
    </article>
  </section>
</template>

<style scoped>
.project-screen {
  height: 100%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  background: #f8f6ec;
  color: #254839;
}
label {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding-inline: 12px;
  background: #254839;
  color: #f8f6ec;
  font:
    600 13px 'Space Grotesk',
    sans-serif;
}
select {
  max-width: 75%;
  min-height: 44px;
  margin: 0;
  padding: 4px 8px;
  color: inherit;
  background: #335a4b;
  border: 0;
  font: inherit;
  cursor: pointer;
}
article {
  min-height: 0;
  padding: 10px 14px;
  overflow: auto;
  overscroll-behavior: contain;
  touch-action: pan-y;
}
small {
  color: #556951;
  font-size: 11px;
}
h2 {
  margin: 2px 0 6px;
  font:
    600 clamp(18px, 2vw, 26px)/1.1 'Space Grotesk',
    sans-serif;
}
p {
  margin: 0 0 10px;
  max-width: 62ch;
  font-size: 14px;
  line-height: 1.45;
}
</style>
