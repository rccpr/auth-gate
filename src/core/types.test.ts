import { describe, expect, it } from "vitest";
import { type DecisionState, decisionStatuses } from "./types";

describe("DecisionState", () => {
	it("supports allowed status", () => {
		const value: DecisionState<boolean> = { status: "allowed", data: true };
		expect(value.status).toBe("allowed");
		expect(decisionStatuses).toContain("allowed");
	});
});
