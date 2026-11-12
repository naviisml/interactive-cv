<script setup lang="ts">
import { timeline } from '~/data/timeline'
const route = useRoute()
const event = computed(() => timeline.find(item => item.id === route.params.id))
if (!event.value) throw createError({ statusCode: 404, statusMessage: 'This chapter has not been written yet.' })
useSeoMeta({ title: () => `${event.value?.title} · Navi`, description: () => event.value?.summary })
</script>
<template><main v-if="event" class="event-page" :style="{ '--accent': event.accent }"><header class="topbar"><NuxtLink class="wordmark" to="/">navi<span>®</span></NuxtLink><NuxtLink class="text-button" to="/">← Return to the journey</NuxtLink></header><article><p class="eyebrow">{{ event.label }} <span> / </span> {{ event.kind }}</p><h1>{{ event.title }}</h1><p v-if="event.role" class="event-role">{{ event.role }}<br><span>{{ event.period }}<template v-if="event.location"> · {{ event.location }}</template><template v-if="event.via"> · via {{ event.via }}</template></span></p><p class="event-lead">{{ event.summary }}</p><div class="article-rule"/><p v-for="paragraph in event.body" :key="paragraph">{{ paragraph }}</p><div v-if="event.tags?.length" class="tech-tags"><span v-for="tag in event.tags" :key="tag">{{ tag }}</span></div><NuxtLink class="return-link" to="/">Continue exploring →</NuxtLink></article><footer class="article-footer">A LIFE IN PROGRESS <span>✳</span> NAVI</footer></main></template>
