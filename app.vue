<script setup lang="ts">
useHead({
  htmlAttrs: {
    lang: 'en',
    class: 'dark:bg-gray-900',
  },
  link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }],
})

defineOgImageComponent('NuxtSeo')
</script>

<template>
  <div class="antialiased text-gray-900 dark:bg-gray-900 dark:text-slate-300 min-h-screen">
    <header>
      <nav class="p-8 flex flex-col px-4 py-6">
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
          <ul class="flex ml-auto gap-2">
            <li>
              <a class="underline" href="https://github.com/romansp">GitHub</a>
            </li>
            <li>
              <a class="underline" href="https://twitter.com/rpvlv">Twitter</a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
    <div class="px-4 py-4 max-w-4xl mx-auto sm:px-6 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl flex justify-center ">
      <NuxtPage class="min-w-0" />
    </div>
  </div>
</template>
