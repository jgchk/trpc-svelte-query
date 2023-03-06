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

# `@trpc/svelte-query`

> A tRPC wrapper around svelte-query.

## Documentation

Full documentation for `@trpc/svelte-query` can be found [here](https://trpc.io/docs/svelte-query)

## Installation

```bash
# npm
npm install @trpc/svelte-query @tanstack/svelte-query

# Yarn
yarn add @trpc/svelte-query @tanstack/svelte-query

# pnpm
pnpm add @trpc/svelte-query @tanstack/svelte-query
```

## Basic Example

Create a utils file that exports tRPC hooks and providers.

```ts
import { createTRPCSvelte } from '@trpc/svelte-query';
import type { AppRouter } from './server';

export const trpc = createTRPCSvelte<AppRouter>();
```

Use the provider to connect to your API.

```ts
import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
import { trpc } from '~/utils/trpc';

export function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      url: 'http://localhost:5000/trpc',
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {/* Your app here */}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

Now in any component, you can query your API using the proxy exported from the utils file.

```ts
import { proxy } from '~/utils/trpc';

export function Hello() {
  const { data, error, status } = proxy.greeting.useQuery({ name: 'tRPC' });

  if (error) {
    return <p>{error.message}</p>;
  }

  if (status !== 'success') {
    return <p>Loading...</p>;
  }

  return <div>{data && <p>{data.greeting}</p>}</div>;
}
```
