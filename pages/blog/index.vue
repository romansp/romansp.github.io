<template>
  <main>
    <ContentList v-slot="{ list }" path="blog">
      <ul>
        <li
          v-for="article in list"
          :key="article._path"
        >
          <NuxtLink :to="article._path">
            <h2>{{ article.title }}</h2>
            <p>{{ article.description }}</p>
            <time :datetime="article.date">{{ article.date }}</time>
          </NuxtLink>
        </li>
      </ul>
    </ContentList>
  </main>
</template>
