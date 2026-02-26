# @rccpr/auth-gate

<p align='center'>
  <img src='https://github.com/rccpr/auth-gate/blob/main/public/logo.png?raw=true' width=150 />
</p>

Provider-agnostic React UI authorization gates.

`@rccpr/auth-gate` is a client-side rendering utility. It decides what to render in the UI based on auth state and permission decisions.

## Security note

This library does not enforce backend authorization. Keep server-side authorization checks in place for all protected operations.

## Installation

```bash
bun add @rccpr/auth-gate
```

## Core API

The API is factory-first and `Show`-first:

- `createAuthGate(adapter)`
- `Show` (canonical)
- `Protect` (alias of `Show`)
- `SignedIn`
- `SignedOut`
- `useAuthGate`

## Quick start

```tsx
import { createAuthGate } from "@rccpr/auth-gate";

type User = { id: string; email: string };

const gate = createAuthGate<User, string>({
	mode: "sync",
	useAuthState: () => ({
		user: { id: "u_1", email: "dev@example.com" },
		isAuthenticated: true,
		isLoading: false,
	}),
	useAuthorizationDecision: (check) => {
		if (check && "permission" in check && check.permission === "org:admin") {
			return { status: "allowed" };
		}

		return { status: "denied" };
	},
});

export const {
	AuthGateProvider,
	Show,
	Protect,
	SignedIn,
	SignedOut,
	useAuthGate,
} = gate;
```

## Adapter modes

- `sync`: decisions come from hook-native adapter methods (`use*`)
- `async`: decisions come from promise-native adapter methods (`get*`) and a resolver hook

The normalized async load state is:

- `allowed`
- `denied`
- `pending`
- `error`

## Has checks

`Show` authz checks follow Clerk-style `has()` input objects:

- `{ permission: "org:billing:manage" }`
- `{ role: "org:admin" }`
- `{ feature: "teams" }`
- `{ plan: "pro" }`

## Show examples

```tsx
<Show when="signed-in" fallback={<SignInPrompt />}>
	<Dashboard />
</Show>

<Show when="signed-out" fallback={<Dashboard />}>
	<MarketingPage />
</Show>

<Show
	when={{ permission: "org:admin" }}
	fallback={<NoAccess />}
	loadingFallback={<LoadingAccess />}
>
	<AdminPanel />
</Show>

<Protect when={{ permission: "org:billing" }}>
	<BillingSettings />
</Protect>
```

## Async adapter example

```tsx
import { createAuthGate } from "@rccpr/auth-gate";

const gate = createAuthGate({
	mode: "async",
	useAuthState: useMyAuthState,
	getAuthorizationDecision: async (check) => {
		const allowed = await api.can(check);
		return allowed ? { status: "allowed" } : { status: "denied" };
	},
	asyncResolver: {
		useDecision: useAuthorizationDecisionFromQuery,
	},
});
```

## `useAuthGate`

`useAuthGate` returns normalized auth data and an `evaluate(check)` helper:

```tsx
const snapshot = useAuthGate();
const state = snapshot.evaluate({ permission: "org:read" });
```

For async adapters, `evaluate(check)` returns `pending` and `Show` should be preferred for rendered gating.

## Development

```bash
bun install
bun run test
bun run typecheck
bun run lint
bun run build
```
