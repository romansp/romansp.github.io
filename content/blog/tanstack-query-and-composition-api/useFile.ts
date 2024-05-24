import { type MaybeRefOrGetter, computed, toValue } from 'vue'
import { queryOptions, useQuery } from '@tanstack/vue-query'

export function todoQueryOptions(todoId: string) {
  return queryOptions({
    queryKey: ['todos', 'detail', todoId],
    queryFn: async ({ signal }) => {
      const response = await fetch(`api/todos/${todoId}`, { signal });
      // fetch will not throw for 4xx and 5xx
      // consider `axios` or `ky` that automatically reject promise for unsuccessful responses
      if (!response.ok) {
        throw new Error('Failed to fetch todo')
      }
      return response.json()
    },
  });
}

export function useTodo(todoId: MaybeRefOrGetter<string>) {
  const options = computed(() => todoQueryOptions(toValue(todoId)))
  const query = useQuery(options);

  return query;
}
