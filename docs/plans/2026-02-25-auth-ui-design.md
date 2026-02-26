# Auth Gate UI Authorization v0 Design

Date: 2026-02-25
Status: Approved

## 1) Goal

Build a provider-agnostic, client-side React authorization display layer that can show or hide UI based on:

- signed-in state
- signed-out state
- permission checks

This library is intentionally UI-only and does not enforce backend authorization.

## 2) Product Principles

- Move fast with a minimal v0, avoid overengineering.
- Keep strong type safety for provider-specific capabilities.
- Standardize core behavior without limiting advanced provider usage.
- Mirror Clerk behavior as closely as possible when using Clerk.
- Use naming that does not imply true security boundaries on the client.

## 3) Naming and Semantics

Canonical control component for v0 is `Show`.

- `Show` communicates conditional rendering behavior without implying hard protection.
- `Protect` is exported as a compatibility alias to ease Clerk-style migration.
- Docs will prefer `Show`; `Protect` remains supported in v0.

## 4) Main Entrypoint and API Shape

v0 starts from a typed factory model.

- Main entrypoint exports `createAuthGate` and core types.
- Consumers create a provider-bound toolkit once and use returned components/hooks.

Conceptual usage:

```ts
const gate = createAuthGate(adapter)

export const {
  AuthGateProvider,
  Show,
  Protect,
  SignedIn,
  SignedOut,
  useAuthGate,
} = gate
```

## 5) Adapter Contract (Discriminated Union)

Top-level discriminated union is used for provider execution model:

- `mode: "sync"`
- `mode: "async"`
- `mode: "hybrid"`

The adapter must expose auth state and permission decision state in a normalized shape.

Decision statuses:

- `allowed`
- `denied`
- `pending`
- `error`

### 5.1 Auth Lane

Required in all modes:

- `useAuthState()` returns normalized auth snapshot (`user`, `isAuthenticated`, `isLoading`, optional `error`).

### 5.2 Permission Lane

- `sync`: adapter returns immediate decision state.
- `async`: adapter returns hook-derived decision state (from provider hook, SWR, TanStack Query, etc.).
- `hybrid`: adapter provides both sync and async lanes.

Loader/dedup/cache strategy is owned by the adapter. Core library stays fetch-framework agnostic.

## 6) Show/Protect Resolution Algorithm

Given props (`when`, optional `fallback`, optional `loadingFallback`, optional `conflictPolicy`):

1. Read auth state.
2. If auth is loading, render `loadingFallback ?? null`.
3. Evaluate identity guard (`signed-in` or `signed-out`) if applicable.
4. If identity guard fails, render `fallback ?? null`.
5. If permission evaluation is required, evaluate via adapter mode and normalize to decision state.
6. Render by decision:
   - `allowed` -> children
   - `denied` -> `fallback ?? null`
   - `pending` -> `loadingFallback ?? null`
   - `error` -> `fallback ?? null` (fail-closed for v0)

## 7) Hybrid Conflict Policy

Per-gate policy is supported.

- `strict`: async authority wins; pending async keeps output pending.
- `optimistic`: sync result may render first; async may later revoke.

Policy precedence:

1. per-`Show` prop
2. adapter default
3. library default (`strict`)

## 8) `when` Contract

`when` is required and supports:

- `"signed-in"`
- `"signed-out"`
- requirement payload/object (provider-agnostic generic)
- predicate callback with typed provider context

Predicates may be sync or async, but async evaluation must be mediated through adapter hooks/state, not raw promises in render.

## 9) Supporting Components and Hooks

Factory returns:

- `AuthGateProvider`
- `Show`
- `Protect` (alias)
- `SignedIn` (thin wrapper for `when="signed-in"`)
- `SignedOut` (thin wrapper for `when="signed-out"`)
- `useAuthGate` (normalized auth snapshot and helper evaluation access)

## 10) Non-Obvious Edge Cases

- Pending session defaults to fail-closed UI behavior.
- Async race safety: stale results must not override newer checks.
- Predicate identity changes are treated as new evaluations.
- Permission checks are skipped when identity guard already fails.
- Error state is normalized and rendered as denied-like behavior in v0.

## 11) Scope

### In Scope for v0

- Typed factory as primary API
- Adapter union with `sync | async | hybrid`
- `Show` canonical + `Protect` alias
- `SignedIn` and `SignedOut`
- Normalized decision state machine
- Per-gate conflict policy
- Client-only behavior

### Out of Scope for v0

- SSR/RSC guarantees
- Built-in caching/fetch engine
- Large status component suite
- Redirect components
- Multi-session orchestration
- Advanced permission DSL beyond requirement object + predicate

## 12) Success Criteria

- Clerk-like behavior can be represented with near-identical UX semantics.
- Hook-native and query-native providers are both supported without core changes.
- Core API remains provider-agnostic while preserving provider-specific types.
- Minimal mental model: one factory, one canonical render gate, one decision state machine.

## 13) Explicit Security Note

This library controls client-side rendering only. It does not replace backend authorization checks.
