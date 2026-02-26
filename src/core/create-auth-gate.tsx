import type { JSX, ReactNode } from "react";
import {
	AuthGateRuntimeProvider,
	type AuthGateRuntimeValue,
	useAuthGateRuntime,
} from "../context/auth.context.tsx";
import { createShowComponents } from "../ui/show";
import type { AuthState, ConflictPolicy, DecisionState } from "./types";

export type SyncAdapter<TUser, TPermission = string, TData = boolean> = {
	mode: "sync";
	useAuthState: () => AuthState<TUser>;
	checkPermission: (permission: TPermission) => DecisionState<TData>;
	defaultConflictPolicy?: ConflictPolicy;
};

export type AsyncAdapter<TUser, TPermission = string, TData = boolean> = {
	mode: "async";
	useAuthState: () => AuthState<TUser>;
	checkPermission: (permission: TPermission) => DecisionState<TData>;
	defaultConflictPolicy?: ConflictPolicy;
};

export type HybridAdapter<TUser, TPermission = string, TData = boolean> = {
	mode: "hybrid";
	useAuthState: () => AuthState<TUser>;
	checkPermissionSync: (permission: TPermission) => DecisionState<TData>;
	checkPermissionAsync: (permission: TPermission) => DecisionState<TData>;
	defaultConflictPolicy?: ConflictPolicy;
};

export type AuthGateAdapter<TUser, TPermission = string, TData = boolean> =
	| SyncAdapter<TUser, TPermission, TData>
	| AsyncAdapter<TUser, TPermission, TData>
	| HybridAdapter<TUser, TPermission, TData>;

export type PermissionRequirement<TPermission> = {
	permission: TPermission;
};

export type ShowWhen<TUser, TPermission = string> =
	| "signed-in"
	| "signed-out"
	| PermissionRequirement<TPermission>
	| ((authState: AuthState<TUser>) => boolean);

export type ShowProps<TUser, TPermission = string> = {
	children: ReactNode;
	when: ShowWhen<TUser, TPermission>;
	fallback?: ReactNode;
	loadingFallback?: ReactNode;
	conflictPolicy?: ConflictPolicy;
};

export type SignedInOutProps<TUser, TPermission = string> = Omit<
	ShowProps<TUser, TPermission>,
	"when"
>;

export type UseAuthGateOptions = {
	conflictPolicy?: ConflictPolicy;
};

export type AuthGateSnapshot<
	TUser,
	TPermission = string,
	TData = boolean,
> = AuthState<TUser> & {
	evaluatePermission: (
		permission: TPermission,
		options?: UseAuthGateOptions,
	) => DecisionState<TData>;
};

type AuthGateProviderProps = {
	children: ReactNode;
};

export type AuthGateToolkit<TUser, TPermission = string, TData = boolean> = {
	AuthGateProvider: (props: AuthGateProviderProps) => JSX.Element;
	Show: (props: ShowProps<TUser, TPermission>) => JSX.Element;
	Protect: (props: ShowProps<TUser, TPermission>) => JSX.Element;
	SignedIn: (props: SignedInOutProps<TUser, TPermission>) => JSX.Element;
	SignedOut: (props: SignedInOutProps<TUser, TPermission>) => JSX.Element;
	useAuthGate: () => AuthGateSnapshot<TUser, TPermission, TData>;
};

function resolveConflictPolicy(
	componentPolicy: ConflictPolicy | undefined,
	adapterPolicy: ConflictPolicy | undefined,
): ConflictPolicy {
	return componentPolicy ?? adapterPolicy ?? "strict";
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
		case "hybrid": {
			const asyncDecision = adapter.checkPermissionAsync(permission);
			if (conflictPolicy === "strict") {
				return asyncDecision;
			}

			if (asyncDecision.status === "pending") {
				return adapter.checkPermissionSync(permission);
			}

			return asyncDecision;
		}
		default:
			return { status: "error", error: new Error("Unsupported adapter mode") };
	}
}

export function createAuthGate<TUser, TPermission = string, TData = boolean>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
): AuthGateToolkit<TUser, TPermission, TData> {
	const AuthGateProvider = ({ children }: AuthGateProviderProps): JSX.Element => {
		const value: AuthGateRuntimeValue<TUser, TPermission, TData> = { adapter };

		return <AuthGateRuntimeProvider value={value}>{children}</AuthGateRuntimeProvider>;
	};

	const showComponents = createShowComponents<TUser, TPermission, TData>();

	const useAuthGate = (): AuthGateSnapshot<TUser, TPermission, TData> => {
		const runtime = useAuthGateRuntime<TUser, TPermission, TData>();
		const authState = runtime.adapter.useAuthState();

		const evaluatePermission = (
			permission: TPermission,
			options?: UseAuthGateOptions,
		): DecisionState<TData> => {
			const conflictPolicy = resolveConflictPolicy(
				options?.conflictPolicy,
				runtime.adapter.defaultConflictPolicy,
			);

			return resolvePermissionDecision(runtime.adapter, permission, conflictPolicy);
		};

		return {
			...authState,
			evaluatePermission: evaluatePermission,
		};
	};

	return {
		AuthGateProvider: AuthGateProvider,
		Show: showComponents.Show,
		Protect: showComponents.Protect,
		SignedIn: showComponents.SignedIn,
		SignedOut: showComponents.SignedOut,
		useAuthGate: useAuthGate,
	};
}
