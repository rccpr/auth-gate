import type { ShowWhen } from "../../src/core/create-auth-gate";
import { createAuthGate } from "../../src/core/create-auth-gate";
import {
	createMockSyncAdapter,
	type MockSyncConfig,
} from "./mock-sync-adapter";

type Props = {
	config: MockSyncConfig;
	component: "Show" | "SignedIn" | "SignedOut" | "useAuthGate";
	when?: ShowWhen;
	fallback?: string;
	loadingFallback?: string;
};

export function GateTestWrapper({
	config,
	component,
	when,
	fallback,
	loadingFallback,
}: Props) {
	const adapter = createMockSyncAdapter(config);
	const gate = createAuthGate(adapter);

	const fallbackEl = fallback ? (
		<div data-testid="fallback">{fallback}</div>
	) : undefined;
	const loadingEl = loadingFallback ? (
		<div data-testid="loading">{loadingFallback}</div>
	) : undefined;

	return (
		<gate.AuthGateProvider>
			{component === "Show" && when && (
				<gate.Show
					when={when}
					fallback={fallbackEl}
					loadingFallback={loadingEl}
				>
					<div data-testid="protected-content">Protected Content</div>
				</gate.Show>
			)}
			{component === "SignedIn" && (
				<gate.SignedIn fallback={fallbackEl} loadingFallback={loadingEl}>
					<div data-testid="protected-content">Signed In Content</div>
				</gate.SignedIn>
			)}
			{component === "SignedOut" && (
				<gate.SignedOut fallback={fallbackEl} loadingFallback={loadingEl}>
					<div data-testid="protected-content">Signed Out Content</div>
				</gate.SignedOut>
			)}
			{component === "useAuthGate" && <AuthGateHookDisplay gate={gate} />}
		</gate.AuthGateProvider>
	);
}

function AuthGateHookDisplay({
	gate,
}: {
	gate: ReturnType<typeof createAuthGate>;
}) {
	const auth = gate.useAuthGate();

	return (
		<div data-testid="hook-output">
			<span data-testid="is-authenticated">{String(auth.isAuthenticated)}</span>
			<span data-testid="is-loading">{String(auth.isLoading)}</span>
			<span data-testid="user-name">{auth.user?.name ?? "null"}</span>
			<span data-testid="user-email">{auth.user?.email ?? "null"}</span>
		</div>
	);
}
