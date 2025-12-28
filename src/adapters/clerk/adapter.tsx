import { useAuth, useOrganization, useUser } from "@clerk/clerk-react";
import type { UserResource } from "@clerk/types";
import { AuthAdapter } from "../adapter";

/**
 * Authentication adapter for Clerk.
 * Implements the AuthAdapter interface using Clerk's authentication hooks.
 *
 * This adapter follows Clerk's best practices by:
 * - Using the official Clerk React hooks (useUser, useAuth, useOrganization)
 * - Properly handling loading states
 * - Supporting both role-based and permission-based access control
 * - Working seamlessly across React, Next.js, and TanStack Start
 *
 * @example
 * ```typescript
 * import { ClerkProvider } from '@clerk/clerk-react';
 * import { createClerkAuthAdapter } from '@rccpr/auth-gate';
 *
 * const adapter = createClerkAuthAdapter();
 * const { useAuth, AuthGateProvider } = createHooks(adapter);
 *
 * function App() {
 *   return (
 *     <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
 *       <AuthGateProvider>
 *         <YourApp />
 *       </AuthGateProvider>
 *     </ClerkProvider>
 *   );
 * }
 * ```
 *
 * @see https://clerk.com/docs/react/reference/hooks/use-user
 * @see https://clerk.com/docs/react/reference/hooks/use-auth
 * @see https://clerk.com/docs/react/reference/hooks/use-organization
 */
class ClerkAuthAdapter extends AuthAdapter<UserResource> {
	/**
	 * Gets the currently authenticated Clerk user.
	 * Uses Clerk's useUser hook to retrieve the current user.
	 *
	 * @returns The Clerk UserResource if authenticated and loaded, null otherwise
	 */
	getUser(): UserResource | null {
		const { user, isLoaded } = useUser();
		if (!isLoaded || !user) return null;

		return user;
	}

	/**
	 * Checks if a user is currently authenticated with Clerk.
	 * Uses Clerk's useAuth hook for more reliable authentication state.
	 *
	 * @returns true if a user is authenticated, false otherwise
	 */
	isAuthenticated(): boolean {
		const { isSignedIn, isLoaded } = useAuth();

		return isLoaded && !!isSignedIn;
	}

	/**
	 * Retrieves the role and permissions for the current user in a Clerk organization.
	 *
	 * Clerk supports both role-based access control (basic roles like "admin", "member")
	 * and fine-grained permissions (custom permissions defined in Clerk Dashboard).
	 *
	 * @param organizationId - Optional organization ID. If not provided, uses the active organization.
	 *                         Note: Clerk automatically manages the active organization context.
	 * @returns Array of permission strings including the role and any custom permissions
	 *
	 * @see https://clerk.com/docs/organizations/roles-permissions
	 * @see https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions
	 */
	getPermissions(): string[] {
		const { membership, isLoaded } = useOrganization();
		if (!isLoaded || !membership) return [];

		const permissions: string[] = [];

		// Add permissions
		if (membership.role) permissions.push(membership.role);
		if (membership.permissions && Array.isArray(membership.permissions)) {
			permissions.push(...membership.permissions);
		}

		return permissions;
	}

	/**
	 * Checks if the current user has a specific role or permission in a Clerk organization.
	 *
	 * This method checks against both:
	 * - Basic roles (e.g., "org:admin", "org:member")
	 * - Custom permissions (as defined in your Clerk Dashboard)
	 *
	 * @param permission - The role/permission string to check
	 * @param organizationId - Optional organization ID (currently not used as Clerk manages active org)
	 * @returns true if the user has the permission, false otherwise
	 *
	 * @example
	 * ```typescript
	 * // Check for basic role
	 * if (adapter.hasPermission('org:admin')) {
	 *   // User is an admin
	 * }
	 *
	 * // Check for custom permission
	 * if (adapter.hasPermission('org:billing:manage')) {
	 *   // User can manage billing
	 * }
	 * ```
	 */
	hasPermission(permission: string): boolean {
		const permissions = this.getPermissions();

		return permissions.includes(permission);
	}

	/**
	 * Retrieves the roles for the current user in a Clerk organization.
	 * Clerk's organization membership includes a single role per user.
	 *
	 * @returns Array containing the user's role string, or an empty array if none.
	 */
	getRoles(): string[] {
		const { membership, isLoaded } = useOrganization();
		if (!isLoaded || !membership || !membership.role) return [];

		return [membership.role];
	}

	/**
	 * Checks if the current user has a specific role in a Clerk organization.
	 *
	 * @param role - The role string to check (e.g., "org:admin")
	 * @returns true if the user has the specified role, false otherwise.
	 */
	hasRole(role: string): boolean {
		const { membership, isLoaded } = useOrganization();
		if (!isLoaded || !membership) return false;

		return membership.role === role;
	}
}

/**
 * Creates a new instance of the Clerk authentication adapter.
 * This is the recommended way to instantiate the adapter.
 *
 * @returns A new ClerkAuthAdapter instance
 *
 * @example
 * ```typescript
 * import { createClerkAuthAdapter } from '@rccpr/auth-gate';
 *
 * const adapter = createClerkAuthAdapter();
 * const { useAuth, AuthGateProvider } = createHooks(adapter);
 * ```
 */
export function createClerkAuthAdapter(): ClerkAuthAdapter {
	return new ClerkAuthAdapter();
}
