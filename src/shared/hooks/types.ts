import {
	CreateInfiniteQueryOptions,
	CreateInfiniteQueryResult,
	CreateMutationOptions,
	CreateMutationResult,
	CreateQueryOptions,
	CreateQueryResult,
	DefinedCreateQueryResult,
	DehydratedState,
	InfiniteQueryObserverSuccessResult,
	InitialDataFunction,
	QueryObserverSuccessResult,
	QueryOptions,
} from '@tanstack/svelte-query';
import {
	CreateTRPCClientOptions,
	TRPCClient,
	TRPCRequestOptions,
} from '@trpc/client';
import { AnyRouter } from '@trpc/server';
import { TRPCHookResult } from '../../internals/useHookResult';

export type OutputWithCursor<TData, TCursor = any> = {
	cursor: TCursor | null;
	data: TData;
};

export interface TRPCSvelteRequestOptions
	// For SQ, we use their internal AbortSignals instead of letting the user pass their own
	extends Omit<TRPCRequestOptions, 'signal'> {
	/**
	 * Opt out or into aborting request on unmount
	 */
	abortOnUnmount?: boolean;
}

export interface TRPCCreateQueryBaseOptions {
	/**
	 * tRPC-related options
	 */
	trpc?: TRPCSvelteRequestOptions;
}

export interface CreateTRPCQueryOptions<TPath, TInput, TOutput, TData, TError>
	extends CreateQueryOptions<TOutput, TError, TData, [TPath, TInput]>,
		TRPCCreateQueryBaseOptions {}

/** @internal **/
export interface DefinedUseTRPCQueryOptions<
	TPath,
	TInput,
	TOutput,
	TData,
	TError,
> extends CreateTRPCQueryOptions<TPath, TInput, TOutput, TData, TError> {
	initialData: TOutput | InitialDataFunction<TOutput>;
}

export interface TRPCQueryOptions<TPath, TInput, TData, TError>
	extends QueryOptions<TData, TError, TData, [TPath, TInput]>,
		TRPCCreateQueryBaseOptions {}

export type ExtractCursorType<TInput> = TInput extends { cursor: any }
	? TInput['cursor']
	: unknown;

export interface CreateTRPCInfiniteQueryOptions<TPath, TInput, TOutput, TError>
	extends CreateInfiniteQueryOptions<
			TOutput,
			TError,
			TOutput,
			TOutput,
			[TPath, Omit<TInput, 'cursor'>]
		>,
		TRPCCreateQueryBaseOptions {
	initialCursor?: ExtractCursorType<TInput>;
}

export interface CreateTRPCMutationOptions<
	TInput,
	TError,
	TOutput,
	TContext = unknown,
> extends CreateMutationOptions<TOutput, TError, TInput, TContext>,
		TRPCCreateQueryBaseOptions {}

export interface CreateTRPCSubscriptionOptions<TOutput, TError> {
	enabled?: boolean;
	onStarted?: () => void;
	onData: (data: TOutput) => void;
	onError?: (err: TError) => void;
}

export type GetDehydratedState<TRouter extends AnyRouter> = (
	client: TRPCClient<TRouter>,
	trpcState: DehydratedState | undefined,
) => DehydratedState | undefined;

export type CreateClient<TRouter extends AnyRouter> = (
	opts: CreateTRPCClientOptions<TRouter>,
) => TRPCClient<TRouter>;

/**
 * @internal
 */
export type CreateTRPCQueryResult<TData, TError> = CreateQueryResult<
	TData,
	TError
> &
	TRPCHookResult;

/**
 * @internal
 */
export type DefinedCreateTRPCQueryResult<TData, TError> =
	DefinedCreateQueryResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCQuerySuccessResult<TData, TError> =
	QueryObserverSuccessResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type CreateTRPCInfiniteQueryResult<TData, TError> =
	CreateInfiniteQueryResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type UseTRPCInfiniteQuerySuccessResult<TData, TError> =
	InfiniteQueryObserverSuccessResult<TData, TError> & TRPCHookResult;

/**
 * @internal
 */
export type CreateTRPCMutationResult<TData, TError, TVariables, TContext> =
	CreateMutationResult<TData, TError, TVariables, TContext> & TRPCHookResult;
