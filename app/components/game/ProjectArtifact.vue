<script setup lang="ts">
import type { companySlides } from '~/content/company'
type Slide = ReturnType<typeof companySlides>[number]
const props = defineProps<{ project: Slide }>()
const { locale } = useI18n()
type ComponentNote = { title: string; nl: string; en: string }
const components: Record<string, ComponentNote[]> = {
  'navel-development': [
    { title: 'Vue + Laravel', nl: 'Webapplicaties met Vue.js en Laravel.', en: 'Web applications built with Vue.js and Laravel.' },
    { title: 'REST + OAuth', nl: 'Systemen met elkaar verbonden via REST- en OAuth-API’s.', en: 'Systems connected through REST and OAuth APIs.' },
    { title: 'Git + Docker', nl: 'Applicaties ontwikkelen en uitrollen met Git en Docker.', en: 'Building and deploying applications with Git and Docker.' },
  ],
  gmodstore: [
    { title: 'Lua', nl: 'Plug-ins voor verschillende spelmodi.', en: 'Plug-ins developed for different game modes.' },
    { title: 'Game mechanics', nl: 'Nieuwe spelmechanieken en virtuele economieën.', en: 'Game mechanics and virtual economies.' },
    { title: 'Storefront', nl: 'Een website met een winkel voor in-game aankopen.', en: 'A website with a store for in-game purchases.' },
  ],
  'q-lite': [
    { title: 'Travel updates', nl: 'Actuele reisinformatie voor reizigers.', en: 'Current travel information for passengers.' },
    { title: 'C', nl: 'Toegevoegde functionaliteit geschreven in C.', en: 'Functionality implemented in C.' },
    { title: 'Text-to-speech', nl: 'Reisinformatie hoorbaar maken voor blinde en slechtziende reizigers.', en: 'Making travel information audible for blind and partially sighted passengers.' },
  ],
  shopify: [
    { title: 'Theme development', nl: 'Aangepaste Shopify-thema’s voor webwinkels.', en: 'Custom Shopify themes for online stores.' },
    { title: 'Integrations', nl: 'Applicaties van derden gekoppeld aan webshops.', en: 'Third-party applications integrated into storefronts.' },
    { title: 'Usability', nl: 'De bruikbaarheid van webshops verbeterd.', en: 'Improving storefront usability.' },
  ],
  'fifty-five': [
    { title: 'Brand identity', nl: 'Logo’s en raamgraphics ontworpen.', en: 'Logo and window-graphics design.' },
    { title: 'Hotel websites', nl: 'Responsieve websites voor hotels gebouwd.', en: 'Responsive hotel websites.' },
    { title: 'Property management', nl: 'Externe property-managementsystemen gekoppeld.', en: 'External hotel property-management systems integrated.' },
  ],
  aquablu: [
    { title: 'Laravel codebase', nl: 'De bestaande Laravel-codebase onderzocht.', en: 'Reviewing an existing Laravel codebase.' },
    { title: 'Performance', nl: 'Trage onderdelen en onderhoudsproblemen in kaart gebracht.', en: 'Identifying slow paths and maintainability issues.' },
    { title: 'Recommendations', nl: 'Bevindingen gedocumenteerd en aanbevelingen gepresenteerd.', en: 'Documenting findings and presenting recommendations.' },
  ],
  'navel-cloud': [
    { title: 'Nuxt panel', nl: 'Het Nuxt-beheerpaneel voor het platform.', en: 'The Nuxt management panel for the platform.' },
    { title: 'Laravel API', nl: 'De Laravel-API achter sites, formulieren en afspraken.', en: 'The Laravel API behind sites, forms and appointments.' },
    { title: 'Docker Swarm', nl: 'Elke website draait als afzonderlijke service.', en: 'Each website runs as its own service.' },
    { title: 'Traefik', nl: 'Verkeer routeren naar de juiste websiteservice.', en: 'Routing traffic to the correct website service.' },
    { title: 'MySQL + Valkey', nl: 'Databases en cache als beheerde services.', en: 'Databases and caching as managed services.' },
  ],
}
const nodes = computed(() => components[props.project.id] ?? [])
const selected = ref(0)
watch(() => props.project.id, () => { selected.value = 0 })
const active = computed(() => nodes.value[selected.value] ?? nodes.value[0])
</script>

<template>
  <div class="artifact" :style="{ '--artifact-accent': project.accent }">
    <div class="artifact-heading">
      <span><span class="artifact-live" /> {{ locale === 'nl' ? 'PROJECTONDERDELEN' : 'PROJECT COMPONENTS' }}</span>
      <span>{{ String(nodes.length).padStart(2, '0') }} {{ locale === 'nl' ? 'ONDERDELEN' : 'ELEMENTS' }}</span>
    </div>
    <div class="artifact-diagram">
      <div class="artifact-spine" aria-hidden="true" />
      <div class="artifact-nodes">
        <button
          v-for="(node, i) in nodes"
          :key="node.title"
          type="button"
          class="artifact-node"
          :class="{ 'is-selected': selected === i }"
          :aria-pressed="selected === i"
          @click="selected = i"
        >
          <span class="artifact-node-marker">{{ String(i + 1).padStart(2, '0') }}</span>
          <span class="artifact-node-label">{{ node.title }}</span>
        </button>
      </div>
      <div class="artifact-info" aria-live="polite">
        <span class="artifact-info-number">{{ String(selected + 1).padStart(2, '0') }} / {{ String(nodes.length).padStart(2, '0') }}</span>
        <strong>{{ active?.title }}</strong>
        <p>{{ active?.[locale === 'nl' ? 'nl' : 'en'] }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.artifact {
  background: #e8e9d9;
  border: 1px solid #bfcaba;
  border-radius: 10px;
  overflow: hidden;
  min-width: 0;
}
.artifact-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 13px 17px;
  border-bottom: 1px solid #cbd4c6;
  color: #506d5b;
  font: 700 10px/1.3 'Space Grotesk', sans-serif;
  letter-spacing: .1em;
}
.artifact-heading > span { display: flex; align-items: center; gap: 8px; }
.artifact-live { width: 7px; height: 7px; border-radius: 50%; background: #5c8865; }
.artifact-diagram {
  padding: 18px;
  position: relative;
  background-image: linear-gradient(#64816a0d 1px, transparent 1px), linear-gradient(90deg, #64816a0d 1px, transparent 1px);
  background-size: 24px 24px;
}
.artifact-nodes {
  display: flex;
  flex-wrap: wrap;
  position: relative;
  z-index: 1;
  gap: 8px;
}
.artifact-node {
  display: inline-flex;
  align-items: center;
  flex: 1 1 132px;
  max-width: 230px;
  gap: 9px;
  min-height: 48px;
  padding: 9px 12px;
  text-align: left;
  border: 1px solid #bdcbb9;
  border-radius: 7px;
  background: #f7f5e9;
  transition: background .16s ease, transform .16s ease, border-color .16s ease;
}
.artifact-node:hover { transform: translateY(-2px); border-color: #668673; }
.artifact-node.is-selected {
  background: #305848;
  color: #f7f4e7;
  border-color: #305848;
}
.artifact-node-marker { font: 700 10px 'Space Grotesk', sans-serif; opacity: .65; }
.artifact-node-label { font: 600 12px/1.4 'DM Sans', sans-serif; }
.artifact-spine {
  position: absolute;
  top: 33px;
  left: 30px;
  right: 30px;
  height: 1px;
  background: #80967d70;
}
.artifact-info {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: baseline;
  gap: 5px 13px;
  margin-top: 16px;
  padding: 15px 17px;
  border-left: 3px solid var(--artifact-accent, #749484);
  background: #faf9f0;
  border-radius: 0 5px 5px 0;
}
.artifact-info-number { color: #79917e; font: 700 10px 'Space Grotesk', sans-serif; }
.artifact-info strong { font: 700 15px 'Space Grotesk', sans-serif; letter-spacing: -.02em; color: #244638; }
.artifact-info p { grid-column: 2; margin: 0; font: 400 13px/1.6 'DM Sans', sans-serif; color: #425f4d; }
@media (max-width: 700px) {
  .artifact-diagram { padding: 11px; }
  .artifact-nodes { flex-wrap: nowrap; overflow-x: auto; scroll-snap-type: x proximity; scrollbar-width: thin; padding-bottom: 4px; }
  .artifact-node { flex: 0 0 138px; min-height: 46px; scroll-snap-align: start; }
  .artifact-info { margin-top: 10px; padding: 11px 12px; }
  .artifact-heading { padding: 9px 12px; font-size: 9px; }
}
@media (prefers-reduced-motion: reduce) {
  .artifact-node { transition: none; }
  .artifact-node:hover { transform: none; }
}
</style>
