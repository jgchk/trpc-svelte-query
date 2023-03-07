import {
	InfiniteData,
	QueryClient,
	QueryKey,
	createInfiniteQuery,
	createMutation,
	createQuery,
} from '@tanstack/svelte-query';
import {
	CreateTRPCClientOptions,
	TRPCClientErrorLike,
	TRPCRequestOptions,
	TRPCUntypedClient,
	createTRPCUntypedClient,
} from '@trpc/client';
import {
	AnyMutationProcedure,
	AnyProcedure,
	AnyQueryProcedure,
	AnyRouter,
	AnySubscriptionProcedure,
	ProcedureRouterRecord,
	ProtectedIntersection,
	inferProcedureInput,
} from '@trpc/server';
import {
	createFlatProxy,
	createRecursiveProxy,
	inferTransformedProcedureOutput,
	inferTransformedSubscriptionOutput,
} from '@trpc/server/shared';
import { BROWSER } from 'esm-env';
import { getArrayQueryKey } from './internals/getArrayQueryKey';
import {
	getContextClient as __getContextClient,
	setContextClient as __setContextClient,
} from './shared';
import {
	CreateTRPCInfiniteQueryOptions,
	CreateTRPCInfiniteQueryResult,
	CreateTRPCMutationOptions,
	CreateTRPCMutationResult,
	CreateTRPCQueryOptions,
	CreateTRPCQueryResult,
	CreateTRPCSubscriptionOptions,
	DefinedCreateTRPCQueryResult,
	DefinedUseTRPCQueryOptions,
	UseTRPCInfiniteQuerySuccessResult,
	UseTRPCQuerySuccessResult,
} from './shared/types';
import { callUtilMethod } from './shared/utils';
import { splitUserOptions } from './utils/splitUserOptions';

/**
 * @internal
 */
export type TodoTypeName<TOptions> = Omit<
	TOptions,
	'queryFn' | 'queryKey' | 'mutationFn' | 'mutationKey'
>;

/**
 * @internal
 */
export type UserExposedOptions<TOptions> = TodoTypeName<TOptions> &
	TRPCRequestOptions;

/**
 * @internal
 */
export interface ProcedureCreateQuery<
	TProcedure extends AnyProcedure,
	TPath extends string,
> {
	<
		TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
		TData = inferTransformedProcedureOutput<TProcedure>,
	>(
		input: inferProcedureInput<TProcedure>,
		opts: DefinedUseTRPCQueryOptions<
			TPath,
			inferProcedureInput<TProcedure>,
			TQueryFnData,
			TData,
			TRPCClientErrorLike<TProcedure>
		>,
	): DefinedCreateTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;

	<
		TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
		TData = inferTransformedProcedureOutput<TProcedure>,
	>(
		input: inferProcedureInput<TProcedure>,
		opts?: CreateTRPCQueryOptions<
			TPath,
			inferProcedureInput<TProcedure>,
			TQueryFnData,
			TData,
			TRPCClientErrorLike<TProcedure>
		>,
	): CreateTRPCQueryResult<TData, TRPCClientErrorLike<TProcedure>>;
}

/**
 * @internal
 */
export type DecorateProcedure<
	TProcedure extends AnyProcedure,
	TFlags,
	TPath extends string,
> = TProcedure extends AnyQueryProcedure
	? {
			query: ProcedureCreateQuery<TProcedure, TPath>;
			prefetchQuery(): Promise<void>;
	  } & (inferProcedureInput<TProcedure> extends { cursor?: any }
			? {
					useInfiniteQuery: <
						_TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
						TData = inferTransformedProcedureOutput<TProcedure>,
					>(
						input: Omit<inferProcedureInput<TProcedure>, 'cursor'>,
						opts?: CreateTRPCInfiniteQueryOptions<
							TPath,
							inferProcedureInput<TProcedure>,
							TData,
							TRPCClientErrorLike<TProcedure>
						>,
					) => CreateTRPCInfiniteQueryResult<
						TData,
						TRPCClientErrorLike<TProcedure>
					>;
					prefetchInfiniteQuery(): Promise<void>;
			  } & (TFlags extends 'ExperimentalSuspense'
					? {
							useSuspenseInfiniteQuery: <
								_TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
								TData = inferTransformedProcedureOutput<TProcedure>,
							>(
								input: Omit<inferProcedureInput<TProcedure>, 'cursor'>,
								opts?: Omit<
									CreateTRPCInfiniteQueryOptions<
										TPath,
										inferProcedureInput<TProcedure>,
										TData,
										TRPCClientErrorLike<TProcedure>
									>,
									'enabled' | 'suspense'
								>,
							) => [
								InfiniteData<TData>,
								UseTRPCInfiniteQuerySuccessResult<
									TData,
									TRPCClientErrorLike<TProcedure>
								>,
							];
					  }
					: object)
			: object) &
			(TFlags extends 'ExperimentalSuspense'
				? {
						useSuspenseQuery: <
							TQueryFnData = inferTransformedProcedureOutput<TProcedure>,
							TData = inferTransformedProcedureOutput<TProcedure>,
						>(
							input: inferProcedureInput<TProcedure>,
							opts?: Omit<
								CreateTRPCQueryOptions<
									TPath,
									inferProcedureInput<TProcedure>,
									TQueryFnData,
									TData,
									TRPCClientErrorLike<TProcedure>
								>,
								'enabled' | 'suspense'
							>,
						) => [
							TData,
							UseTRPCQuerySuccessResult<TData, TRPCClientErrorLike<TProcedure>>,
						];
				  }
				: object)
	: TProcedure extends AnyMutationProcedure
	? {
			mutation: <TContext = unknown>(
				opts?: CreateTRPCMutationOptions<
					inferProcedureInput<TProcedure>,
					TRPCClientErrorLike<TProcedure>,
					inferTransformedProcedureOutput<TProcedure>,
					TContext
				>,
			) => CreateTRPCMutationResult<
				inferTransformedProcedureOutput<TProcedure>,
				TRPCClientErrorLike<TProcedure>,
				inferProcedureInput<TProcedure>,
				TContext
			>;
	  }
	: TProcedure extends AnySubscriptionProcedure
	? {
			useSubscription: (
				input: inferProcedureInput<TProcedure>,
				opts?: CreateTRPCSubscriptionOptions<
					inferTransformedSubscriptionOutput<TProcedure>,
					TRPCClientErrorLike<TProcedure>
				>,
			) => void;
	  }
	: never;

/**
 * @internal
 */
export type DecoratedProcedureRecord<
	TProcedures extends ProcedureRouterRecord,
	TFlags,
	TPath extends string = '',
> = {
	[TKey in keyof TProcedures]: TProcedures[TKey] extends AnyRouter
		? DecoratedProcedureRecord<
				TProcedures[TKey]['_def']['record'],
				TFlags,
				`${TPath}${TKey & string}.`
		  >
		: TProcedures[TKey] extends AnyProcedure
		? DecorateProcedure<TProcedures[TKey], TFlags, `${TPath}${TKey & string}`>
		: never;
};

/**
 * @internal
 */
export type CreateTRPCSvelteBase = {
	queryClient: QueryClient;
};

export type CreateTRPCSvelte<
	TRouter extends AnyRouter,
	TFlags,
> = ProtectedIntersection<
	CreateTRPCSvelteBase,
	DecoratedProcedureRecord<TRouter['_def']['record'], TFlags>
>;

const clientMethods = {
	query: [1, 'query'],
	mutation: [0, 'any'],
	infiniteQuery: [1, 'infinite'],
	prefetchQuery: [1, 'query'],
	prefetchInfiniteQuery: [1, 'infinite'],
} as const;

type ClientMethod = keyof typeof clientMethods;

/**
 * @internal
 */
export function createHooksInternalProxy<
	TRouter extends AnyRouter,
	TFlags = null,
>(
	client: TRPCUntypedClient<TRouter>,
	opts: { queryClient: QueryClient; fetch: typeof fetch },
) {
	const queryClient = opts.queryClient;

	return createFlatProxy<CreateTRPCSvelte<TRouter, TFlags>>((firstPath) => {
		switch (firstPath) {
			case 'queryClient': {
				return queryClient;
			}
		}

		return createRecursiveProxy(({ path, args: unknownArgs }) => {
			path.unshift(firstPath);

			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const method = path.pop()! as ClientMethod;
			const joinedPath = path.join('.');

			// Pull the query options out of the args - it's at a different index based on the method
			const methodData = clientMethods[method];
			if (!methodData) {
				const utils = path.pop();
				if (utils === 'utils') {
					return callUtilMethod(
						client,
						queryClient,
						path,
						method as any,
						unknownArgs,
					);
				}
				throw new TypeError(`trpc.${joinedPath}.${method} is not a function`);
			}
			const args = unknownArgs as any[];

			const [optionIndex, queryType] = methodData;
			const options = args[optionIndex] as UserExposedOptions<any> | undefined;
			const [trpcOptions, tanstackQueryOptions] = splitUserOptions(options);

			// Create the query key - input is undefined for mutations
			const key = getArrayQueryKey(
				path,
				method === 'mutation' ? undefined : args[0],
				queryType,
			) as QueryKey;

			const enabled = tanstackQueryOptions?.enabled !== false && BROWSER;

			switch (method) {
				case 'query':
					return createQuery({
						...tanstackQueryOptions,
						enabled,
						queryKey: key,
						queryFn: () => client.query(joinedPath, args[0], trpcOptions),
					});
				case 'mutation': {
					return createMutation({
						...tanstackQueryOptions,
						mutationKey: key,
						mutationFn: (variables: any) =>
							client.mutation(joinedPath, variables, trpcOptions),
					});
				}
				case 'infiniteQuery':
					return createInfiniteQuery({
						...tanstackQueryOptions,
						enabled,
						queryKey: key,
						queryFn: (context) => {
							const input = { ...args[0], cursor: context.pageParam };
							return client.query(joinedPath, input, trpcOptions);
						},
					});
				case 'prefetchQuery': {
					return queryClient.prefetchQuery({
						...tanstackQueryOptions,
						queryKey: key,
						queryFn: (context) => {
							const input = { ...args[0], cursor: context.pageParam };
							return client.query(joinedPath, input, trpcOptions);
						},
					});
				}
				case 'prefetchInfiniteQuery': {
					return queryClient.prefetchInfiniteQuery({
						...tanstackQueryOptions,
						queryKey: key,
						queryFn: (context) => {
							const input = { ...args[0], cursor: context.pageParam };
							return client.query(joinedPath, input, trpcOptions);
						},
					});
				}
				default:
					throw new TypeError(`trpc.${joinedPath}.${method} is not a function`);
			}
		});
	});
}

export function createTRPCSvelteClient<
	TRouter extends AnyRouter,
	TFlags = null,
>(
	opts: CreateTRPCClientOptions<TRouter> & {
		queryClient: QueryClient;
		fetch: typeof fetch;
	},
): CreateTRPCSvelte<TRouter, TFlags> {
	const client = createTRPCUntypedClient<TRouter>(opts);

	const proxy = createHooksInternalProxy<TRouter, TFlags>(client, opts);

	return proxy as any;
}

export function createTRPCSvelte<TRouter extends AnyRouter, TFlags = null>() {
	const createClient = createTRPCSvelteClient<TRouter, TFlags>;
	const setContextClient = __setContextClient<TRouter, TFlags>;
	const getContextClient = __getContextClient<TRouter, TFlags>;

	return {
		createClient,
		setContextClient,
		getContextClient,
	};
}
