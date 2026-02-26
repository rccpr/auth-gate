import type { CurrentUser } from "@stackframe/stack";
import { AuthAdapter } from "./adapter";

/**
 * Authentication adapter for Stack Auth.
 *
 * This adapter implements the legacy `AuthAdapter` contract by delegating user
 * retrieval to a caller-provided getter and exposing role/permission methods
 * as no-op fallbacks.
 */
export class StackAdapter extends AuthAdapter<CurrentUser> {
	/**
	 * @param getCurrentUser - Function that returns the current Stack user
	 */
	constructor(private readonly getCurrentUser: () => CurrentUser | null) {
		super();
	}

	/**
	 * Returns the current Stack user.
	 */
	getUser(): CurrentUser | null {
		return this.getCurrentUser();
	}

	/**
	 * Returns whether a Stack user is currently available.
	 */
	isAuthenticated(): boolean {
		return this.getUser() !== null;
	}

	/**
	 * Returns permission keys for the current user.
	 *
	 * Stack adapter currently does not map provider permissions, so this returns
	 * an empty array.
	 */
	getPermissions(_organizationId?: string): string[] {
		return [];
	}

	/**
	 * Returns whether the current user has a permission.
	 *
	 * Stack adapter currently does not map provider permissions, so this returns
	 * `false`.
	 */
	hasPermission(_permission: string, _organizationId?: string): boolean {
		return false;
	}

	/**
	 * Returns role keys for the current user.
	 *
	 * Stack adapter currently does not map provider roles, so this returns an
	 * empty array.
	 */
	getRoles(_organizationId?: string): string[] {
		return [];
	}

	/**
	 * Returns whether the current user has a role.
	 *
	 * Stack adapter currently does not map provider roles, so this returns
	 * `false`.
	 */
	hasRole(_role: string, _organizationId?: string): boolean {
		return false;
	}
}

/**
 * Creates a Stack Auth adapter instance.
 *
 * @param getCurrentUser - Function used to read the current Stack user
 * @returns Configured `StackAdapter`
 */
export function createStackAuthAdapter(
	getCurrentUser: () => CurrentUser | null,
): StackAdapter {
	return new StackAdapter(getCurrentUser);
}
