<p align="center">
  <a href="https://trpc.io/"><img src="https://assets.trpc.io/icons/svgs/blue-bg-rounded.svg" alt="tRPC" height="75"/></a>
</p>

<h3 align="center">tRPC</h3>

<p align="center">
  <strong>End-to-end typesafe APIs made easy</strong>
</p>

<p align="center">
  <img src="https://assets.trpc.io/www/v10/v10-dark-landscape.gif" alt="Demo" />
</p>

# `@jgchk/trpc-svelte-query`

> A tRPC wrapper around svelte-query.

## Installation

```bash
# npm
npm install @jgchk/trpc-svelte-query @tanstack/svelte-query

# Yarn
yarn add @jgchk/trpc-svelte-query @tanstack/svelte-query

# pnpm
pnpm add @jgchk/trpc-svelte-query @tanstack/svelte-query
```

## Basic Example

Set up tRPC in `lib/trpc.ts`

```ts
import { createTRPCSvelte } from '@trpc/svelte-query'
import type { AppRouter } from '../server/routers/_app'

export const { createClient, setContextClient, getContextClient } = createTRPCSvelte<AppRouter>()
```

Set up a tRPC client in `routes/+layout.ts`

```ts
import { browser, dev } from '$app/environment'
import { QueryClient } from '@tanstack/svelte-query'
import { httpBatchLink, loggerLink } from '@trpc/client'
import { createClient } from '$lib/trpc'
import type { LayoutLoad } from './$types'

export const load: LayoutLoad = async ({ fetch }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        enabled: browser,
      },
    },
  })

  const trpc = createClient({
    queryClient,
    fetch,
    links: [
      loggerLink({ enabled: () => dev }),
      httpBatchLink({
        url: '/api/trpc',
        fetch,
      }),
    ],
  })

  return { trpc }
}
```

Then provide the client to the rest of your app via context in `routes/+layout.svelte`

```svelte
<script lang="ts">
  import { QueryClientProvider } from '@tanstack/svelte-query'
  import { setContextClient } from '$lib/trpc'
  import type { LayoutData } from './$types'

  export let data: LayoutData

  setContextClient(data.trpc)
</script>

<QueryClientProvider client={data.trpc.queryClient}>
  <slot />
</QueryClientProvider>
```

Now in any page or component, you can query your API using the client you created

```svelte
<script lang="ts">
  import { getContextClient } from '$lib/trpc'

  const trpc = getContextClient()
  const query = trpc.greeting.query({ name: 'tRPC' });
</script>

{#if $query.isSuccess}
  <p>{$query.data.greeting}</p>
{:else if $query.isError}
  <p>{$query.error.message}</p>
{:else}
  <p>Loading...</p>
{/if}
```

## SSR

You can prefetch queries on the server, which:

1. Renders their data during SSR
2. Prepopulates the client-side cache

In any `+page.ts` file, just call prefetchQuery

```ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ parent }) => {
  const { trpc } = await parent()
  await trpc.ping.prefetchQuery()
}
```
