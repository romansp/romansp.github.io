---
title: 'Handle version skew after new deployment with Vite and Vue Router'
date: 2024-12-01
---

I'd like to share this simple solution I found on how to handle frontend client version skew after new Vue app deployment. I found it when exploring Nuxt's codebase. Original Nuxt's solution [can be found here](https://github.com/nuxt/nuxt/blob/2ea738854e3428f2cb03036630e6415b077fe732/packages/nuxt/src/app/plugins/chunk-reload.client.ts). Props to Nuxt team!

This solution isn't limited only to Vue apps and can be used in any App which uses Vite as its bundler. Though in this article I will focus on solving this with Vue and Vue Router.

## Frontend version skew from Vue Router code split

Frontend version skew is an issue which happens after a new deployment occurs while current clients still have old website loaded. They might keep the browser tab open for days or even weeks.

When building Vue app JavaScript bundle can become quite large and affect page loading time. (https://router.vuejs.org/guide/advanced/lazy-loading.html#Lazy-Loading-Routes) is to perform bundle split into separate chunks per each route, and only load that chunk when route is actually visited.

Vue Router supports this via dynamic imports out of the box:

```ts
const router = createRouter({
  // ...
  routes: [
    { path: '/users/:id', component: () => import('./views/UserDetails.vue') },
  ],
})
```

When using Vite bundler it will automatically code split `UserDetails.vue` into a separate bundle chunk. Also Vite by default Vite appends hash value to the chunk filename to help with client-side cache invalidation.

In our router config example `UserDetails` bundle chunk file name may look like, `UserDetails-BZBpiADS.js`. This hash is computed by hashing file contents, which means it will change if original file contents change. So if content has indeed changed, previously named `UserDetails-BZBpiADS.js` may become `UserDetails-1hmwlKRw.js`.

When a new deployment occurs, the hosting service may delete the assets from previous deployments. As a result, a user who visited your site before the new deployment might encounter an import error. This error happens because the assets running on that user's device are outdated and it tries to import the corresponding old chunk, which is deleted.

We would like to handle such chunk loading errors. For example we could do a hard app reload at the route where users tries to navigate to. This will reload main JS bundle and get new URLs to all other asynchronously loaded chunks.

## Vite `vite:preloadError` to the rescue

Vite team [took care of this issue](https://vite.dev/guide/build.html#load-error-handling) and its runtime will trigger `vite:preloadError` event on `window` when Vite fails to load dynamic imports. `event.payload` will contain the original import error as well. If you call `event.preventDefault()`, the error will be considered handled and will not be rethrown.

```ts
window.addEventListener('vite:preloadError', (event) => {
  // handle preload failure
})
```

Original PR for adding `vite:preloadError` from Daniel Roe can be found here https://github.com/vitejs/vite/pull/12084. Thanks Daniel 🎉!

## Combining chunk preload error with Vue Router

We also need to combine Vite runtime error with the Vue Router navigation to reload the app. We would start by keeping track of errors coming from `vite:preloadError` event.

```ts
const chunkErrors = new Set<Error>();

window.addEventListener("vite:preloadError", event => {
  chunkErrors.add(event.payload);
});
```

Because we didn't call `preventDefault` errors will bubble higher and eventually will be captured by `route.onError` error handler. Let's check if that's the same error that was just thrown by `vite:preloadError`. If it's indeed the same error - we can do our error handling.

```ts
router.onError((error, to) => {
  if (chunkErrors.has(error)) {
    // we just saw this error in `vite:preloadError`, let's handle it
  }
})
```

So by now it's clear: currently running route navigation caused chunk preload error. We also have `to` object from Vue Router which tells us which route client is trying to navigate to. We can use this information to reload our app at target path and hopefully will receive correct chunk. App reload function at path could look like this:

```ts
import { joinURL } from "ufo";

function reloadAppAtPath(to: RouteLocation) {
  const path = joinURL(import.meta.env.BASE_URL, to.fullPath);
  if (globalThis.location.pathname !== path) {
    globalThis.location.href = path;
  } else {
    globalThis.location.reload();
  }
}
```

At this point we have all the needed parts for our solution. We can combine it all together into a composable function.

```ts
import { joinURL } from "ufo";
import { type RouteLocation, useRouter } from "vue-router";

export function useChunkPreloadErrorHandling() {
  const router = useRouter();

  const chunkErrors = new Set<Error>();

  // make sure to clean seen errors before the navigation
  router.beforeEach(() => {
    chunkErrors.clear();
  });

  function reloadAppAtPath(to: RouteLocation) {
    const path = joinURL(import.meta.env.BASE_URL, to.fullPath);
    if (globalThis.location.pathname !== path) {
      globalThis.location.href = path;
    } else {
      globalThis.location.reload();
    }
  }

  window.addEventListener("vite:preloadError", event => {
    chunkErrors.add(event.payload);
  });

  router.onError((error, to) => {
    if (chunkErrors.has(error)) {
      reloadAppAtPath(to);
    }
  });
}
```

And use it in app's root component:

```vue
<script setup lang="ts">
import { useChunkPreloadErrorHandling } from './chunk-reload'

useChunkPreloadErrorHandling()
</script>

<template>
  <RouterView />
</template>
```

So now when chunk load error happens it will be properly captured, target route's path will be constructed and app will perform full reload at the correct URL. To the client this looks like a normal page navigation.

I find this solution quite powerful and very elegant. Without getting into tricky and advanced techniques of bundle invalidation, e.g. PWA's service workers or using dedicated CDN to store previous bundle versions.

And it could also be easily extended. For example if you need to preserve app's current state you can do it in-place just before triggering page reload.
