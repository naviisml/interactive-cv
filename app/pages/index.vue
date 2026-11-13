<script setup lang="ts">
const { locale } = useI18n()
const title = computed(() => locale.value === 'nl'
  ? 'Navarone Ismail — Softwareontwikkelaar & Technical Lead | Interactief CV'
  : 'Navarone Ismail — Full-stack Software Engineer | Interactive Portfolio')
const description = computed(() => locale.value === 'nl'
  ? 'Ontdek het verhaal, de technische ervaring en projecten van Navarone Ismail in een interactief CV.'
  : 'Explore Navarone Ismail’s engineering experience, technical leadership and projects in a playable portfolio.')
useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary',
})
useHead({ link: [{ rel: 'canonical', href: 'https://navel.dev/' }] })
</script>
<template><JourneyWorld /></template>
