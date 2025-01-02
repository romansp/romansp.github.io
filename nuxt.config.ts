// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    "@nuxt/content",
    "@nuxtjs/tailwindcss",
    "@nuxtjs/mdc",
    "@nuxt/image",
    "nuxt-og-image",
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "nuxt-seo-utils",
  ],

  site: {
    url: "https://paulau.dev",
    name: "Raman Paulau",
    trailingSlash: true,
  },

  content: {
    highlight: {
      theme: {
        default: "github-dark-dimmed",
        dark: "github-dark-dimmed",
        light: "github-light",
      },
    },
  },

  compatibilityDate: "2024-11-28",

  experimental: {
    defaults: {
      nuxtLink: {
        trailingSlash: "append",
      },
    },
  },

  hooks: {
    // Ensure page trailing slash
    "pages:extend": function (pages) {
      for (const page of pages) {
        page.path = page.path.endsWith("/") ? page.path : `${page.path}/`;
      }
    },
  },
});
