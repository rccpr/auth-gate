import { expect, test } from "@playwright/experimental-ct-react";
import { AuthenticatedGateWrapper } from "./helpers/AuthenticatedGateWrapper";
import type { MockAdapterConfig } from "./helpers/MockAdapter";

const authenticatedUser: MockAdapterConfig = {
	user: { id: "user-1", name: "Test User", email: "test@example.com" },
	permissions: [],
	roles: [],
};

const unauthenticatedUser: MockAdapterConfig = {
	user: null,
	permissions: [],
	roles: [],
};

test.describe("AuthenticatedGate", () => {
	test("renders children when user is authenticated", async ({
		mount,
		page,
	}) => {
		await mount(<AuthenticatedGateWrapper config={authenticatedUser} />);

		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("protected-content")).toHaveText(
			"Protected Content",
		);
	});

	test("hides children when user is not authenticated", async ({
		mount,
		page,
	}) => {
		await mount(<AuthenticatedGateWrapper config={unauthenticatedUser} />);

		await expect(page.getByTestId("protected-content")).toBeHidden();
	});

	test("renders fallback when user is not authenticated", async ({
		mount,
		page,
	}) => {
		await mount(
			<AuthenticatedGateWrapper
				config={unauthenticatedUser}
				fallback="Please log in"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByTestId("fallback")).toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("Please log in");
	});

	test("does not render fallback when user is authenticated", async ({
		mount,
		page,
	}) => {
		await mount(
			<AuthenticatedGateWrapper
				config={authenticatedUser}
				fallback="Please log in"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("fallback")).toBeHidden();
	});
});
