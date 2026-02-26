import type { UserResource } from "@clerk/types";
import type { CurrentUser } from "@stackframe/stack";
import { assertType, describe, expect, expectTypeOf, it } from "vitest";
import type { AuthAdapter } from "./adapter";
import type { createClerkAuthAdapter } from "./clerk/adapter";
import { createStackAuthAdapter, type StackAdapter } from "./stack-auth";

describe("adapter type contracts", () => {
	it("types createClerkAuthAdapter as AuthAdapter<UserResource>", () => {
		type ClerkAdapter = ReturnType<typeof createClerkAuthAdapter>;

		expectTypeOf<ClerkAdapter>().toExtend<AuthAdapter<UserResource>>();
		expect(true).toBe(true);
	});

	it("types StackAdapter factory and constructor correctly", () => {
		const getCurrentUser = (): CurrentUser | null => null;
		const stackAdapter = createStackAuthAdapter(getCurrentUser);

		expectTypeOf(stackAdapter).toExtend<AuthAdapter<CurrentUser>>();
		expectTypeOf(stackAdapter).toEqualTypeOf<StackAdapter>();
		assertType<CurrentUser | null>(stackAdapter.getUser());
		expect(stackAdapter.isAuthenticated()).toBe(false);
	});
});
