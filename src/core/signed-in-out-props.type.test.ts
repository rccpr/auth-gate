import { describe, expect, it } from "vitest";
import { createAuthGate } from "./create-auth-gate";

describe("SignedIn/SignedOut prop contracts", () => {
	it("rejects when, permission, and conflictPolicy props", () => {
		const gate = createAuthGate<{ id: string }, string>({
			mode: "sync",
			useAuthState: () => ({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			}),
			checkPermission: () => ({ status: "denied" }),
		});

		type SignedInProps = Parameters<typeof gate.SignedIn>[0];

		const validProps: SignedInProps = {
			children: "ok",
			fallback: "no",
			loadingFallback: "loading",
		};

		expect(validProps.children).toBe("ok");

		// @ts-expect-error SignedIn should not accept `when`
		const invalidWhen: SignedInProps = { children: "x", when: "signed-out" };
		const invalidPermission: SignedInProps = {
			children: "x",
			// @ts-expect-error SignedIn should not accept permission requirements
			permission: "org:admin",
		};
		const invalidConflictPolicy: SignedInProps = {
			children: "x",
			// @ts-expect-error SignedIn should not accept `conflictPolicy`
			conflictPolicy: "optimistic",
		};

		expect(invalidWhen).toBeDefined();
		expect(invalidPermission).toBeDefined();
		expect(invalidConflictPolicy).toBeDefined();
	});
});
