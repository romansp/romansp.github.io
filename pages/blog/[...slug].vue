<script setup lang="ts">
import { format } from "date-fns";

const route = useRoute();
const { data } = await useAsyncData(route.fullPath, () => queryContent(route.fullPath).findOne());

function toDate(date: string) {
  if (!date) {
    return;
  }
  return new Date(date).toISOString();
}

useSeoMeta({
  twitterTitle: computed(() => data.value?.title),
  twitterDescription: computed(() => data.value?.description),
  articlePublishedTime: computed(() => toDate(data.value?.date)),
  articleModifiedTime: computed(() => toDate(data.value?.updatedAt ?? data.value?.date)),
});

defineOgImageComponent("NuxtSeo");
</script>

<template>
  <main>
    <ContentDoc>
      <template #default="{ doc }">
        <article class="prose dark:prose-invert">
          <h1 class="mb-0">
            {{ doc.title }}
          </h1>
          <p class="opacity-70 text-xs">
            <time :datetime="doc.date">{{ format(doc.date, "PPP") }}</time>
          </p>
          <p v-if="doc.updatedAt" class="opacity-70 text-xs">
            (updated: <time :datetime="doc.updatedAt">{{ format(doc.updatedAt, "PPP") }}</time>)
          </p>
          <ContentRenderer :value="doc" />
          <a :href="`https://github.com/romansp/romansp.github.io/blob/main/content${doc._path}/index.md`">Suggest edit to this page</a>
        </article>
      </template>
      <template #not-found>
        <div class="prose dark:prose-invert">
          <h1>404</h1>
          <p>
            Page Not Found
          </p>
          <NuxtLink class="underline" to="/">
            Home
          </NuxtLink>
        </div>
      </template>
    </ContentDoc>
  </main>
</template>
