// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/tailwindcss", "@nuxtjs/mdc", "@nuxt/image"],
  content: {
    documentDriven: true,
    highlight: {
      theme: {
        default: 'github-dark-dimmed',
        dark: 'github-dark-dimmed',
        light: 'github-light',
      },
    }
  }
})
