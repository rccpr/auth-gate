# Clerk + Vite Example

Minimal Vite + React app that integrates `@rccpr/auth-gate` with [Clerk](https://clerk.com) authentication.

## Setup

```bash
cd examples/clerk-vite
bun install
```

Create `.env.local` with your Clerk publishable key:

```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

## Run

```bash
bun run dev
```

Open http://localhost:5173.

## What it demonstrates

- `createClerkAuthAdapter()` + `createHooks()` wiring
- `AuthenticatedGate` — conditionally renders content based on sign-in status
- `useAuth()` hook — exposes typed auth state (`isAuthenticated`, `user`, etc.)
- Clerk's `SignInButton` / `UserButton` alongside auth-gate components

## How it links the library

The Vite config aliases `@rccpr/auth-gate` to `../../src/index.ts` so changes
to the library source are reflected immediately via hot module replacement.
TypeScript resolution uses `paths` in `tsconfig.json`.
