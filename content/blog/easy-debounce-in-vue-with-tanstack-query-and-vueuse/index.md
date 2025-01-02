---
title: 'Easy Debounce in Vue with TanStack Query and VueUse'
date: 2025-01-02
---

Today I would like to share really neat and efficient solution how to create debounced search component in Vue.js with TanStack Query and a little help from VueUse library. Let's start from scratch with a very basic implementation and keep on adding features.

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

Even though this works quite well we'd like to avoid querying the server per each character update. Ideally we'd like to somehow _delay_ or _debounce_ `queryFn` execution until user has finished typing.

Naive and most likely incorrect solution would be to attempt to wrap `queryFn` or `search` function into lodash's `debounce`. Even though it _might_ work I find this solution quite messy and convoluted.

Let me show you a better way to solve this.

```vue
<script setup lang="ts">
// use refDebounced from VueUse
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

Here we're using [refDebounced](https://vueuse.org/shared/refDebounced/) from VueUse to debounce execution of a ref value by 500 milliseconds. This means `searchTermDebounced.value` will sync to `searchTerm` _only after_ 500 milliseconds has passed after the last update (in our case keystroke). If user keeps typing debounce timeout will be reset.

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

From now on Query "watches" debounced ref value for changes in `queryKey`. It won't execute `queryFn` because update of `queryKey` is also debounced now.

I found this solution very effective. It decouples data fetching from UI implementation and `searchTerm` value binding. It allows to tweak debouncing behavior while keeping actual data fetching implementation clean.

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
