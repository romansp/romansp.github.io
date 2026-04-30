<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();

const domain = new URL(useSiteConfig().url).host;
</script>

<template>
  <div class="block size-full border-y-12 border-solid border-gray-500 bg-gray-900 p-16 text-slate-300">
    <h1 class="mb-4 block text-5xl font-semibold">
      {{ title }}
    </h1>
    <p class="mb-4 block text-2xl">
      {{ description }}
    </p>
    <p class="block text-xl">
      {{ domain }}
    </p>
  </div>
</template>
