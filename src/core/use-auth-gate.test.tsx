import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createAuthGate } from "./create-auth-gate";
import type { AsyncLoadState, AuthState } from "./types";

type TestUser = {
	id: string;
};

describe("useAuthGate", () => {
	it("returns normalized auth snapshot", () => {
		const authState: AuthState<TestUser> = {
			user: { id: "user-1" },
			isAuthenticated: true,
			isLoading: false,
		};

		const gate = createAuthGate<TestUser, string>({
			mode: "sync",
			useAuthState: () => authState,
			useAuthorizationDecision: () => ({ status: "allowed" }),
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

	it("provides has-check evaluation helper from useAuthGate", () => {
		const gate = createAuthGate<TestUser, string>({
			mode: "sync",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			useAuthorizationDecision: (check) => ({
				status:
					check && "permission" in check && check.permission === "org:read"
						? "allowed"
						: "denied",
			}),
		});

		const Probe = () => {
			const snapshot = gate.useAuthGate();
			const decision = snapshot.evaluate({ permission: "org:read" });

			return <div>{decision.status}</div>;
		};

		render(
			<gate.AuthGateProvider>
				<Probe />
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("allowed")).toBeInTheDocument();
	});

	it("returns pending evaluation placeholder for async adapters", () => {
		const asyncDecision: AsyncLoadState = { status: "pending" };

		const gate = createAuthGate<TestUser, string>({
			mode: "async",
			useAuthState: () => ({
				user: { id: "user-1" },
				isAuthenticated: true,
				isLoading: false,
			}),
			getAuthorizationDecision: async () => asyncDecision,
			asyncResolver: {
				useDecision: () => asyncDecision,
			},
		});

		const Probe = () => {
			const snapshot = gate.useAuthGate();
			const decision = snapshot.evaluate({ permission: "org:admin" });

			return <div>{decision.status}</div>;
		};

		render(
			<gate.AuthGateProvider>
				<Probe />
			</gate.AuthGateProvider>,
		);

		expect(screen.getByText("pending")).toBeInTheDocument();
	});
});
