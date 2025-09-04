---
title: 'Easy Debounce in Vue with TanStack Query and VueUse'
date: 2025-01-02
description: Efficient implementation of debounced Query in Vue
---

Today I would like to share really neat and efficient solution how to create debounced search component in Vue.js with TanStack Query and a little help from VueUse library. Let's start from scratch with a very basic implementation and keep on adding features.

## Basic implementation with TanStack Query

We'll begin with a `searchTerm` to store typed in text. Let's bind it to `<input>` with the help of `v-model` directive. Of course we'll use `ref` primitive from Vue.js to keep it reactive.

```vue
<script setup lang="ts">
const searchTerm = ref("");
</script>

<template>
  <input v-model="searchTerm" />
</template>
```

Now let's connect `searchTerm` value to TanStack `useQuery` to perform data fetching.

```vue
<script setup lang="ts">
async function search(searchTerm: string) {
  // omitted. perform server call, e.g. with 'axios', and return data
}

const { data } = useQuery({
  // ensure to pass searchTerm ref into queryKey array as-is
  // it will be properly unwrapped and watched by TanStack Query
  queryKey: ["search", searchTerm],
  queryFn: () => {
    return search(searchTerm.value);
  },
});
</script>

<template>
  <input v-model="searchTerm" />
  <div>
    {{ data }}
  </div>
</template>
```

Our `search` function call inside `queryFn` uses `searchTerm` value which means it must be added to `queryKey` option.

Key point here is to avoid reactivity loss of `searchTerm` inside `useQuery`. This is crucial to render data correctly. To achieve that pass ref-like entries into `queryKey` as-is. TanStack will automatically unwrap and setup a watcher for ref-like entries in `queryKey` array. Also `queryKey` itself can be declared as `ref` or `computed`.

```ts
import { computed } from "vue";

useQuery({
  // queryKey: ["search", searchTerm],
  // also allowed
  queryKey: computed(() => ["search", searchTerm.value])
});
```

To better understand reactivity loss issues check out [my previous blog post](/blog/common-mistakes-in-tanstack-query-and-vuejs-composition-api). There I covered some common mistakes when dealing with TanStack Query and Vue.js reactivity.

## Disable query for empty search

Let's keep moving. After running our implementation you may notice that query executes with empty query value as soon as component mounts. This is because for Query it's perfectly valid and it automatically runs `queryFn` on mount. Let's fix this by providing `enabled` flag. Also notice we use `computed` to keep reactivity and cast `searchTerm` to boolean.

```ts
import { computed } from "vue";

const { data } = useQuery({
  // don't run query if search term is empty
  enabled: computed(() => !!searchTerm.value)
});
```

Now this is ready:
1. `searchTerm` is bounded to `<input>` element via `v-model`.
1. User types in query causing `searchTerm` to update.
1. Change in `searchTerm` is detected by Query via `queryKey` watch and executes `queryFn`.
1. `queryFn` runs. Data is fetched from the server.
1. TanStack Query uses returned value from `queryFn` to update `data`.
1. `data` change causes template to re-render.

## Delay data-fetching by debouncing `queryKey` value

Even though this works quite well we'd like to avoid querying the server on each typed character. Ideally we'd like to somehow _delay_ or _debounce_ `queryFn` execution until user has finished typing.

Naive and brute-force solution would be to attempt to wrap `queryFn` or `search` functions into something like lodash's `debounce`. Such implementation quite often leads to subtle bugs. And even though it _might_ work eventually I find this kind solution quite messy and convoluted. Of course there's nothing wrong with debouncing functions in general. But combining debounced functions together with TanStack Query is where it becomes somewhat odd.

In our case instead of debouncing `queryFn` we're going to debounce the value of `queryFn`. It does sound strange so let me show you can achieve this with VueUse.

```vue
<script setup lang="ts">
import { refDebounced } from "@vueuse/core";

const searchTerm = ref("");

// debounces searchTermDebounced update by 500ms
const searchTermDebounced = refDebounced(searchTerm, 500);

// ...
</script>

<template>
  <!-- keep using 'searchTerm' binding -->
  <input v-model="searchTerm" />
</template>
```

Here we're using [refDebounced](https://vueuse.org/shared/refDebounced/) from VueUse to debounce execution of a ref value by 500 milliseconds. It means `searchTermDebounced.value` will sync to `searchTerm` _only after_ 500 milliseconds has passed after the last update (in our case keystroke). If user keeps typing debounce timeout will be reset.

Next let's update `useQuery` to use debounced ref instead.

```ts
const { data } = useQuery({
  queryKey: ["search", searchTermDebounced],
  queryFn: () => {
    // make sure to use debounced value to perform server call
    return search(searchTermDebounced.value);
  },
  enabled: computed(() => !!searchTermDebounced.value),
});
```

Now `queryKey` value itself is debounced and Query will detect changes only after debounce timeout has completed. It means it won't execute `queryFn` per each keystroke anymore. But when debounce timeout completes `queryFn` will use debounced `searchTermDebounced` value. Exactly what we need!

## Final result

I found this solution to query debouncing very effective and elegant. It clearly decouples data fetching from UI concerns. It allows to freely tweak debouncing behavior while keeping actual data fetching implementation clean.

Complete source code for debounced search implementation:
```vue
<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { refDebounced } from "@vueuse/core";
import { computed, ref } from "vue";

const searchTerm = ref("");
const searchTermDebounced = refDebounced(searchTerm, 500);

async function search(searchTerm: string) {
  // perform server call, e.g. with 'axios'
  // implementation omitted
}

const { data } = useQuery({
  queryKey: ["search", searchTermDebounced],
  queryFn: () => {
    return search(searchTermDebounced.value);
  },
  enabled: computed(() => !!searchTermDebounced.value),
});
</script>

<template>
  <input v-model="searchTerm" placeholder="Search" />
  <div>
    {{ data }}
  </div>
</template>
```

That's it for today. Hope you find this trick useful and it finds place in your next debounced search implementation.
