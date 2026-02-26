import type { SyncAdapter } from "../../src/core/create-auth-gate";
import type { AsyncLoadState, AuthState, HasCheck } from "../../src/core/types";

export type MockUser = { id: string; name: string; email: string };

export type MockSyncConfig = {
	user: MockUser | null;
	isLoading?: boolean;
	permissions?: string[];
	roles?: string[];
};

export function createMockSyncAdapter(
	config: MockSyncConfig,
): SyncAdapter<MockUser> {
	return {
		mode: "sync",
		useAuthState: (): AuthState<MockUser> => ({
			user: config.user,
			isAuthenticated: config.user !== null,
			isLoading: config.isLoading ?? false,
		}),
		useAuthorizationDecision: (
			check: HasCheck | null,
		): AsyncLoadState<boolean> => {
			if (!check) return { status: "pending" };
			if (!config.user) return { status: "denied" };

			if ("permission" in check) {
				return (config.permissions ?? []).includes(check.permission)
					? { status: "allowed", data: true }
					: { status: "denied", data: false };
			}
			if ("role" in check) {
				return (config.roles ?? []).includes(check.role)
					? { status: "allowed", data: true }
					: { status: "denied", data: false };
			}

			return { status: "denied", data: false };
		},
	};
}
