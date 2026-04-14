import { defineCollection, defineContentConfig, z } from "@nuxt/content";
import { defineOgImageSchema } from "nuxt-og-image/content";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      source: "blog/**/*.md",
      type: "page",
      schema: z.object({
        date: z.string(),
        updatedAt: z.string().optional(),
        ogImage: defineOgImageSchema(),
      }),
    }),
    content: defineCollection({
      source: "**",
      type: "page",
    }),
  },
});
