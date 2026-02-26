import { createClerkAuthAdapter, createHooks } from "@rccpr/auth-gate";

const clerkAdapter = createClerkAuthAdapter();

export const { AuthGateProvider } = createHooks(clerkAdapter);
