import { createHooks } from "../../src/context/auth.context";
import { PermissionGate } from "../../src/ui/permission-gate";
import { type MockAdapterConfig, MockAuthAdapter } from "./MockAdapter";

type Props = {
	config: MockAdapterConfig;
	permission: string | string[];
	organizationId: string;
	requireAll?: boolean;
	fallback?: string;
};

export function PermissionGateWrapper({
	config,
	permission,
	organizationId,
	requireAll,
	fallback,
}: Props) {
	const adapter = new MockAuthAdapter(config);
	const { AuthGateProvider } = createHooks(adapter);

	return (
		<AuthGateProvider>
			<PermissionGate
				permission={permission}
				organizationId={organizationId}
				requireAll={requireAll}
				fallback={
					fallback ? <div data-testid="fallback">{fallback}</div> : undefined
				}
			>
				<div data-testid="protected-content">Permission-Protected Content</div>
			</PermissionGate>
		</AuthGateProvider>
	);
}
