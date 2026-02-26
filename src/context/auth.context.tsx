import { createContext, type JSX, type ReactNode, use } from "react";
import type { AuthAdapter, User } from "../adapters/adapter";
import type { AuthGateAdapter } from "../core/create-auth-gate";

/**
 * Props for the AuthGateProvider component.
 */
export type AuthGateProviderProps = {
	/** React children to be rendered within the provider */
	children: ReactNode;
};

/**
 * Context value type containing authentication state and helpers.
 *
 * @template TUser - The type of user object from the authentication provider
 */
export type AuthContextType<TUser = User> = {
	/** The currently authenticated user, or null if not authenticated */
	user: TUser | null;
	/** Whether a user is currently authenticated */
	isAuthenticated: boolean;
	/** Whether the authentication state is currently being loaded */
	isLoading: boolean;
	/** Any error that occurred during authentication */
	error: Error | null;
	/**
	 * Checks if the current user has a specific permission
	 * @param permission - The permission string to check
	 * @param organizationId - Optional organization/team ID for permission scoping
	 * @returns true if the user has the permission
	 */
	hasPermission: (permission: string, organizationId?: string) => boolean;
	/**
	 * Gets all permissions for the current user
	 * @param organizationId - Optional organization/team ID for permission scoping
	 * @returns Array of permission strings
	 */
	getPermissions: (organizationId?: string) => string[];
	/**
	 * Checks if the current user has a specific role
	 * @param role - The role string to check
	 * @param organizationId - Optional organization/team ID for role scoping
	 * @returns true if the user has the role
	 */
	hasRole: (role: string, organizationId?: string) => boolean;
	/**
	 * Gets all roles for the current user
	 * @param organizationId - Optional organization/team ID for role scoping
	 * @returns Array of role strings
	 */
	getRoles: (organizationId?: string) => string[];
};

const AuthContext = createContext<AuthContextType<unknown>>({
	user: null,
	isAuthenticated: false,
	isLoading: true,
	error: null,
	hasPermission: () => false,
	getPermissions: () => [],
	hasRole: () => false,
	getRoles: () => [],
});

/**
 * Hook to access the authentication context.
 * Must be used within an AuthGateProvider.
 *
 * @template TUser - The type of user object from the authentication provider
 * @returns The authentication context value
 * @throws Error if used outside of an AuthGateProvider
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { user, isAuthenticated, hasPermission } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <div>Please log in</div>;
 *   }
 *
 *   return <div>Welcome {user.name}</div>;
 * }
 * ```
 */
export function useAuth<TUser = User>(): AuthContextType<TUser> {
	const context = use(AuthContext) as AuthContextType<TUser> | null;
	if (!context) {
		throw new Error("useAuth must be used within an AuthGateProvider");
	}

	return context;
}

/**
 * Creates authentication hooks and provider components for a specific adapter.
 * This is the main factory function for setting up authentication in your app.
 *
 * @template TAdapter - The type of authentication adapter being used
 * @param adapter - An instance of an AuthAdapter (e.g., ClerkAuthAdapter, StackAuthAdapter)
 * @returns An object containing the useAuth hook and AuthGateProvider component
 *
 * @example
 * ```typescript
 * // With Clerk
 * const clerkAdapter = ClerkAuthAdapter.getInstance();
 * const { useAuth, AuthGateProvider } = createHooks(clerkAdapter);
 *
 * function App() {
 *   return (
 *     <ClerkProvider publishableKey="pk_...">
 *       <AuthGateProvider>
 *         <MyApp />
 *       </AuthGateProvider>
 *     </ClerkProvider>
 *   );
 * }
 *
 * // In a child component - pass organizationId to permission/role checks
 * function MyComponent() {
 *   const { user, hasPermission } = useAuth();
 *
 *   if (hasPermission('admin', 'org_123')) {
 *     return <AdminPanel />;
 *   }
 *
 *   return <UserView />;
 * }
 * ```
 */
export function createHooks<TAdapter extends AuthAdapter<unknown>>(
	adapter: TAdapter,
): {
	AuthGateProvider: (props: AuthGateProviderProps) => JSX.Element;
} {
	type TUser = TAdapter extends AuthAdapter<infer U> ? U : never;

	/**
	 * Provider component that wraps your application with authentication context.
	 *
	 * @param props - Provider props including children
	 */
	const AuthGateProvider = ({ children }: AuthGateProviderProps) => {
		const user = adapter.getUser();
		const isAuthenticated = adapter.isAuthenticated();

		const contextValue: AuthContextType<TUser> = {
			user: user as TUser | null,
			isAuthenticated,
			isLoading: false,
			error: null,
			hasPermission: (permission: string, organizationId?: string) =>
				adapter.hasPermission(permission, organizationId),
			getPermissions: (organizationId?: string) =>
				adapter.getPermissions(organizationId),
			hasRole: (role: string, organizationId?: string) =>
				adapter.hasRole(role, organizationId),
			getRoles: (organizationId?: string) => adapter.getRoles(organizationId),
		};

		return (
			<AuthContext.Provider value={contextValue}>
				{children}
			</AuthContext.Provider>
		);
	};

	return {
		AuthGateProvider,
	};
}

export type AuthGateRuntimeValue<
	TUser,
	TPermission = string,
	TData = boolean,
> = {
	adapter: AuthGateAdapter<TUser, TPermission, TData>;
};

const AuthGateRuntimeContext = createContext<
	AuthGateRuntimeValue<unknown, unknown, unknown> | null
>(null);

type AuthGateRuntimeProviderProps<TUser, TPermission = string, TData = boolean> = {
	value: AuthGateRuntimeValue<TUser, TPermission, TData>;
	children: ReactNode;
};

export function AuthGateRuntimeProvider<TUser, TPermission = string, TData = boolean>({
	value,
	children,
}: AuthGateRuntimeProviderProps<TUser, TPermission, TData>): JSX.Element {
	return (
		<AuthGateRuntimeContext.Provider
			value={value as AuthGateRuntimeValue<unknown, unknown, unknown>}
		>
			{children}
		</AuthGateRuntimeContext.Provider>
	);
}

export function useAuthGateRuntime<TUser, TPermission = string, TData = boolean>(): AuthGateRuntimeValue<TUser, TPermission, TData> {
	const context = use(AuthGateRuntimeContext);
	if (!context) {
		throw new Error("useAuthGateRuntime must be used within an AuthGateProvider");
	}

	return context as AuthGateRuntimeValue<TUser, TPermission, TData>;
}
