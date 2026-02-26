import { expect, test } from "@playwright/experimental-ct-react";
import { GateTestWrapper } from "./helpers/GateTestWrapper";
import type { MockSyncConfig } from "./helpers/mock-sync-adapter";

const signedIn: MockSyncConfig = {
	user: { id: "u1", name: "Charlie", email: "charlie@test.com" },
};

const signedOut: MockSyncConfig = { user: null };

const loading: MockSyncConfig = { user: null, isLoading: true };

test.describe("useAuthGate", () => {
	test("exposes authenticated state when user is signed in", async ({
		mount,
		page,
	}) => {
		await mount(<GateTestWrapper config={signedIn} component="useAuthGate" />);
		await expect(page.getByTestId("is-authenticated")).toHaveText("true");
		await expect(page.getByTestId("is-loading")).toHaveText("false");
		await expect(page.getByTestId("user-name")).toHaveText("Charlie");
		await expect(page.getByTestId("user-email")).toHaveText("charlie@test.com");
	});

	test("exposes unauthenticated state when user is signed out", async ({
		mount,
		page,
	}) => {
		await mount(<GateTestWrapper config={signedOut} component="useAuthGate" />);
		await expect(page.getByTestId("is-authenticated")).toHaveText("false");
		await expect(page.getByTestId("user-name")).toHaveText("null");
		await expect(page.getByTestId("user-email")).toHaveText("null");
	});

	test("exposes loading state", async ({ mount, page }) => {
		await mount(<GateTestWrapper config={loading} component="useAuthGate" />);
		await expect(page.getByTestId("is-loading")).toHaveText("true");
		await expect(page.getByTestId("is-authenticated")).toHaveText("false");
	});
});
