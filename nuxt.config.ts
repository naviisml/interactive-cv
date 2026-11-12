export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  app: { head: { title: 'Navi · A life in progress', meta: [{ name: 'description', content: 'Explore a developer’s story, one step at a time.' }] } },
  typescript: { strict: true },
})
