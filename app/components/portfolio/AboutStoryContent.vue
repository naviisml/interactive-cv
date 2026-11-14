<script setup lang="ts">
defineProps<{ embedded?: boolean }>()
const emit = defineEmits<{ firstComputer: [] }>()
const { locale } = useI18n()
const { cvTimeline } = usePortfolioContent()
const chapter = computed(() => cvTimeline.value.find((event) => event.id === 'first-lines'))
const nl = computed(() => locale.value === 'nl')
</script>

<template>
  <article v-if="chapter" class="about-story-copy" :class="{ 'in-world': embedded }">
    <p class="eyebrow">{{ nl ? 'Over mij' : 'About me' }} / Navarone Ismail</p>
    <h1 id="about-story-title">{{ nl ? 'Waar het begon' : 'Where it began' }}</h1>
    <p class="story-opening">{{ chapter.body[0] }}</p>
    <h2>{{ nl ? 'Van F12 naar PHP' : 'From F12 to PHP' }}</h2>
    <p>{{ chapter.body[1] }}</p>
    <h2>{{ nl ? 'Een eigen plek op RetroNet' : 'Finding a community on RetroNet' }}</h2>
    <p>{{ chapter.body[2] }}</p>
    <button v-if="embedded" type="button" class="return-link" @click="emit('firstComputer')">
      {{ nl ? 'Probeer mijn eerste computer' : 'Try my first computer' }} →
    </button>
    <NuxtLink v-else class="return-link" to="/?chapter=first-lines">
      {{ nl ? 'Probeer mijn eerste computer' : 'Try my first computer' }} →
    </NuxtLink>
  </article>
</template>

<style scoped>
.about-story-copy {
  max-width: 780px;
  padding-inline: clamp(20px, 5vw, 54px);
}
.about-story-copy h2 {
  font: 500 clamp(22px, 4vw, 30px)/1.2 'Space Grotesk', sans-serif;
  margin: 1.5em 0 0;
}
.about-story-copy > .story-opening {
  font-size: clamp(18px, 3vw, 22px);
  line-height: 1.55;
}
.about-story-copy.in-world {
  max-width: none;
  margin: 0;
  padding: 0;
}
.about-story-copy.in-world h1 {
  font-size: clamp(26px, 3vw, 38px);
  line-height: 1.1;
  margin: 13px 0 18px;
  letter-spacing: -0.04em;
}
.about-story-copy.in-world h2 {
  font-size: 20px;
  margin: 24px 0 10px;
}
.about-story-copy.in-world p {
  color: #4c6657;
  font-size: 13px;
  line-height: 1.75;
}
.about-story-copy.in-world > .story-opening {
  color: #345849;
  font-size: 16px;
  line-height: 1.6;
}
.about-story-copy.in-world .return-link {
  min-height: 44px;
  margin-top: 24px;
  font-weight: 600;
  text-align: left;
}
@media (max-width: 700px) {
  .about-story-copy.in-world h1 { font-size: 27px; }
  .about-story-copy.in-world h2 { font-size: 18px; margin-top: 18px; }
  .about-story-copy.in-world p { font-size: 12px; }
  .about-story-copy.in-world > .story-opening { font-size: 14px; }
}
</style>
