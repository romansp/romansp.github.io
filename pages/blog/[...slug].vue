<script setup lang="ts">
import { format } from 'date-fns'
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
