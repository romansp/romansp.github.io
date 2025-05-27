<script lang="ts" setup>
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection("content").path(route.path).first();
});

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
</script>

<template>
  <main>
    <div class="prose dark:prose-invert">
      <ContentRenderer v-if="page" :value="page" />
      <template v-else>
        <h1>404</h1>
        <p>
          Page Not Found
        </p>
        <NuxtLink class="underline" to="/">
          Home
        </NuxtLink>
      </template>
    </div>
  </main>
</template>
