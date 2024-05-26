<script setup lang="ts">
import { format } from 'date-fns'

const route = useRoute()
const { data } = await useAsyncData(route.fullPath, () => queryContent(route.fullPath).findOne())

useSeoMeta({
  twitterTitle: computed(() => data.value?.title),
  twitterDescription: computed(() => data.value?.description),
})

defineOgImageComponent('NuxtSeo')
</script>

<template>
  <main>
    <ContentDoc>
      <template #default="{ doc }">
        <article class="prose dark:prose-invert">
          <h1>{{ doc.title }}</h1>
          <p class="opacity-70 text-xs -mt-6">
            <time :datetime="doc.date">{{ format(doc.date, "PPP") }}</time>
          </p>
          <ContentRenderer :value="doc" />
        </article>
      </template>
      <template #not-found>
        <div class="prose dark:prose-invert">
          <h1>404</h1>
          <p>
            Page Not Found
          </p>
          <NuxtLink to="/">
            Home
          </NuxtLink>
        </div>
      </template>
    </ContentDoc>
  </main>
</template>
