<template>
  <div class="antialiased text-gray-900 dark:bg-gray-900 dark:text-slate-300 min-h-screen">
    <header>
      <nav class="p-8 flex flex-col px-4 py-6">
        <div class="flex gap-4">
          <ul class="flex gap-2">
            <NuxtLink to="/">
              Home
            </NuxtLink>
            <NuxtLink to="/blog">
              Blog
            </NuxtLink>
          </ul>
          <ul class="flex ml-auto gap-2">
            <a href="https://github.com/romansp">GitHub</a>
            <a href="https://twitter.com/rplvlv">Twitter</a>
          </ul>
        </div>
      </nav>
    </header>
    <div class="px-4 py-10 max-w-4xl mx-auto sm:px-6 sm:py-12 lg:max-w-4xl lg:py-16 lg:px-8 xl:max-w-6xl">
      <NuxtPage class="mx-auto" />
    </div>
  </div>
</template>
