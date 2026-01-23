import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  modules: [
    "@nuxtjs/sitemap",
    "@nuxtjs/robots",
    "@nuxt/content",
    "@nuxtjs/mdc",
    "nuxt-og-image",
  ],

  css: ["~/style.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  typescript: {
    typeCheck: true,
  },

  site: {
    url: "https://paulau.dev",
    name: "Raman Paulau",
    trailingSlash: true,
  },

  ogImage: {
    zeroRuntime: true,
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
});
