// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/mdc',
    '@nuxt/image',
    'nuxt-og-image',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  site: {
    url: 'https://paulau.dev',
    name: 'paulau.dev',
  },

  router: {
    options: {
      strict: true,
    },
  },

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: 'append',
      },
    },
  },

  content: {
    highlight: {
      theme: {
        default: 'github-dark-dimmed',
        dark: 'github-dark-dimmed',
        light: 'github-light',
      },
    },
  },

  compatibilityDate: '2024-11-28',
})
