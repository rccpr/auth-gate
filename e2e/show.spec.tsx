import { expect, test } from "@playwright/experimental-ct-react";
import { GateTestWrapper } from "./helpers/GateTestWrapper";
import type { MockSyncConfig } from "./helpers/mock-sync-adapter";

const signedIn: MockSyncConfig = {
	user: { id: "u1", name: "Alice", email: "alice@test.com" },
	permissions: ["editor", "viewer"],
	roles: ["admin"],
};

const signedOut: MockSyncConfig = { user: null };

const loading: MockSyncConfig = { user: null, isLoading: true };

test.describe("Show", () => {
	test('renders children when signed-in and when="signed-in"', async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper config={signedIn} component="Show" when="signed-in" />,
		);
		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test('renders fallback when signed-out and when="signed-in"', async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={signedOut}
				component="Show"
				when="signed-in"
				fallback="Please sign in"
			/>,
		);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("Please sign in");
	});

	test('renders children when signed-out and when="signed-out"', async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper config={signedOut} component="Show" when="signed-out" />,
		);
		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test('renders fallback when signed-in and when="signed-out"', async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="Show"
				when="signed-out"
				fallback="Already signed in"
			/>,
		);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("Already signed in");
	});

	test("renders loading fallback while auth is loading", async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={loading}
				component="Show"
				when="signed-in"
				loadingFallback="Loading..."
			/>,
		);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
		await expect(page.getByTestId("loading")).toHaveText("Loading...");
	});

	test("allows access when user has matching permission", async ({
		mount,
		page,
	}) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="Show"
				when={{ permission: "editor" }}
				fallback="No access"
			/>,
		);
		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test("denies access when user lacks permission", async ({ mount, page }) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="Show"
				when={{ permission: "superadmin" }}
				fallback="No access"
			/>,
		);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("No access");
	});

	test("allows access when user has matching role", async ({ mount, page }) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="Show"
				when={{ role: "admin" }}
				fallback="No access"
			/>,
		);
		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test("denies access when user lacks role", async ({ mount, page }) => {
		await mount(
			<GateTestWrapper
				config={signedIn}
				component="Show"
				when={{ role: "owner" }}
				fallback="No access"
			/>,
		);
		await expect(page.getByTestId("protected-content")).not.toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("No access");
	});
});
