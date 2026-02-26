import type { UserResource } from "@clerk/types";
import { assertType, describe, expect, expectTypeOf, it } from "vitest";
import type { SyncAdapter } from "../core/create-auth-gate";
import type { AsyncLoadState, HasCheck } from "../core/types";
import { createClerkAuthAdapter } from "./clerk/adapter";

describe("adapter type contracts", () => {
	it("types createClerkAuthAdapter as sync auth-gate adapter", () => {
		const adapter = createClerkAuthAdapter();

		expectTypeOf(adapter).toExtend<
			SyncAdapter<UserResource, string, boolean>
		>();
		expect(adapter.mode).toBe("sync");
	});

	it("accepts clerk-style has checks", () => {
		const adapter = createClerkAuthAdapter();
		type UseDecision = typeof adapter.useAuthorizationDecision;
		type CheckInput = Parameters<UseDecision>[0];
		type DecisionOutput = ReturnType<UseDecision>;

		assertType<CheckInput>({ permission: "org:billing:manage" });
		assertType<CheckInput>({ role: "org:admin" });
		assertType<CheckInput>({ feature: "teams" });
		assertType<CheckInput>({ plan: "pro" });
		assertType<HasCheck<string> | null>(null as CheckInput);
		assertType<AsyncLoadState<boolean>>({
			status: "allowed",
		} as DecisionOutput);
	});
});
