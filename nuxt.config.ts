// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    "@nuxt/content",
    "@nuxtjs/tailwindcss"
  ],
  content: {
    highlight: {
      theme: {
        default: 'vitesse-dark',
        dark: 'vitesse-dark',
        light: 'vitesse-light',
      },
    }

  }
})
