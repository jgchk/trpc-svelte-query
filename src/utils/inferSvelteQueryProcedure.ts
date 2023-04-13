import { TRPCClientErrorLike } from '@trpc/client';
import {
	AnyMutationProcedure,
	AnyProcedure,
	AnyQueryProcedure,
	AnyRouter,
	inferProcedureInput,
} from '@trpc/server';
import { inferTransformedProcedureOutput } from '@trpc/server/shared';
import {
	CreateTRPCMutationOptions,
	CreateTRPCMutationResult,
	CreateTRPCQueryOptions,
	CreateTRPCQueryResult,
} from '../shared';

/**
 * @internal
 */
export type InferQueryOptions<
	TProcedure extends AnyProcedure,
	TPath extends string,
> = Omit<
	CreateTRPCQueryOptions<
		TPath,
		inferProcedureInput<TProcedure>,
		inferTransformedProcedureOutput<TProcedure>,
		inferTransformedProcedureOutput<TProcedure>,
		TRPCClientErrorLike<TProcedure>
	>,
	'select'
>;

/**
 * @internal
 */
export type InferMutationOptions<TProcedure extends AnyProcedure> =
	CreateTRPCMutationOptions<
		inferProcedureInput<TProcedure>,
		TRPCClientErrorLike<TProcedure>,
		inferTransformedProcedureOutput<TProcedure>
	>;

/**
 * @internal
 */
export type InferQueryResult<TProcedure extends AnyProcedure> =
	CreateTRPCQueryResult<
		inferTransformedProcedureOutput<TProcedure>,
		TRPCClientErrorLike<TProcedure>
	>;

/**
 * @internal
 */
export type InferMutationResult<
	TProcedure extends AnyProcedure,
	TContext = unknown,
> = CreateTRPCMutationResult<
	inferTransformedProcedureOutput<TProcedure>,
	TRPCClientErrorLike<TProcedure>,
	inferProcedureInput<TProcedure>,
	TContext
>;

export type inferSvelteQueryProcedureOptions<
	TRouter extends AnyRouter,
	TPath extends string = '',
> = {
	[TKey in keyof TRouter['_def']['record']]: TRouter['_def']['record'][TKey] extends infer TRouterOrProcedure
		? TRouterOrProcedure extends AnyRouter
			? inferSvelteQueryProcedureOptions<
					TRouterOrProcedure,
					`${TPath}${TKey & string}.`
			  >
			: TRouterOrProcedure extends AnyMutationProcedure
			? InferMutationOptions<TRouterOrProcedure>
			: TRouterOrProcedure extends AnyQueryProcedure
			? InferQueryOptions<TRouterOrProcedure, `${TPath}${TKey & string}`>
			: never
		: never;
};
