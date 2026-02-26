import { test, expect } from "@playwright/experimental-ct-react";
import { ProtectedOrgGateWrapper } from "./helpers/ProtectedOrgGateWrapper";
import type { MockAdapterConfig } from "./helpers/MockAdapter";

const orgAdmin: MockAdapterConfig = {
	user: { id: "user-1", name: "Org Admin", email: "admin@org.com" },
	permissions: [],
	roles: ["admin", "member"],
};

const orgMember: MockAdapterConfig = {
	user: { id: "user-2", name: "Org Member", email: "member@org.com" },
	permissions: [],
	roles: ["member"],
};

const unauthenticatedUser: MockAdapterConfig = {
	user: null,
	permissions: [],
	roles: [],
};

test.describe("ProtectedOrgGate", () => {
	test("renders children when user has the required role", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgAdmin}
				organizationId="org-1"
				role="admin"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("protected-content")).toHaveText(
			"Org-Protected Content",
		);
	});

	test("shows default denial when user lacks the required role", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgMember}
				organizationId="org-1"
				role="admin"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByText("You do not have the necessary roles")).toBeVisible();
	});

	test("renders fallback when user lacks the required role", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgMember}
				organizationId="org-1"
				role="admin"
				fallback="Insufficient role"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByTestId("fallback")).toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText(
			"Insufficient role",
		);
	});

	test("shows denial message when user is not authenticated", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={unauthenticatedUser}
				organizationId="org-1"
				role="admin"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByText("You do not have access to this content")).toBeVisible();
	});

	test("allows access when user has at least one of multiple roles (requireAll=false)", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgAdmin}
				organizationId="org-1"
				role={["admin", "owner"]}
				requireAll={false}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test("denies access when user has only some roles and requireAll=true", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgAdmin}
				organizationId="org-1"
				role={["admin", "owner"]}
				requireAll={true}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
	});

	test("allows access when user has all required roles with requireAll=true", async ({
		mount,
		page,
	}) => {
		await mount(
			<ProtectedOrgGateWrapper
				config={orgAdmin}
				organizationId="org-1"
				role={["admin", "member"]}
				requireAll={true}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
	});
});
