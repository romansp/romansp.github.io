<script setup lang="ts">
defineProps<{
  title?: string;
  description?: string;
}>();

const domain = new URL(useSiteConfig().url).host;
</script>

<template>
  <div class="h-full w-full flex items-start justify-start border-solid border-gray-500 border-12 text-slate-300 bg-gray-900">
    <div class="flex h-full">
      <div class="flex flex-col w-full h-full p-20">
        <h1 class="text-5xl">
          {{ title }}
        </h1>
        <p class="text-2xl">
          {{ description }}
        </p>
        <p class="text-xl">
          {{ domain }}
        </p>
      </div>
    </div>
  </div>
</template>
