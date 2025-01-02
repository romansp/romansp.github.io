---
title: 'Common Mistakes in TanStack Query and Vue.js Composition API'
date: 2024-05-26
---

Let's talk about some common mistakes when using TanStack Query together with Vue.js Composition API.

While these mistakes often come from those who just started working with TanStack Query, Vue.js Composition API and `<script setup>` or from more mature developers migrating their applications from Vue 2 to Vue 3.

Most of the time it comes down to **reactivity loss** and usually can be fixed with just a few lines of code. However understanding why reactivity can be lost and how to retain it properly isn't entirely obvious.

Let's take a look at few examples, understand _why_ reactivity can be lost, and explore how to avoid making this mistake.

## Losing `defineProps` Reactivity

I see this one the most. Let's take a look at the following example: we have 2 components, `TodoList` and `TodoDetails`.

`TodoList` will show a list of all Todo items. It allows to change currently selected Todo to reveal its details in `TodoDetails`. Component `TodoDetails` accepts single `id` as a prop via `defineProps`. It also fetches Todo details using TanStack Query and displays them together with `id` prop.

```ts
export async function fetchTodo(id: string) {
  const response = await fetch(`https://api.example/todos/${id}`);
  return response.json();
}
```

```vue
// Todos.vue
<script setup lang='ts'>
import { ref } from "vue";
import { todos } from "./todos";

const selectedTodo = ref();
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
// TodosDetails.vue
<script setup lang='ts'>
import { useQuery } from "@tanstack/vue-query";
import { fetchTodo } from "./todo";

const props = defineProps<{
  id: string;
}>();

const todosQuery = useQuery({
  queryKey: ["todos", props.id],
  queryFn: () => fetchTodo(props.id),
});
</script>

<template>
  <div>Current todo: {{ id }}</div>
  <div>{{ todosQuery.data }}</div>
</template>
```

Looks fairly simple. You click on "Details" button for multiple Todos. You then notice even though `selectedTodo` changes and you see updated `id`, Todo details fetched only once and never change after that. You also don't see any new outgoing requests in your developer tools to get these details.

At this point you may think, okay let's manually watch `id` prop change and then refetch the query. Well certainly this should work now!

```ts
// Trust me there's a better way!
watch(() => props.id, () => {
  todosQueries.refetch();
});
```

You add a `watch` with refetch and try again. It seems to do the job just fine. You see new requests are going through, `id` is updating and details are updating too.

I wouldn't be writing this if there wasn't something wrong about this. If you previously had some experience with Query you may know by now that query results are cached by default. Accessing previously fetched query result should immediately return stale data while refetching new data in the background.

You look closer at your Todo list and notice a certain delay switching between Todos, indicating that this caching feature doesn't seem to work. You also then peek into TanStack Query dev tools and you only see a single cache entry with `id` equal to the id of the first clicked Todo Details.

So what's going on?

### Why Reactivity Loss Happens?

Before revealing a solution to this issue let's take a step back and talk about _why_ prop reactivity loss happens.

You may already know that object received by `defineProps` in Vue component uses `reactive()` proxy internally. It means that assignment of reactive property to another variable will disconnect reactivity.

```ts
const state = reactive({ count: 0 });

// 'count' is disconnected from 'state.count'
let count = state.count;
// does not affect original state
count++;

console.log(count); // 1
console.log(state.count); // 0
```

This limitation of `reactive` is [discussed in Vue.js documentation](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#limitations-of-reactive) but it's really easy to underestimate how important this concept is to understanding Composable API better.

What does this limitation mean in our case? Because props is `reactive()` it means accessing `props.id` value disconnects it from original props object. `<script setup>` will be only called once per component lifetime.

For example if `prop.id` was equal to `"1"` then `queryKey` will be `["todos", "1"]`. `queryKey` is finalized and passed "as-is" into `useQuery` and there's no mechanism  to detect changes to `queryKey` anymore. It actually never changes as long as component is alive. Let's see how to fix this and how to retain props reactivity.

### How to Retain Props Reactivity

How can we make `useQuery` to detect changes to `queryKey`? Well, the good news - it already does. But only if `queryKey` is reactive or includes reactive or ref-like elements. Moreover, `useQuery` will internally deeply unwrap entries in `queryKey` array meaning you can have nested refs in there and it will setup all the required watchers to keep track of changes.

Let's do exactly that. Let's wrap `props.id` into Vue's or `toRef` to retain reactivity.

```ts
import { toRef } from "vue";

const todosQuery = useQuery({
  // you can also use 'computed(() => props.id)'
  queryKey: ["todos", toRef(() => props.id)],
  queryFn: () => fetchTodo(props.id),
});
```

Now `useQuery` understands that `queryKey` array includes a reactive value and can track its changes. When `queryKey` changes new entry will be added into Query cache. New Query cache entry will trigger `queryFn` call get the data for this particular Todo. You should see multiple cache entries (one per each Todo) in Query dev tools as well.

Just like that we got rid of manual `watch` and let `useQuery` to handle prop changes for us automatically.

## Losing Reactivity in Custom Composable

Another very common mistake occurs around wrapping `useQuery` in a custom composable. Maybe to have a named composable or just reuse in another component. It usually goes like this:

```ts
// useTodo.ts
// TodoDetails.vue
import { useTodo } from "./useTodo";

export function useTodo(id: string) {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id),
  });
}

const props = defineProps<{
  id: string;
}>();

// `id` reactivity loss
const todo = useTodo(props.id);
```

And we're back to the same problem we saw before. This time it's reactivity loss across function boundaries. How do we retain reactivity in this case?

### Retaining Reactivity Across Function Boundaries

To retain prop reactivity across function boundary you can again use `toRef` function with a prop getter. You can also pass getter function directly.

```ts
import { toRef } from "vue";

// use getter to retain props reactivity across function boundary
const todo = useTodo(() => props.id);
```

Let's also adjust `useTodo` composable to support reactive values.

We can change `string` to `Ref<string>` to indicate that function expects ref string. But sometimes we still want to allow both ref and non-reactive values to get the most flexibility out of it. For that matter Vue offers [`MaybeRefOrGetter<T>`](https://vuejs.org/api/utility-types.html#maybereforgetter) type that was added in v3.3.

```ts
export function useTodo(id: MaybeRefOrGetter<string>) {
  // ...
}
```

Now after changing function to accept both Ref and non-reactive values we still need a way to pass the value safely into `fetchTodo`. In other words we need to normalize possible ref into just a value.

To do just that Vue has [`toValue`](https://vuejs.org/api/reactivity-utilities.html#tovalue) utility function. This function normalizes values / refs / getters to just values. This is similar to `unref()`, except that it also normalizes getters. If the argument is a getter, it will be invoked and its return value will be returned.

Let's now add `toValue` to unwrap `id` and keep `fetchTodo` function intact.

```ts
import { useQuery } from "@tanstack/vue-query";
import { type MaybeRefOrGetter, toValue } from "vue";

export function useTodo(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(toValue(id)),
  });
}
```

Need to mention that we don't use `toValue` in `queryKey`. This is intentional. It's to ensure that when `id` parameter is Ref Query will properly detect `queryKey: ['todos', Ref<string>]` changes.

## Losing Reactivity in `queryOptions`

You may be already familiar with [`queryOptions`](https://tanstack.com/query/latest/docs/framework/vue/guides/query-options) helper TanStack added in v5 just recently. It allows to share `queryKey` and `queryFn` between multiple places, yet keep them co-located to one another.

```ts
function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id),
  });
}

// possible usage
useQuery(todoQueryOptions(1));
queryClient.prefetchQuery(todoQueryOptions(2));
queryClient.setQueryData(todoQueryOptions(3).queryKey, newTodo);
```

Unfortunately examples in TanStack docs only give a basic usage example and don't demonstrate how to retain reactivity when working with it in Vue.

### Leverage Reactive `useQuery` Options

You may not know but properties of `useQuery` options parameter accept reactive values. For example you can pass `computed()` value as your `queryKey` array or `enabled`.

```ts
const isEnabled = ref(true);

useQuery({
  // internally watches changes to 'isEnabled'
  enabled: isEnabled
});
```

Even better - `options` object itself can be fully `computed` and `useQuery` will watch it too.
```ts
// allowed and options is watched
useQuery(computed(() => {
  return queryOptions({
    // ...
  });
}));
```

### Putting it All Together

Computed `options` in `useQuery` is an extremely powerful tool. It allows to keep `queryOptions` pure (without any Vue-specific types) while still retaining full reactivity of Vue.

Let's put it all together.

```ts
function todoQueryOptions(id: string) {
  return queryOptions({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id),
  });
}

export function useTodo(id: MaybeRefOrGetter<string>) {
  return useQuery(
    computed(() => {
      return {
        ...todoQueryOptions(toValue(id)),
        // you can still add composable specific options, e.g. 'staleTime', 'placeholderData', etc.
        staleTime: 5000,
      };
    }),
  );
}
```

That's it for today. Hope it will help you to avoid making these mistakes when dealing with TanStack Query, Vue.js Composition API and reactivity.
