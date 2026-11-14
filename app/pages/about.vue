<script setup lang="ts">
const { locale } = useI18n()
const { cvTimeline } = usePortfolioContent()
const chapter = computed(() => cvTimeline.value.find((event) => event.id === 'first-lines'))
const nl = computed(() => locale.value === 'nl')
useSeoMeta({ title: () => (nl.value ? 'Mijn verhaal' : 'My story') + ' · Navarone Ismail' })
</script>

<template>
  <main class="event-page story-page">
    <header class="topbar">
      <NuxtLink class="wordmark" to="/">navi<span>®</span></NuxtLink>
      <NuxtLink class="text-button" to="/"
        >← {{ nl ? 'Terug naar de wereld' : 'Back to the world' }}</NuxtLink
      >
    </header>
    <article v-if="chapter">
      <p class="eyebrow">{{ nl ? 'Over mij' : 'About me' }} / Navarone Ismail</p>
      <h1>{{ nl ? 'Waar het begon' : 'Where it began' }}</h1>
      <p class="story-opening">{{ chapter.body[0] }}</p>
      <h2>{{ nl ? 'Van F12 naar PHP' : 'From F12 to PHP' }}</h2>
      <p>{{ chapter.body[1] }}</p>
      <h2>{{ nl ? 'Een eigen plek op RetroNet' : 'Finding a community on RetroNet' }}</h2>
      <p>{{ chapter.body[2] }}</p>
      <NuxtLink class="return-link" to="/?chapter=first-lines"
        >{{ nl ? 'Probeer mijn eerste computer' : 'Try my first computer' }} →</NuxtLink
      >
    </article>
  </main>
</template>

<style scoped>
.story-page article {
  max-width: 780px;
  padding-inline: clamp(20px, 5vw, 54px);
}
.story-page h2 {
  font:
    500 clamp(22px, 4vw, 30px)/1.2 'Space Grotesk',
    sans-serif;
  margin: 1.5em 0 0;
}
.story-page article > .story-opening {
  font-size: clamp(18px, 3vw, 22px);
  line-height: 1.55;
}
</style>
