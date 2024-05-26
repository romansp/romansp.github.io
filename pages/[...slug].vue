<template>
  <main>
    <ContentDoc>
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
