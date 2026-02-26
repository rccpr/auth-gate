import { describe, expect, it } from "vitest";
import { createAuthGate } from "./create-auth-gate";

describe("createAuthGate", () => {
	it("returns provider and gate components", () => {
		const gate = createAuthGate({
			mode: "sync",
			useAuthState: () => ({ user: null, isAuthenticated: false, isLoading: false }),
			checkPermission: () => ({ status: "denied" }),
		});

		expect(gate.Show).toBeTypeOf("function");
		expect(gate.Protect).toBeTypeOf("function");
		expect(gate.AuthGateProvider).toBeTypeOf("function");
	});
});
