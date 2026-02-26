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

/**
 * Authentication adapter for Clerk.
 * Implements the auth-gate sync adapter contract using Clerk React hooks.
 *
 * This adapter follows Clerk best practices by:
 * - Using official Clerk React hooks (`useUser`, `useAuth`)
 * - Aligning authorization checks with Clerk's `has()` object semantics
 * - Returning normalized `AsyncLoadState` values (`allowed | denied | pending | error`)
 * - Remaining client-side and hook-native for React integrations
 *
 * @example
 * ```tsx
 * import { ClerkProvider } from "@clerk/clerk-react";
 * import { createAuthGate, createClerkAuthAdapter } from "@rccpr/auth-gate";
 *
 * const gate = createAuthGate(createClerkAuthAdapter());
 *
 * function App() {
 * 	return (
 * 		<ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
 * 			<gate.AuthGateProvider>
 * 				<gate.Show when={{ permission: "org:team_settings:manage" }} fallback={<p>No access</p>}>
 * 					<TeamSettings />
 * 				</gate.Show>
 * 			</gate.AuthGateProvider>
 * 		</ClerkProvider>
 * 	);
 * }
 * ```
 *
 * @see https://clerk.com/docs/react/reference/hooks/use-user
 * @see https://clerk.com/docs/react/reference/hooks/use-auth
 * @see https://clerk.com/docs/guides/secure/authorization-checks#use-has-for-authorization-checks
 */
export function createClerkAuthAdapter(): ClerkAdapter {
	return {
		mode: "sync",
		/**
		 * Returns normalized auth state derived from Clerk session state.
		 */
		useAuthState: () => {
			const { user } = useUser();
			const { isLoaded, userId } = useAuth();

			return {
				user: user ?? null,
				isAuthenticated: Boolean(userId),
				isLoading: !isLoaded,
			};
		},
		/**
		 * Evaluates a Clerk-style `has()` check and maps the result to `AsyncLoadState`.
		 */
		useAuthorizationDecision: (check) => {
			const { has, isLoaded, userId } = useAuth();

			return resolveDecision(check, has, isLoaded, userId);
		},
	};
}
