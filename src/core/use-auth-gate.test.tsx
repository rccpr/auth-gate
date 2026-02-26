import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AuthState, DecisionState } from "./types";
import { createAuthGate } from "./create-auth-gate";

type TestUser = {
	id: string;
};

describe("useAuthGate and hybrid conflict policy", () => {
	it("returns normalized auth snapshot", () => {
		const authState: AuthState<TestUser> = {
			user: { id: "user-1" },
			isAuthenticated: true,
			isLoading: false,
		};

		const gate = createAuthGate<TestUser, string>({
			mode: "sync",
			useAuthState: () => authState,
			checkPermission: () => ({ status: "allowed" }),
		});

		const Probe = () => {
			const snapshot = gate.useAuthGate();

			return (
				<div>
					{snapshot.user?.id}:{String(snapshot.isAuthenticated)}:
					{String(snapshot.isLoading)}
				</div>
			);
		};

		render(
			<gate.AuthGateProvider>
				<Probe />
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("user-1:true:false")).toBeInTheDocument();
	});

	it("provides permission evaluation helper from useAuthGate", () => {
		const gate = createAuthGate<TestUser, string>({
			mode: "sync",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			checkPermission: (permission) => ({
				status: permission === "org:read" ? "allowed" : "denied",
			}),
		});

		const Probe = () => {
			const snapshot = gate.useAuthGate();
			const decision = snapshot.evaluatePermission("org:read");

			return <div>{decision.status}</div>;
		};

		render(
			<gate.AuthGateProvider>
				<Probe />
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("allowed")).toBeInTheDocument();
	});

	it("strict policy keeps pending until async resolves in hybrid mode", () => {
		let asyncDecision: DecisionState = { status: "pending" };

		const gate = createAuthGate<TestUser, string>({
			mode: "hybrid",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			checkPermissionSync: () => ({ status: "allowed" }),
			checkPermissionAsync: () => asyncDecision,
		});

		const { rerender } = render(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					fallback={<span>Denied</span>}
					loadingFallback={<span>Pending</span>}
				>
					<span>Allowed</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Pending")).toBeInTheDocument();

		asyncDecision = { status: "allowed" };

		rerender(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					fallback={<span>Denied</span>}
					loadingFallback={<span>Pending</span>}
				>
					<span>Allowed</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Allowed")).toBeInTheDocument();
	});

	it("optimistic policy allows sync allow first in hybrid mode", () => {
		let asyncDecision: DecisionState = { status: "pending" };

		const gate = createAuthGate<TestUser, string>({
			mode: "hybrid",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			checkPermissionSync: () => ({ status: "allowed" }),
			checkPermissionAsync: () => asyncDecision,
		});

		const { rerender } = render(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					conflictPolicy="optimistic"
					fallback={<span>Denied</span>}
					loadingFallback={<span>Pending</span>}
				>
					<span>Allowed</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Allowed")).toBeInTheDocument();

		asyncDecision = { status: "denied" };

		rerender(
			<gate.AuthGateProvider>
				<gate.Show
					when={{ permission: "org:admin" }}
					conflictPolicy="optimistic"
					fallback={<span>Denied</span>}
					loadingFallback={<span>Pending</span>}
				>
					<span>Allowed</span>
				</gate.Show>
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("Denied")).toBeInTheDocument();
	});
});
