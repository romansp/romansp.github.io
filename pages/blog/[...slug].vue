<script setup lang="ts">
import { format } from 'date-fns'

const { page } = useContent()

useSeoMeta({
  twitterTitle() {
    return page.value.title
  },
  twitterDescription() {
    return page.value.description
  },
  twitterImage() {
    return '/og-image.png'
  },
})
</script>

<template>
  <main>
    <article class="prose dark:prose-invert">
      <h1>{{ page.title }}</h1>
      <p>
        <time :datetime="page.date">{{ format(page.date, "PPP") }}</time>
      </p>
      <ContentRenderer :value="page" />
    </article>
  </main>
</template>
