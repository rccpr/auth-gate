import { expect, test } from "@playwright/experimental-ct-react";
import { GateTestWrapper } from "./helpers/GateTestWrapper";
import type { MockSyncConfig } from "./helpers/mock-sync-adapter";

const signedIn: MockSyncConfig = {
	user: { id: "u1", name: "Bob", email: "bob@test.com" },
};

const signedOut: MockSyncConfig = { user: null };

const loading: MockSyncConfig = { user: null, isLoading: true };

test.describe("SignedIn", () => {
	test("renders children when user is signed in", async ({ mount, page }) => {
		await mount(<GateTestWrapper config={signedIn} component="SignedIn" />);
		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("protected-content")).toHaveText(
			"Signed In Content",
		);
	});

	test("hides children when user is signed out", async ({ mount, page }) => {
		await mount(<GateTestWrapper config={signedOut} component="SignedIn" />);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
	});

	test("renders fallback when user is signed out", async ({ mount, page }) => {
		await mount(
			<GateTestWrapper
				config={signedOut}
				component="SignedIn"
				fallback="Please sign in"
			/>,
		);
		await expect(page.getByTestId("fallback")).toHaveText("Please sign in");
	});

	test("renders loading fallback while auth is loading", async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={loading}
				component="SignedIn"
				loadingFallback="Loading..."
			/>,
		);
		await expect(page.getByTestId("loading")).toHaveText("Loading...");
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
	});
});

test.describe("SignedOut", () => {
	test("renders children when user is signed out", async ({ mount, page }) => {
		await mount(<GateTestWrapper config={signedOut} component="SignedOut" />);
		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("protected-content")).toHaveText(
			"Signed Out Content",
		);
	});

	test("hides children when user is signed in", async ({ mount, page }) => {
		await mount(<GateTestWrapper config={signedIn} component="SignedOut" />);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
	});

	test("renders fallback when user is signed in", async ({ mount, page }) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="SignedOut"
				fallback="Already signed in"
			/>,
		);
		await expect(page.getByTestId("fallback")).toHaveText("Already signed in");
	});

	test("renders loading fallback while auth is loading", async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={loading}
				component="SignedOut"
				loadingFallback="Loading..."
			/>,
		);
		await expect(page.getByTestId("loading")).toHaveText("Loading...");
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
	});
});
