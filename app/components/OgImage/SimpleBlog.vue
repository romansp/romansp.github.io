<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();

const domain = new URL(useSiteConfig().url).host;
</script>

<template>
  <div class="h-full w-full border-y-12 border-gray-500 bg-gray-900 text-slate-300 p-16">
    <h1 class="text-5xl mb-4">
      {{ title }}
    </h1>
    <p class="text-2xl mb-4">
      {{ description }}
    </p>
    <p class="text-xl">
      {{ domain }}
    </p>
  </div>
</template>
