import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  modules: [
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/content",
    "@nuxtjs/mdc",
    "@nuxt/image",
    "nuxt-og-image",
  ],

  css: ["~/style.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  site: {
    url: "https://paulau.dev",
    name: "Raman Paulau",
    trailingSlash: true,
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: "github-dark-dimmed",
            dark: "github-dark-dimmed",
            light: "github-light",
          },
        },
      },
    },
  },

  compatibilityDate: "2025-05-27",

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
