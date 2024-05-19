---
title: 'Tanstack Query in Vue.js and Composition API'
draft: true
date: 2024-05-19T22:00:00.000Z
---

```ts
// queries.ts
const keys = {
  files: ['files'] as const,
  file: (id: string) => [...keys.files, id.toLowerCase() ] as const,
};
```

```ts
export function fileQueryOptions(fileId: string) {
  return queryOptions({
    queryKey: keys.file(fileId),
    queryFn: ({ signal }) => {
      const response = await fetch(`api/file/${fileId}`, { signal });
      // fetch will not throw for 4xx and 5xx
      // consider `axios` or `ky` that automatically reject promise for unsuccessful responses
      if (!response.ok) {
        throw new Error('Failed to fetch file')
      }
      return response.json()
    },
  });
}
```

```ts
// useFile.ts
import { type MaybeRefOrGetter, computed, toValue } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fileQueryOptions } from './queries.ts'

export function useFile(fileId: MaybeRefOrGetter<string>) {
  const options = computed(() => fileQueryOptions(toValue(fileId)));
  const query = useQuery(options);

  return query.data;
}
```
