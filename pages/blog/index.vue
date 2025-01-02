<script setup lang="ts">
import type { QueryBuilderParams } from "@nuxt/content";
import { format } from "date-fns";

const query: QueryBuilderParams = { path: "blog", sort: [{ date: -1 }] };
</script>

<template>
  <main>
    <ContentList v-slot="{ list }" :query="query">
      <ul class="space-y-4">
        <li
          v-for="article in list"
          :key="article._path"
        >
          <NuxtLink :to="article._path">
            <h2 class="text-xl underline">
              {{ article.title }}
            </h2>
            <time class="text-xs opacity-70" :datetime="article.date">{{ format(article.date, "PPP") }}</time>
          </NuxtLink>
        </li>
      </ul>
    </ContentList>
  </main>
</template>
