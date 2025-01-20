import { defineCollection, defineContentConfig, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: "blog/**/*.md",
      type: "page",
      schema: z.object({
        date: z.string(),
        updatedAt: z.string().optional(),
      }),
    }),
    content: defineCollection({
      source: "**",
      type: "page",
    }),
  },
});
