import type { JSX, ReactNode } from "react";
import {
	AuthGateRuntimeProvider,
	type AuthGateRuntimeValue,
	useAuthGateRuntime,
} from "../context/auth.context.tsx";
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
	checkPermission: (permission: TPermission) => Promise<DecisionState<TData>>;
	defaultConflictPolicy?: ConflictPolicy;
};

export type HybridAdapter<TUser, TPermission = string, TData = boolean> = {
	mode: "hybrid";
	useAuthState: () => AuthState<TUser>;
	checkPermissionSync: (permission: TPermission) => DecisionState<TData>;
	checkPermissionAsync: (permission: TPermission) => Promise<DecisionState<TData>>;
	defaultConflictPolicy?: ConflictPolicy;
};

export type AuthGateAdapter<TUser, TPermission = string, TData = boolean> =
	| SyncAdapter<TUser, TPermission, TData>
	| AsyncAdapter<TUser, TPermission, TData>
	| HybridAdapter<TUser, TPermission, TData>;

export type ShowProps<TPermission = string> = {
	children: ReactNode;
	fallback?: ReactNode;
	loadingFallback?: ReactNode;
	when?: "signed-in" | "signed-out";
	permission?: TPermission;
	conflictPolicy?: ConflictPolicy;
};

type AuthGateProviderProps = {
	children: ReactNode;
};

export type AuthGateToolkit<TUser, TPermission = string> = {
	AuthGateProvider: (props: AuthGateProviderProps) => JSX.Element;
	Show: (props: ShowProps<TPermission>) => JSX.Element;
	Protect: (props: ShowProps<TPermission>) => JSX.Element;
	SignedIn: (props: ShowProps<TPermission>) => JSX.Element;
	SignedOut: (props: ShowProps<TPermission>) => JSX.Element;
	useAuthGate: () => AuthState<TUser>;
};

export function createAuthGate<TUser, TPermission = string, TData = boolean>(
	adapter: AuthGateAdapter<TUser, TPermission, TData>,
): AuthGateToolkit<TUser, TPermission> {
	const AuthGateProvider = ({ children }: AuthGateProviderProps): JSX.Element => {
		const value: AuthGateRuntimeValue<TUser, TPermission, TData> = { adapter };

		return <AuthGateRuntimeProvider value={value}>{children}</AuthGateRuntimeProvider>;
	};

	const Show = ({ children }: ShowProps<TPermission>): JSX.Element => <>{children}</>;
	const Protect = Show;
	const SignedIn = ({
		children,
		fallback,
		loadingFallback,
	}: ShowProps<TPermission>): JSX.Element => (
		<Show when="signed-in" fallback={fallback} loadingFallback={loadingFallback}>
			{children}
		</Show>
	);
	const SignedOut = ({
		children,
		fallback,
		loadingFallback,
	}: ShowProps<TPermission>): JSX.Element => (
		<Show when="signed-out" fallback={fallback} loadingFallback={loadingFallback}>
			{children}
		</Show>
	);

	const useAuthGate = (): AuthState<TUser> => {
		const runtime = useAuthGateRuntime<TUser, TPermission, TData>();
		return runtime.adapter.useAuthState();
	};

	return {
		AuthGateProvider,
		Show,
		Protect,
		SignedIn,
		SignedOut,
		useAuthGate,
	};
}
