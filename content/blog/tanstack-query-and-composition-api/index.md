---
title: 'TanStack Query in Vue.js and Composition API'
draft: true
date: 2024-05-19T22:00:00.000Z
---

In this article I'll try to cover common issues I'm seeing fairly regularly while reviewing code using Vue and TanStack Query. Most of these issues come from "reactivity loss". Let's take a deeper look into this.

## Losing Reactivity of `defineProps`

This issue is particularly common. It usually comes from the lack of understanding how component's prop reactivity behaves in Vue.

Let's look at the following example. You have 2 components: `TodoList` and `TodoDetails`. `TodoList` shows a list of all Todo items. You can change currently selected Todo to reveal its details. And `TodoDetails` component accepts single `id` as a prop, fetches details and displays them.

```vue
// Todos.vue
<script setup lang='ts'>
import { ref } from 'vue'

const selectedTodo = ref()
</script>

<template>
  <div v-for="todo in todos" :key="todo.id">
    {{ todo }} <button @click="selectedTodo = todo">
      Details
    </button>
  </div>
  <TodoDetails :id="selectedTodo.id" />
</template>
```

```vue
// TodoDetails.vue
<script setup lang='ts'>
import { useQuery } from "@tanstack/vue-query";

const props = defineProps<{
  id: string
}>();

const todosQuery = useQuery({
  queryKey: ['todos', props.id],
  queryFn: () => fetchTodo(props.id),
})
</script>
<template>
  <div>Current todo: {{ id }}</div>
  <div>{{ todosQuery.data }}</div>
</template>
```

Looks fairly simple. You click on "Details" button for multiple Todos. You start to notice that even though `selectedTodo` changes and you see `id` is updated, Todo details are fetched and displayed only once and don't change after that. You also don't see any new outgoing requests in your developer tools to get these details.

At this point you think: okay let's manually watch `id` prop change and then manually refetch the query. Well certainly this should work now!

```ts
// Don't do this. There's a better way!
watch(() => props.id, () => {
  todosQueries.refetch()
})
```

You add this `watch` and try again. It seems to do the job just fine. You see new requests are going through, `id` is updating and details too. Well I wouldn't be writing this if there wasn't something wrong about this. You actually may notice a certain delay switching between Todos that have already been fetched.

Even though these Todos should have been displayed immediately from Query cache while refetching fresh data from the server. You also might peek into TanStack Query dev tools and you only see a single cache entry.

So what's going on?

### Why Reactivity is Lost?

Before revealing a proper solution to this very common problem let's take a step back and think about _why_ prop reactivity has been lost here.

You might already know that object received by `defineProps` uses `reactive()` internally. What it means is when assignment of `props.id` to another variable happens link to original value becomes disjoined and reactivity is lost. Think of it as this:
```ts
const props = defineProps<{
  id: string
}>();

// propId is not reactive
const propId = props.id;
```

Here `propId` is assigned outside of effect (e.g. `computed`) and gets detached from `props.id` and Vue has no special awareness about it. It means that when it's later passed into `queryKey` "as-is" there's no mechanism for `useQuery` to detect its changes anymore.

### How to Retain Props Reactivity

So how can I make `useQuery` to still detect changes to `queryKey`? Well the good news is - it already does it for you but only if your `queryKey` is reactive itself or includes reactive values in array. `useQuery` will internally deeply unwrap entries in `queryKey` array and will setup all required watchers.

Let's do exactly that. Let's wrap `props.id` into Vue's `computed` or `toRef` to retain reactivity.

```ts
import { toRef } from 'vue'

const todosQuery = useQuery({
  queryKey: ['todos', toRef(() => props.id)],
  queryFn: () => fetchTodo(props.id),
})
```

Now `useQuery` will be aware that `queryKey` includes a reactive value and can track when it changes. After `queryKey` changes new entry will be added into Query cache, thus `queryFn` will be called to get data for this particular todo. You should see multiple cache entries (one per each Todo) in Query dev tools.

## Losing Reactivity in Composable

This is another very common area where mistakes happen quite a lot. Author tries to extract `useQuery` into a custom composable. Maybe to have a better named composable or just reuse it in multiple components. It usually boils down to this:

```ts
// No reactivity
export function useTodo(id: string) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(id),
  })
}
```

With typical usage like:

```ts
import { useTodo } from './useTodo'

const props = defineProps<{
  id: string
}>()

// Loses `id` reactivity
const todo = useTodo(props.id)
```

And we're back to the same problem we saw in the beginning of this article. This way of usage also creates an issue of reactivity loss when we pass reactive variables across function boundaries.

### Retaining Reactivity Across Function Boundaries

Let's fix this. First, to retain prop reactivity across function boundary you can again use `toRef` function with a prop getter.

```ts
import { toRef } from 'vue'

// wrap into toRef to retain props reactivity across function boundary
const todo = useTodo(toRef(() => props.id))
```

Second, we need to adjust `useTodo` composable to support reactive parameters.

While it's okay to use `Ref<T>` to indicate ref arguments, sometimes we still want to allow both reactive and non-reactive values for the most flexibility. For that matter Vue offers `MaybeRefOrGetter<T>` type.

Now when function accept both Ref and non-reactive values we need a way to safely normalize it. To do just that Vue offers utility function called `toValue`. This utility function normalizes values / refs / getters to just values. This is similar to `unref()`, except that it also normalizes getters. If the argument is a getter, it will be invoked and its return value will be returned.

Here we're going to use `toValue` to unwrap ref-like value to avoid leaking Vue's internals into data-fetching layer and allows to keep `fetchTodo` function unchanged.

```ts
import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'

export function useTodo(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(toValue(id)),
  })
}
```

I need to mention that we intentionally don't use `toValue` here in `queryKey`. This is to ensure that when passed `id` is ref-like and Query will track `queryKey` changes.

## Losing Reactivity in `queryOptions`

You may be already familiar with [`queryOptions`](https://tanstack.com/query/latest/docs/framework/vue/guides/query-options) helper TanStack added to v5 recently. It allows to share `queryKey` and `queryFn` between multiple places, yet keep them co-located to one another.

Unfortunately examples in TanStack docs only give a basic usage example and don't demonstrate how to retain reactivity.

```ts
function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(id),
  })
}

// possible usage
useQuery(todoQueryOptions(1));
queryClient.prefetchQuery(todoQueryOptions(2))
queryClient.setQueryData(todoQueryOptions(3).queryKey, newTodo)
```

### Leverage Reactive `useQuery` Options

You may not now but properties of `useQuery` options can be reactive. It means you can pass `computed` as your `queryKey` or `enabled`.

```ts
const isEnabled = ref(true)

useQuery({
  // watches changes to 'isEnabled'
  enabled: isEnabled
})
```

Even better - `options` object itself can be `computed` and `useQuery` will watch it.
```ts
// allowed and options internally watched
useQuery(computed(() => {
  return queryOptions({
    // ...
  })
}))
```

> Currently [there's an open issue](https://github.com/TanStack/query/issues/7420) around TypeScript types when passing `computed` into `useQuery`. Pinning @tanstack/vue-query to v5.35.1 is a temporary workaround.

### Putting it All Together

Computed `options` in `useQuery` is extremely powerful concept. It allows to keep `queryOptions` pure (without any Vue-specific types) while still retaining full reactivity.

Let's put it all together.

```ts
function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: ['todos', id],
    queryFn: () => fetchTodo(id),
  })
}

export function useTodo(id: MaybeRefOrGetter<string>) {
  return useQuery(
    computed(() => {
      return {
        ...todoQueryOptions(toValue(id)),
        // you can still add composable specific options: staleTime, placeholderData, etc.
        staleTime: 5000,
      }
    }),
  )
}
```

It's really the best of both worlds: fine-grained Vue's reactivity with `queryOptions` TypeScript powerhouse.
