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

type AuthGateProviderProps = {
	children: ReactNode;
};

export type AuthGateToolkit<TUser, TPermission = string> = {
	AuthGateProvider: (props: AuthGateProviderProps) => JSX.Element;
	Show: (props: ShowProps<TUser, TPermission>) => JSX.Element;
	Protect: (props: ShowProps<TUser, TPermission>) => JSX.Element;
	SignedIn: (props: SignedInOutProps<TUser, TPermission>) => JSX.Element;
	SignedOut: (props: SignedInOutProps<TUser, TPermission>) => JSX.Element;
	useAuthGate: () => AuthState<TUser>;
};

export function createAuthGate<TUser, TPermission = string, TData = boolean>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
): AuthGateToolkit<TUser, TPermission> {
	const AuthGateProvider = ({ children }: AuthGateProviderProps): JSX.Element => {
		const value: AuthGateRuntimeValue<TUser, TPermission, TData> = { adapter };

		return <AuthGateRuntimeProvider value={value}>{children}</AuthGateRuntimeProvider>;
	};

	const showComponents = createShowComponents<TUser, TPermission, TData>();

	const useAuthGate = (): AuthState<TUser> => {
		const runtime = useAuthGateRuntime<TUser, TPermission, TData>();
		return runtime.adapter.useAuthState();
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
