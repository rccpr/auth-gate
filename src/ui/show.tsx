import type { JSX, ReactNode } from "react";
import { useAuthGateRuntime } from "../context/auth.context.tsx";
import type {
	AuthGateAdapter,
	AuthGateToolkit,
	SignedInOutProps,
	ShowProps,
	ShowWhen,
} from "../core/create-auth-gate";
import type { AuthState, ConflictPolicy, DecisionState } from "../core/types";

const defaultConflictPolicy: ConflictPolicy = "strict";

function resolveConflictPolicy(
	componentPolicy: ConflictPolicy | undefined,
	adapterPolicy: ConflictPolicy | undefined,
): ConflictPolicy {
	return componentPolicy ?? adapterPolicy ?? defaultConflictPolicy;
}

function resolveHybridDecision<TUser, TPermission, TData>(
	adapter: Extract<AuthGateAdapter<TUser, TPermission, TData>, { mode: "hybrid" }>,
	permission: TPermission,
	conflictPolicy: ConflictPolicy,
): DecisionState<TData> {
	const asyncDecision = adapter.checkPermissionAsync(permission);

	if (conflictPolicy === "strict") {
		return asyncDecision;
	}

	if (asyncDecision.status === "pending") {
		return adapter.checkPermissionSync(permission);
	}

	return asyncDecision;
}

function resolvePermissionDecision<TUser, TPermission, TData>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
	permission: TPermission,
	conflictPolicy: ConflictPolicy,
): DecisionState<TData> {
	switch (adapter.mode) {
		case "sync":
			return adapter.checkPermission(permission);
		case "async":
			return adapter.checkPermission(permission);
		case "hybrid":
			return resolveHybridDecision(adapter, permission, conflictPolicy);
		default:
			return { status: "error", error: new Error("Unsupported adapter mode") };
	}
}

function resolveIdentityGuard<TUser, TPermission>(
	when: ShowWhen<TUser, TPermission>,
	authState: AuthState<TUser>,
): boolean {
	if (when === "signed-in") {
		return authState.isAuthenticated;
	}

	if (when === "signed-out") {
		return !authState.isAuthenticated;
	}

	if (typeof when === "function") {
		return when(authState);
	}

	return true;
}

function renderByDecision<TData>(
	decision: DecisionState<TData>,
	children: ReactNode,
	fallback: ShowProps<unknown>["fallback"],
	loadingFallback: ShowProps<unknown>["loadingFallback"],
): JSX.Element {
	if (decision.status === "allowed") {
		return <>{children}</>;
	}

	if (decision.status === "pending") {
		return <>{loadingFallback ?? null}</>;
	}

	return <>{fallback ?? null}</>;
}

export function createShowComponents<
	TUser,
	TPermission = string,
	TData = boolean,
>(): Pick<AuthGateToolkit<TUser, TPermission>, "Show" | "Protect" | "SignedIn" | "SignedOut"> {
	const Show = ({
		children,
		when,
		fallback,
		loadingFallback,
		conflictPolicy,
	}: ShowProps<TUser, TPermission>): JSX.Element => {
		const runtime = useAuthGateRuntime<TUser, TPermission, TData>();
		const authState = runtime.adapter.useAuthState();

		if (authState.isLoading) {
			return <>{loadingFallback ?? null}</>;
		}

		if (!resolveIdentityGuard(when, authState)) {
			return <>{fallback ?? null}</>;
		}

		if (typeof when === "object" && when !== null && "permission" in when) {
			const resolvedPolicy = resolveConflictPolicy(
				conflictPolicy,
				runtime.adapter.defaultConflictPolicy,
			);
			const permissionDecision = resolvePermissionDecision(
				runtime.adapter,
				when.permission,
				resolvedPolicy,
			);

			return renderByDecision(permissionDecision, children, fallback, loadingFallback);
		}

		return <>{children}</>;
	};

	const Protect = Show;

	const SignedIn = ({
		children,
		fallback,
		loadingFallback,
		conflictPolicy,
	}: SignedInOutProps<TUser, TPermission>): JSX.Element => {
		return (
			<Show
				when="signed-in"
				fallback={fallback}
				loadingFallback={loadingFallback}
				conflictPolicy={conflictPolicy}
			>
				{children}
			</Show>
		);
	};

	const SignedOut = ({
		children,
		fallback,
		loadingFallback,
		conflictPolicy,
	}: SignedInOutProps<TUser, TPermission>): JSX.Element => {
		return (
			<Show
				when="signed-out"
				fallback={fallback}
				loadingFallback={loadingFallback}
				conflictPolicy={conflictPolicy}
			>
				{children}
			</Show>
		);
	};

	return {
		Show: Show,
		Protect: Protect,
		SignedIn: SignedIn,
		SignedOut: SignedOut,
	};
}
