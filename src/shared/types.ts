import { QueryClient } from '@tanstack/svelte-query';
import { AnyRouter, MaybePromise } from '@trpc/server';

/**
 * @internal
 */
export interface UseMutationOverride {
	onSuccess: (opts: {
		/**
		 * Calls the original function that was defined in the query's `onSuccess` option
		 */
		originalFn: () => MaybePromise<unknown>;
		queryClient: QueryClient;
		meta: Record<string, unknown>;
	}) => MaybePromise<unknown>;
}

/**
 * @internal
 */
export interface CreateTRPCSvelteOptions<_TRouter extends AnyRouter> {
	/**
	 * Override behaviors of the built-in hooks
	 */
	unstable_overrides?: {
		useMutation?: Partial<UseMutationOverride>;
	};
}
