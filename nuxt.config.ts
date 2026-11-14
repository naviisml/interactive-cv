import { timeline } from './app/content/timeline'
export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  devtools: { enabled: false },
  components: [{ path: '~/components', pathPrefix: false }],
  modules: ['@nuxtjs/i18n', '@nuxt/eslint'],
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
      title: 'Navarone Ismail — Full-stack Software Engineer | Interactive Portfolio',
      meta: [
        { name: 'description', content: 'Explore Navarone Ismail’s software engineering career, technical leadership, projects and skills in an interactive portfolio.' },
        { name: 'theme-color', content: '#f4f1e9' },
        { name: 'color-scheme', content: 'light' },
      ],
    },
  },
  typescript: { strict: true },
  nitro: {
    prerender: {
      routes: ['/about', ...timeline
        .filter((event) => event.kind !== 'milestone')
        .map((event) => `/events/${event.id}`)],
    },
  },
})
