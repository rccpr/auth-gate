import { test, expect } from "@playwright/experimental-ct-react";
import { PermissionGateWrapper } from "./helpers/PermissionGateWrapper";
import type { MockAdapterConfig } from "./helpers/MockAdapter";

const adminUser: MockAdapterConfig = {
	user: { id: "user-1", name: "Admin", email: "admin@example.com" },
	permissions: ["admin", "editor", "billing"],
	roles: [],
};

const viewerUser: MockAdapterConfig = {
	user: { id: "user-2", name: "Viewer", email: "viewer@example.com" },
	permissions: ["viewer"],
	roles: [],
};

const unauthenticatedUser: MockAdapterConfig = {
	user: null,
	permissions: [],
	roles: [],
};

test.describe("PermissionGate", () => {
	test("renders children when user has the required permission", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={adminUser}
				permission="admin"
				organizationId="org-1"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
		await expect(page.getByTestId("protected-content")).toHaveText(
			"Permission-Protected Content",
		);
	});

	test("shows default denial when user lacks the required permission", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={viewerUser}
				permission="admin"
				organizationId="org-1"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByText("You do not have the necessary permissions")).toBeVisible();
	});

	test("renders fallback when user lacks the required permission", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={viewerUser}
				permission="admin"
				organizationId="org-1"
				fallback="Access denied"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByTestId("fallback")).toBeVisible();
		await expect(page.getByTestId("fallback")).toHaveText("Access denied");
	});

	test("shows denial message when user is not authenticated", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={unauthenticatedUser}
				permission="admin"
				organizationId="org-1"
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByText("You do not have access to this content")).toBeVisible();
	});

	test("allows access when user has at least one of multiple permissions (requireAll=false)", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={adminUser}
				permission={["admin", "superadmin"]}
				organizationId="org-1"
				requireAll={false}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
	});

	test("denies access when user has only some permissions and requireAll=true", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={adminUser}
				permission={["admin", "superadmin"]}
				organizationId="org-1"
				requireAll={true}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeHidden();
		await expect(page.getByText("You do not have the necessary permissions")).toBeVisible();
	});

	test("allows access when user has all required permissions with requireAll=true", async ({
		mount,
		page,
	}) => {
		await mount(
			<PermissionGateWrapper
				config={adminUser}
				permission={["admin", "editor"]}
				organizationId="org-1"
				requireAll={true}
			/>,
		);

		await expect(page.getByTestId("protected-content")).toBeVisible();
	});
});
