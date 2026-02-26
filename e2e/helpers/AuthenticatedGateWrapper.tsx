import { createHooks } from "../../src/context/auth.context";
import { AuthenticatedGate } from "../../src/ui/authenticated-gate";
import { type MockAdapterConfig, MockAuthAdapter } from "./MockAdapter";

type Props = {
	config: MockAdapterConfig;
	fallback?: string;
};

export function AuthenticatedGateWrapper({ config, fallback }: Props) {
	const adapter = new MockAuthAdapter(config);
	const { AuthGateProvider } = createHooks(adapter);

	return (
		<AuthGateProvider>
			<AuthenticatedGate
				fallback={
					fallback ? <div data-testid="fallback">{fallback}</div> : undefined
				}
			>
				<div data-testid="protected-content">Protected Content</div>
			</AuthenticatedGate>
		</AuthGateProvider>
	);
}
