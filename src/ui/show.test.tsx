import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAuthGate } from "../core/create-auth-gate";
import type { AuthState, DecisionState } from "../core/types";

type TestUser = {
	id: string;
};

function createSyncGate(
	authState: AuthState<TestUser>,
	decision: DecisionState = { status: "allowed" },
) {
	return createAuthGate<TestUser, string>({
		mode: "sync",
		useAuthState: () => authState,
		checkPermission: () => decision,
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

	it("renders fallback for denied permission decision", () => {
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

	it("renders loadingFallback for pending permission decision", () => {
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
