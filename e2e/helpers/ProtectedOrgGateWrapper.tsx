import { createHooks } from "../../src/context/auth.context";
import { ProtectedOrgGate } from "../../src/ui/protected-org-gate";
import { MockAuthAdapter, type MockAdapterConfig } from "./MockAdapter";

type Props = {
	config: MockAdapterConfig;
	organizationId: string;
	role: string | string[];
	requireAll?: boolean;
	fallback?: string;
};

export function ProtectedOrgGateWrapper({
	config,
	organizationId,
	role,
	requireAll,
	fallback,
}: Props) {
	const adapter = new MockAuthAdapter(config);
	const { AuthGateProvider } = createHooks(adapter);

	return (
		<AuthGateProvider>
			<ProtectedOrgGate
				organizationId={organizationId}
				role={role}
				requireAll={requireAll}
				fallback={fallback ? <div data-testid="fallback">{fallback}</div> : undefined}
			>
				<div data-testid="protected-content">Org-Protected Content</div>
			</ProtectedOrgGate>
		</AuthGateProvider>
	);
}
