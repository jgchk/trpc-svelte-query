import { AnyRouter } from '@trpc/server';
import { getContext, setContext } from 'svelte';
import { CreateTRPCSvelte } from '../createTRPCSvelte';

const trpcContextKey = Symbol('trpcContext');

export function setContextClient<TRouter extends AnyRouter, TFlags = null>(
	client: CreateTRPCSvelte<TRouter, TFlags>,
) {
	setContext(trpcContextKey, client);
}

export function getContextClient<TRouter extends AnyRouter, TFlags = null>() {
	return getContext<CreateTRPCSvelte<TRouter, TFlags>>(trpcContextKey);
}
