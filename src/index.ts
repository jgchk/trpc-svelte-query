export * from '@trpc/client';

export {
	createTRPCSvelteClient,
	createTRPCSvelte,
	type CreateTRPCSvelte,
} from './createTRPCSvelte';

export type { inferSvelteQueryProcedureOptions } from './utils/inferSvelteQueryProcedure';
