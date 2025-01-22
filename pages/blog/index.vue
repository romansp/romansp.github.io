<script setup lang="ts">
import { format } from "date-fns";

useHead({
  title: `Blog - Raman Paulau`,
});

const route = useRoute();
const { data: articles } = await useAsyncData(route.path, () => {
  return queryCollection("blog").order("date", "DESC").all();
});
</script>

<template>
  <main>
    <ul class="space-y-4">
      <li
        v-for="article in articles"
        :key="article.id"
      >
        <NuxtLink :to="article.path">
          <h2 class="text-xl underline">
            {{ article.title }}
          </h2>
          <time class="text-xs opacity-70" :datetime="article.date">{{ format(article.date, "PPP") }}</time>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
