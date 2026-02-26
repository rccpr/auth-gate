import { useAuth, useUser } from "@clerk/clerk-react";
import type { UserResource } from "@clerk/types";
import type { SyncAdapter } from "../../core/create-auth-gate";
import type { AsyncLoadState, HasCheck } from "../../core/types";

type ClerkAdapter = SyncAdapter<UserResource, string, boolean>;

function resolveDecision(
	check: HasCheck<string> | null,
	has: ReturnType<typeof useAuth>["has"],
	isLoaded: boolean,
	userId: string | null | undefined,
): AsyncLoadState<boolean> {
	if (!check) {
		return { status: "allowed" };
	}

	if (!isLoaded) {
		return { status: "pending" };
	}

	if (!userId || !has) {
		return { status: "denied" };
	}

	return has(check) ? { status: "allowed" } : { status: "denied" };
}

export function createClerkAuthAdapter(): ClerkAdapter {
	return {
		mode: "sync",
		useAuthState: () => {
			const { user } = useUser();
			const { isLoaded, userId } = useAuth();

			return {
				user: user ?? null,
				isAuthenticated: Boolean(userId),
				isLoading: !isLoaded,
			};
		},
		useAuthorizationDecision: (check) => {
			const { has, isLoaded, userId } = useAuth();

			return resolveDecision(check, has, isLoaded, userId);
		},
	};
}
