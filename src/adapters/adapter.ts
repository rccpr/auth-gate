/**
 * Represents a user in the authentication system.
 */
export interface User {
	/** Unique identifier for the user */
	id: string;
	/** User's display name */
	name: string;
	/** User's email address */
	email: string;
}

/**
 * Abstract base class for authentication adapters.
 * Implement this class to create adapters for different authentication providers.
 *
 * @template TUser - The type of user object returned by the authentication provider
 *
 * @example
 * ```typescript
 * class MyAuthAdapter extends AuthAdapter<MyUserType> {
 *   getUser() { return myAuthProvider.currentUser(); }
 *   isAuthenticated() { return !!this.getUser(); }
 *   getPermissions(orgId) { return myAuthProvider.getPermissions(orgId); }
 *   hasPermission(permission, orgId) {
 *     return this.getPermissions(orgId).includes(permission);
 *   }
 * }
 * ```
 */
export abstract class AuthAdapter<TUser = User> {
	/**
	 * Gets the currently authenticated user.
	 *
	 * @returns The user object if authenticated, null otherwise
	 */
	abstract getUser(): TUser | null;

	/**
	 * Checks if a user is currently authenticated.
	 *
	 * @returns true if a user is authenticated, false otherwise
	 */
	abstract isAuthenticated(): boolean;

	/**
	 * Retrieves the permissions for the current user in a specific organization.
	 *
	 * @param organizationId - Optional organization ID. If not provided, returns permissions for the current organization
	 * @returns Array of permission strings
	 */
	abstract getPermissions(organizationId?: string): string[];

	/**
	 * Checks if the current user has a specific permission.
	 *
	 * @param permission - The permission string to check
	 * @param organizationId - Optional organization ID to check permissions against
	 * @returns true if the user has the permission, false otherwise
	 */
	abstract hasPermission(permission: string, organizationId?: string): boolean;

	/**
	 * Retrieves the roles for the current user in a specific organization.
	 *
	 * @param organizationId - Optional organization ID. If not provided, returns roles for the current organization
	 * @returns Array of role strings
	 */
	abstract getRoles(organizationId?: string): string[];

	/**
	 * Checks if the current user has a specific role.
	 *
	 * @param role - The role string to check
	 * @param organizationId - Optional organization ID to check roles against
	 * @returns true if the user has the role, false otherwise
	 */
	abstract hasRole(role: string, organizationId?: string): boolean;
}
