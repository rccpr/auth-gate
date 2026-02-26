import { AuthAdapter, type User } from "../../src/adapters/adapter";

export type MockAdapterConfig = {
	user: User | null;
	permissions: string[];
	roles: string[];
};

export class MockAuthAdapter extends AuthAdapter<User> {
	constructor(private config: MockAdapterConfig) {
		super();
	}

	getUser(): User | null {
		return this.config.user;
	}

	isAuthenticated(): boolean {
		return this.config.user !== null;
	}

	getPermissions(_organizationId?: string): string[] {
		return this.config.permissions;
	}

	hasPermission(permission: string, _organizationId?: string): boolean {
		return this.config.permissions.includes(permission);
	}

	getRoles(_organizationId?: string): string[] {
		return this.config.roles;
	}

	hasRole(role: string, _organizationId?: string): boolean {
		return this.config.roles.includes(role);
	}
}
