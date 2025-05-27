<script lang="ts" setup>
const route = useRoute();
const { data: page } = await useAsyncData(route.path, () => queryCollection("content").path(route.path).first());

useHead({
  title: computed(() => page.value?.title),
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
