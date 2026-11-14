<script setup lang="ts">
const { locale } = useI18n()
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
    <AboutStoryContent />
  </main>
</template>
