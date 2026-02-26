import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAuthGate } from "../core/create-auth-gate";
import type { AsyncLoadState, AuthState, HasCheck } from "../core/types";

type TestUser = {
	id: string;
};

function createSyncGate(
	authState: AuthState<TestUser>,
	decision: AsyncLoadState = { status: "allowed" },
) {
	return createAuthGate<TestUser, string>({
		mode: "sync",
		useAuthState: () => authState,
		useAuthorizationDecision: () => decision,
	});
}

describe("Show", () => {
	it("renders loadingFallback when auth is loading", () => {
		const gate = createSyncGate({
			user: null,
			isAuthenticated: false,
			isLoading: true,
		});

		render(
			<gate.AuthGateProvider>
				<gate.Show
					when="signed-in"
					loadingFallback={<span>Loading state</span>}
				>
					<span>Protected content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Loading state")).toBeInTheDocument();
	});

	it("supports when='signed-in'", () => {
		const gate = createSyncGate({
			user: { id: "user-1" },
			isAuthenticated: true,
			isLoading: false,
		});

		render(
			<gate.AuthGateProvider>
				<gate.Show when="signed-in" fallback={<span>Denied</span>}>
					<span>Signed in content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Signed in content")).toBeInTheDocument();
	});

	it("renders fallback when signed-out user hits signed-in gate", () => {
		const gate = createSyncGate({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});

		render(
			<gate.AuthGateProvider>
				<gate.Show when="signed-in" fallback={<span>Denied</span>}>
					<span>Signed in content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Denied")).toBeInTheDocument();
	});

	it("supports when='signed-out'", () => {
		const gate = createSyncGate({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});

		render(
			<gate.AuthGateProvider>
				<gate.Show when="signed-out" fallback={<span>Denied</span>}>
					<span>Signed out content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Signed out content")).toBeInTheDocument();
	});

	it("renders fallback for denied authz decision", () => {
		const gate = createSyncGate(
			{
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			},
			{ status: "denied" },
		);

		render(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					fallback={<span>Denied</span>}
				>
					<span>Secret content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Denied")).toBeInTheDocument();
	});

	it("renders loadingFallback for pending authz decision", () => {
		const gate = createSyncGate(
			{
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			},
			{ status: "pending" },
		);

		render(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					loadingFallback={<span>Pending permission</span>}
				>
					<span>Secret content</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Pending permission")).toBeInTheDocument();
	});

	it("supports role, feature and plan checks", () => {
		let lastCheck: HasCheck<string> | null = null;
		const gate = createAuthGate<TestUser, string>({
			mode: "sync",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			useAuthorizationDecision: (check) => {
				lastCheck = check;
				return { status: "allowed" };
			},
		});

		render(
			<gate.AuthGateProvider>
				<gate.Show when={{ role: "org:admin" }}>
					r<gate.Show when={{ feature: "teams" }}>f</gate.Show>
					<gate.Show when={{ plan: "pro" }}>p</gate.Show>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(lastCheck).not.toBeNull();
		expect(screen.getByText("rfp")).toBeInTheDocument();
	});

	it("Protect behaves as Show alias", () => {
		const gate = createSyncGate({
			user: { id: "user-1" },
			isAuthenticated: true,
			isLoading: false,
		});

		expect(gate.Protect).toBe(gate.Show);

		render(
			<gate.AuthGateProvider>
				<gate.Protect when="signed-in" fallback={<span>Denied</span>}>
					<span>Alias content</span>
				</gate.Protect>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Alias content")).toBeInTheDocument();
	});
});
