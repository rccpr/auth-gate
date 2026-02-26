import type { JSX, ReactNode } from "react";
import {
	AuthGateRuntimeProvider,
	type AuthGateRuntimeValue,
} from "../context/auth.context.tsx";
import { createShowComponents } from "../ui/show";
import type { AsyncLoadState, AuthState, HasCheck } from "./types";

export type SyncAdapter<
	TUser,
	TPermission extends string = string,
	TData = boolean,
> = {
	mode: "sync";
	useAuthState: () => AuthState<TUser>;
	useAuthorizationDecision: (
		check: HasCheck<TPermission> | null,
	) => AsyncLoadState<TData>;
};

export type AsyncDecisionResolver<
	TPermission extends string = string,
	TData = boolean,
> = {
	useDecision: (
		check: HasCheck<TPermission> | null,
		getDecision: (
			check: HasCheck<TPermission>,
			ctx?: { signal?: AbortSignal },
		) => Promise<AsyncLoadState<TData>>,
	) => AsyncLoadState<TData>;
};

export type AsyncAdapter<
	TUser,
	TPermission extends string = string,
	TData = boolean,
> = {
	mode: "async";
	useAuthState: () => AuthState<TUser>;
	getAuthorizationDecision: (
		check: HasCheck<TPermission>,
		ctx?: { signal?: AbortSignal },
	) => Promise<AsyncLoadState<TData>>;
	asyncResolver: AsyncDecisionResolver<TPermission, TData>;
};

export type AuthGateAdapter<
	TUser,
	TPermission extends string = string,
	TData = boolean,
> =
	| SyncAdapter<TUser, TPermission, TData>
	| AsyncAdapter<TUser, TPermission, TData>;

export type ShowWhen<TPermission extends string = string> =
	| "signed-in"
	| "signed-out"
	| HasCheck<TPermission>;

export type ShowProps<TPermission extends string = string> = {
	children: ReactNode;
	when: ShowWhen<TPermission>;
	fallback?: ReactNode;
	loadingFallback?: ReactNode;
};

export type SignedInOutProps = {
	children: ReactNode;
	fallback?: ReactNode;
	loadingFallback?: ReactNode;
};

export type AuthGateSnapshot<
	TUser,
	TPermission extends string = string,
	TData = boolean,
> = AuthState<TUser> & {
	evaluate: (check: HasCheck<TPermission>) => AsyncLoadState<TData>;
};

type AuthGateProviderProps = {
	children: ReactNode;
};

export type AuthGateToolkit<
	TUser,
	TPermission extends string = string,
	TData = boolean,
> = {
	AuthGateProvider: (props: AuthGateProviderProps) => JSX.Element;
	Show: (props: ShowProps<TPermission>) => JSX.Element;
	Protect: (props: ShowProps<TPermission>) => JSX.Element;
	SignedIn: (props: SignedInOutProps) => JSX.Element;
	SignedOut: (props: SignedInOutProps) => JSX.Element;
	useAuthGate: () => AuthGateSnapshot<TUser, TPermission, TData>;
};

function defaultAsyncLoadState<TData>(): AsyncLoadState<TData> {
	return { status: "pending" };
}

/**
 * Creates a provider-bound auth-gate toolkit from a single adapter.
 *
 * The returned toolkit exposes the canonical gate components (`Show`, `Protect`,
 * `SignedIn`, `SignedOut`) and the `useAuthGate` hook for normalized auth state
 * plus authorization evaluation.
 *
 * @typeParam TUser - User model returned by the adapter
 * @typeParam TPermission - Permission key type accepted by `HasCheck`
 * @typeParam TData - Optional adapter decision payload type
 * @param adapter - Sync or async adapter implementation
 * @returns A fully wired auth-gate toolkit
 *
 * @example
 * ```tsx
 * const gate = createAuthGate({
 * 	mode: "sync",
 * 	useAuthState: useMyAuthState,
 * 	useAuthorizationDecision: (check) =>
 * 		check && "permission" in check && check.permission === "org:admin"
 * 			? { status: "allowed" }
 * 			: { status: "denied" },
 * });
 *
 * <gate.Show when={{ permission: "org:admin" }} fallback={<NoAccess />}>
 * 	<AdminPanel />
 * </gate.Show>
 * ```
 */
export function createAuthGate<
	TUser,
	TPermission extends string = string,
	TData = boolean,
>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
): AuthGateToolkit<TUser, TPermission, TData> {
	const AuthGateProvider = ({
		children,
	}: AuthGateProviderProps): JSX.Element => {
		const value: AuthGateRuntimeValue<TUser, TPermission, TData> = { adapter };

		return (
			<AuthGateRuntimeProvider value={value}>
				{children}
			</AuthGateRuntimeProvider>
		);
	};

	const showComponents = createShowComponents<TUser, TPermission, TData>(
		adapter,
	);

	const useAuthGate = (): AuthGateSnapshot<TUser, TPermission, TData> => {
		const authState = adapter.useAuthState();

		const evaluate = (check: HasCheck<TPermission>): AsyncLoadState<TData> => {
			if (adapter.mode === "sync") {
				const resolveDecision = adapter.useAuthorizationDecision;

				return resolveDecision(check);
			}

			return defaultAsyncLoadState<TData>();
		};

		return {
			...authState,
			evaluate,
		};
	};

	return {
		AuthGateProvider,
		Show: showComponents.Show,
		Protect: showComponents.Protect,
		SignedIn: showComponents.SignedIn,
		SignedOut: showComponents.SignedOut,
		useAuthGate,
	};
}
