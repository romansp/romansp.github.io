<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <div class="prose dark:prose-invert">
        <ContentRenderer :value="doc" />
      </div>
    </ContentDoc>
  </main>
</template>
