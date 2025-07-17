<script setup lang="ts">
useHead({
  titleTemplate: titleChunk => {
    if (titleChunk === "Raman Paulau") {
      return titleChunk;
    }
    return titleChunk ? `${titleChunk} - Raman Paulau` : "Raman Paulau";
  },
  htmlAttrs: {
    lang: "en",
    class: "dark dark:bg-gray-900",
  },
  link: [{ rel: "icon", type: "image/png", href: "/favicon.png" }],
});

defineOgImageComponent("SimpleBlog");
</script>

<template>
  <div class="min-h-screen text-gray-900 antialiased dark:bg-gray-900 dark:text-slate-300">
    <header>
      <nav class="flex flex-col p-8 px-4 py-6">
        <div class="flex gap-4">
          <ul class="flex gap-2">
            <li>
              <NuxtLink class="underline" to="/">
                Home
              </NuxtLink>
            </li>
            <li>
              <NuxtLink class="underline" to="/blog">
                Blog
              </NuxtLink>
            </li>
          </ul>
          <ul class="ml-auto flex gap-2">
            <li>
              <a class="underline" href="https://github.com/romansp">GitHub</a>
            </li>
            <li>
              <a class="underline" href="https://bsky.app/profile/paulau.dev">Bluesky</a>
            </li>
            <li>
              <a class="underline" href="https://twitter.com/rpvlv">Twitter</a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div class="mx-auto flex max-w-6xl justify-center px-4 py-4 sm:px-6 lg:px-8 lg:py-16">
      <NuxtPage class="min-w-0" />
    </div>
  </div>
</template>
