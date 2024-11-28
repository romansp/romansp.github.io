// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/mdc",
    "@nuxt/image",
    "nuxt-og-image"
  ],

  site: {
    url: 'https://paulau.dev',
    name: "paulau.dev",
  },

  content: {
    highlight: {
      theme: {
        default: 'github-dark-dimmed',
        dark: 'github-dark-dimmed',
        light: 'github-light',
      },
    }
  },

  compatibilityDate: "2024-11-28"
})