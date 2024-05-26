<script setup>
import { format } from 'date-fns'
</script>

<template>
  <main>
    <ContentList v-slot="{ list }" path="blog">
      <ul>
        <li
          v-for="article in list"
          :key="article._path"
        >
          <NuxtLink :to="article._path" class="group hover:no-underline">
            <h2 class="text-xl underline group-hover:no-underline">
              {{ article.title }}
            </h2>
            <time class="text-xs opacity-70" :datetime="article.date">{{ format(article.date, "PPP") }}</time>
          </NuxtLink>
        </li>
      </ul>
    </ContentList>
  </main>
</template>
