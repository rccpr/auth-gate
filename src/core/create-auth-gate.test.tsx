import { describe, expect, it } from "vitest";
import { createAuthGate } from "./create-auth-gate";

describe("createAuthGate", () => {
	it("returns provider and gate components for sync adapters", () => {
		const syncGate = createAuthGate({
			mode: "sync",
			useAuthState: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			}),
			useAuthorizationDecision: () => ({ status: "denied" }),
		});

		expect(syncGate.Show).toBeTypeOf("function");
		expect(syncGate.Protect).toBeTypeOf("function");
		expect(syncGate.AuthGateProvider).toBeTypeOf("function");
	});

	it("returns provider and gate components for async adapters", () => {
		const asyncGate = createAuthGate({
			mode: "async",
			useAuthState: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			}),
			getAuthorizationDecision: async () => ({ status: "denied" }),
			asyncResolver: {
				useDecision: () => ({ status: "pending" }),
			},
		});

		expect(asyncGate.Show).toBeTypeOf("function");
		expect(asyncGate.Protect).toBeTypeOf("function");
		expect(asyncGate.AuthGateProvider).toBeTypeOf("function");
	});
});
