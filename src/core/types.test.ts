import { describe, expect, it } from "vitest";
import { type AsyncLoadState, asyncLoadStatuses } from "./types";

describe("AsyncLoadState", () => {
	it("supports allowed status", () => {
		const value: AsyncLoadState<boolean> = { status: "allowed", data: true };
		expect(value.status).toBe("allowed");
		expect(asyncLoadStatuses).toContain("allowed");
	});

	it("exposes normalized statuses", () => {
		expect(asyncLoadStatuses).toEqual([
			"allowed",
			"denied",
			"pending",
			"error",
		]);
	});
});
