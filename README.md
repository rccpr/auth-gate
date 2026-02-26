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
	checkPermission: (permission) => {
		if (permission === "org:admin") return { status: "allowed" };
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

- `sync`: permission decisions are immediate
- `async`: permission decisions come from hook-managed async state (`allowed | denied | pending | error`)
- `hybrid`: both sync and async lanes are available

The decision state machine is:

- `allowed`
- `denied`
- `pending`
- `error`

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

## Hybrid conflict policy

`Show` supports per-component conflict policy:

- `strict` (default): async decision is authoritative
- `optimistic`: sync decision may render first while async is pending

Precedence:

1. `Show` prop `conflictPolicy`
2. adapter `defaultConflictPolicy`
3. library default `strict`

## Development

```bash
bun install
bun run test
bun run typecheck
bun run lint
bun run build
```
