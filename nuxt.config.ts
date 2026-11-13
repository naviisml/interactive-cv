import { timeline } from './app/content/timeline'
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  components: [{ path: '~/components', pathPrefix: false }],
  modules: ['@nuxtjs/i18n'],
  i18n: {
    strategy: 'no_prefix',
    defaultLocale: 'en',
    locales: [
      { code: 'en', language: 'en-GB', name: 'English', file: 'en.json' },
      { code: 'nl', language: 'nl-NL', name: 'Nederlands', file: 'nl.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'portfolio-language',
      redirectOn: 'root',
      fallbackLocale: 'en',
    },
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Navi · A life in progress',
      meta: [{ name: 'description', content: 'Explore a developer’s story, one step at a time.' }],
    },
  },
  typescript: { strict: true },
  nitro: {
    prerender: {
      routes: timeline
        .filter((event) => event.kind !== 'milestone')
        .map((event) => `/events/${event.id}`),
    },
  },
})
