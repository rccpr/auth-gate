import type { JSX, ReactNode } from "react";
import { useAuthGateRuntime } from "../context/auth.context.tsx";
import type {
	AsyncAdapter,
	AuthGateAdapter,
	AuthGateToolkit,
	ShowProps,
	ShowWhen,
	SignedInOutProps,
	SyncAdapter,
} from "../core/create-auth-gate";
import type { AsyncLoadState, AuthState, HasCheck } from "../core/types";

function isHasCheck<TPermission extends string>(
	when: ShowWhen<TPermission>,
): when is HasCheck<TPermission> {
	return typeof when === "object" && when !== null;
}

function resolveIdentityGuard<TUser, TPermission extends string>(
	when: ShowWhen<TPermission>,
	authState: AuthState<TUser>,
): boolean {
	if (when === "signed-in") {
		return authState.isAuthenticated;
	}

	if (when === "signed-out") {
		return !authState.isAuthenticated;
	}

	return true;
}

function renderByDecision<TData>(
	decision: AsyncLoadState<TData>,
	children: ReactNode,
	fallback: ShowProps["fallback"],
	loadingFallback: ShowProps["loadingFallback"],
): JSX.Element {
	if (decision.status === "allowed") {
		return <>{children}</>;
	}

	if (decision.status === "pending") {
		return <>{loadingFallback ?? null}</>;
	}

	return <>{fallback ?? null}</>;
}

function createSyncShowComponent<TUser, TPermission extends string, TData>(
	adapter: SyncAdapter<TUser, TPermission, TData>,
): (props: ShowProps<TPermission>) => JSX.Element {
	return ({
		children,
		when,
		fallback,
		loadingFallback,
	}: ShowProps<TPermission>): JSX.Element => {
		useAuthGateRuntime<TUser, TPermission, TData>();

		const authState = adapter.useAuthState();
		const hasCheck = isHasCheck(when);
		const decision = adapter.useAuthorizationDecision(hasCheck ? when : null);

		if (authState.isLoading) {
			return <>{loadingFallback ?? null}</>;
		}

		if (!resolveIdentityGuard(when, authState)) {
			return <>{fallback ?? null}</>;
		}

		if (hasCheck) {
			return renderByDecision(decision, children, fallback, loadingFallback);
		}

		return <>{children}</>;
	};
}

function createAsyncShowComponent<TUser, TPermission extends string, TData>(
	adapter: AsyncAdapter<TUser, TPermission, TData>,
): (props: ShowProps<TPermission>) => JSX.Element {
	return ({
		children,
		when,
		fallback,
		loadingFallback,
	}: ShowProps<TPermission>): JSX.Element => {
		useAuthGateRuntime<TUser, TPermission, TData>();

		const authState = adapter.useAuthState();
		const hasCheck = isHasCheck(when);
		const decision = adapter.asyncResolver.useDecision(
			hasCheck ? when : null,
			adapter.getAuthorizationDecision,
		);

		if (authState.isLoading) {
			return <>{loadingFallback ?? null}</>;
		}

		if (!resolveIdentityGuard(when, authState)) {
			return <>{fallback ?? null}</>;
		}

		if (hasCheck) {
			return renderByDecision(decision, children, fallback, loadingFallback);
		}

		return <>{children}</>;
	};
}

export function createShowComponents<
	TUser,
	TPermission extends string = string,
	TData = boolean,
>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
): Pick<
	AuthGateToolkit<TUser, TPermission, TData>,
	"Show" | "Protect" | "SignedIn" | "SignedOut"
> {
	const Show =
		adapter.mode === "sync"
			? createSyncShowComponent(adapter)
			: createAsyncShowComponent(adapter);

	const Protect = Show;

	const SignedIn = ({
		children,
		fallback,
		loadingFallback,
	}: SignedInOutProps): JSX.Element => {
		return (
			<Show
				when="signed-in"
				fallback={fallback}
				loadingFallback={loadingFallback}
			>
				{children}
			</Show>
		);
	};

	const SignedOut = ({
		children,
		fallback,
		loadingFallback,
	}: SignedInOutProps): JSX.Element => {
		return (
			<Show
				when="signed-out"
				fallback={fallback}
				loadingFallback={loadingFallback}
			>
				{children}
			</Show>
		);
	};

	return {
		Show,
		Protect,
		SignedIn,
		SignedOut,
	};
}
