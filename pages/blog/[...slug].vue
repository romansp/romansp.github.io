<script setup lang="ts">
import { format } from 'date-fns'

const route = useRoute()
const { data } = await useAsyncData(route.fullPath, () => queryContent(route.fullPath).findOne())

useSeoMeta({
  twitterTitle: computed(() => data.value?.title),
  twitterDescription: computed(() => data.value?.description),
  twitterImage() {
    return '/og-image.png'
  },
})
</script>

<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <article class="prose dark:prose-invert">
        <h1>{{ doc.title }}</h1>
        <p>
          <time :datetime="doc.date">{{ format(doc.date, "PPP") }}</time>
        </p>
        <ContentRenderer :value="doc" />
      </article>
    </ContentDoc>
  </main>
</template>
