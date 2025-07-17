<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();

const domain = new URL(useSiteConfig().url).host;
</script>

<template>
  <div class="h-full w-full border-y-12 border-gray-500 bg-gray-900 p-16 text-slate-300">
    <h1 class="mb-4 text-5xl">
      {{ title }}
    </h1>
    <p class="mb-4 text-2xl">
      {{ description }}
    </p>
    <p class="text-xl">
      {{ domain }}
    </p>
  </div>
</template>
