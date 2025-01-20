<script setup lang="ts">
import { format } from "date-fns";

const route = useRoute();
const { data: page } = await useAsyncData(route.fullPath, () => queryCollection("blog").path(route.path).first());

function toDate(date: string | undefined) {
  if (!date) {
    return;
  }
  return new Date(date).toISOString();
}

useSeoMeta({
  twitterTitle: computed(() => page.value?.title),
  twitterDescription: computed(() => page.value?.description),
  articlePublishedTime: computed(() => toDate(page.value?.date)),
  articleModifiedTime: computed(() => toDate(page.value?.updatedAt ?? page.value?.date)),
});

defineOgImageComponent("NuxtSeo");
</script>

<template>
  <main>
    <article
      v-if="page"
      class="prose dark:prose-invert"
    >
      <h1 class="mb-0">
        {{ page.title }}
      </h1>
      <p class="opacity-70 text-xs">
        <time :datetime="page.date">{{ format(page.date, "PPP") }}</time>
      </p>
      <p v-if="page.updatedAt" class="opacity-70 text-xs">
        (updated: <time :datetime="page.updatedAt">{{ format(page.updatedAt, "PPP") }}</time>)
      </p>
      <ContentRenderer v-if="page" :value="page" />
      <a :href="`https://github.com/romansp/romansp.github.io/blob/main/content${page.path}/index.md`">Suggest edit to this page</a>
    </article>
    <div
      v-else
      class="prose dark:prose-invert"
    >
      <h1>404</h1>
      <p>
        Page Not Found
      </p>
      <NuxtLink class="underline" to="/">
        Home
      </NuxtLink>
    </div>
  </main>
</template>
