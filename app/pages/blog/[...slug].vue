<script setup lang="ts">
const route = useRoute();
const { data: page } = await useAsyncData(route.fullPath, () => queryCollection("blog").path(route.path).first());

function toDate(date: string | undefined) {
  if (!date) {
    return;
  }
  return new Date(date).toISOString();
}

const pageTitle = computed(() => {
  const title = page.value?.title;
  if (!title) {
    return "Raman Paulau";
  }

  if (title !== "Raman Paulau") {
    return `${title} - Raman Paulau`;
  }

  return title;
});

useHead({
  title: pageTitle.value,
});

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
        <NuxtTime
          :datetime="page.date"
          year="numeric"
          month="long"
          day="numeric"
        />
      </p>
      <p v-if="page.updatedAt" class="opacity-70 text-xs">
        (updated: <NuxtTime
          :datetime="page.updatedAt"
          year="numeric"
          month="long"
          day="numeric"
        />)
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
