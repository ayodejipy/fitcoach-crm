// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui', '@pinia/nuxt', '@vueuse/nuxt'],
  future: {
    compatibilityVersion: 4,
  },
  runtimeConfig: {
    public: {
      // Override in production via NUXT_PUBLIC_API_BASE env var
      apiBase: 'http://localhost:8080',
    },
  },
})