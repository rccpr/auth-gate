import type { CurrentUser } from "@stackframe/stack";
import { AuthAdapter } from "./adapter";

export class StackAdapter extends AuthAdapter<CurrentUser> {
	constructor(private readonly getCurrentUser: () => CurrentUser | null) {
		super();
	}

	getUser(): CurrentUser | null {
		return this.getCurrentUser();
	}

	isAuthenticated(): boolean {
		return this.getUser() !== null;
	}

	getPermissions(_organizationId?: string): string[] {
		return [];
	}

	hasPermission(_permission: string, _organizationId?: string): boolean {
		return false;
	}

	getRoles(_organizationId?: string): string[] {
		return [];
	}

	hasRole(_role: string, _organizationId?: string): boolean {
		return false;
	}
}

export function createStackAuthAdapter(
	getCurrentUser: () => CurrentUser | null,
): StackAdapter {
	return new StackAdapter(getCurrentUser);
}
