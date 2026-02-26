# Auth Gate UI Authorization v0 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ship a client-only, provider-agnostic UI authorization API with typed factory output (`Show`, `Protect` alias, `SignedIn`, `SignedOut`, `useAuthGate`) and a discriminated adapter union (`sync | async | hybrid`).

**Architecture:** Keep runtime minimal: factory creates a typed toolkit bound to one adapter, provider stores adapter in context, and render gates consume a normalized decision state machine (`allowed | denied | pending | error`). `Show` is canonical naming, `Protect` is compatibility alias. Async loading/caching remains adapter-owned.

**Tech Stack:** React 19, TypeScript, Bun, tsdown, Biome, Vitest, Testing Library.

---

### Task 1: Add test harness for React gate behavior

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`

**Step 1: Write the failing test command first**

Run: `bun x vitest run`
Expected: FAIL because Vitest is not installed/configured.

**Step 2: Add minimal test tooling**

Update `package.json` scripts and devDependencies:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.1.9",
    "@testing-library/react": "^16.1.0",
    "@testing-library/jest-dom": "^6.6.3",
    "jsdom": "^25.0.1"
  }
}
```

Create `vitest.config.ts` with jsdom + setup file:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
});
```

Create `src/test/setup.ts`:

```ts
import "@testing-library/jest-dom";
```

**Step 3: Run test command to verify harness is wired**

Run: `bun run test`
Expected: PASS with no tests found (or PASS once tests are added in Task 2).

**Step 4: Commit**

```bash
git add package.json vitest.config.ts src/test/setup.ts bun.lock
git commit -m "chore: add react test harness for gate components"
```

### Task 2: Define and test core normalized types

**Files:**
- Create: `src/core/types.ts`
- Create: `src/core/types.test.ts`

**Step 1: Write the failing test**

Create `src/core/types.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { DecisionState } from "./types";

describe("DecisionState", () => {
  it("supports allowed status", () => {
    const value: DecisionState<boolean> = { status: "allowed", data: true };
    expect(value.status).toBe("allowed");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/core/types.test.ts`
Expected: FAIL with module not found for `./types`.

**Step 3: Write minimal implementation**

Create `src/core/types.ts` with:

```ts
export type DecisionStatus = "allowed" | "denied" | "pending" | "error";

export type DecisionState<T = boolean> = {
  status: DecisionStatus;
  data?: T;
  error?: unknown;
};

export type AuthState<TUser> = {
  user: TUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: unknown;
};

export type ConflictPolicy = "strict" | "optimistic";
```

**Step 4: Run test to verify it passes**

Run: `bun run test src/core/types.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/core/types.ts src/core/types.test.ts
git commit -m "feat: add normalized auth gate decision types"
```

### Task 3: Implement adapter union + typed factory context shell

**Files:**
- Create: `src/core/create-auth-gate.tsx`
- Create: `src/core/create-auth-gate.test.tsx`
- Modify: `src/context/auth.context.ts`

**Step 1: Write failing tests for factory shape**

Create `src/core/create-auth-gate.test.tsx`:

```tsx
import { describe, expect, it } from "vitest";
import { createAuthGate } from "./create-auth-gate";

describe("createAuthGate", () => {
  it("returns provider and gate components", () => {
    const gate = createAuthGate({
      mode: "sync",
      useAuthState: () => ({ user: null, isAuthenticated: false, isLoading: false }),
      checkPermission: () => ({ status: "denied" }),
    });

    expect(gate.Show).toBeTypeOf("function");
    expect(gate.Protect).toBeTypeOf("function");
    expect(gate.AuthGateProvider).toBeTypeOf("function");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/core/create-auth-gate.test.tsx`
Expected: FAIL because factory is missing.

**Step 3: Write minimal implementation**

In `src/core/create-auth-gate.tsx`, define:

- top-level adapter union `mode: "sync" | "async" | "hybrid"`
- `createAuthGate` returning placeholders for:
  - `AuthGateProvider`
  - `Show`
  - `Protect`
  - `SignedIn`
  - `SignedOut`
  - `useAuthGate`

In `src/context/auth.context.ts`, adapt context type to hold generic adapter + resolved auth state hooks.

**Step 4: Run test to verify it passes**

Run: `bun run test src/core/create-auth-gate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/core/create-auth-gate.tsx src/core/create-auth-gate.test.tsx src/context/auth.context.ts
git commit -m "feat: add typed auth gate factory and adapter union"
```

### Task 4: Implement `Show` decision algorithm and wrappers

**Files:**
- Create: `src/ui/show.tsx`
- Create: `src/ui/show.test.tsx`
- Modify: `src/ui/gate.tsx`

**Step 1: Write failing behavior tests**

Add tests for:

- returns `loadingFallback` when auth loading
- supports `when="signed-in"`
- supports `when="signed-out"`
- denied renders fallback
- pending renders `loadingFallback`
- `Protect` behaves as alias

Minimal test shape:

```tsx
it("renders fallback when signed-out user hits signed-in gate", () => {
  // render Show in provider with unauthenticated state
  // expect fallback text
});
```

**Step 2: Run test to verify it fails**

Run: `bun run test src/ui/show.test.tsx`
Expected: FAIL on missing logic and exports.

**Step 3: Write minimal implementation**

Implement in `src/ui/show.tsx`:

- canonical `Show`
- `Protect = Show`
- `SignedIn` and `SignedOut` wrappers
- algorithm order from design doc (auth loading -> identity guard -> permission -> render by decision)
- v0 default fail-closed behavior for `pending` and `error`

Keep `src/ui/gate.tsx` as compatibility re-export or remove usage by redirecting exports to `show.tsx`.

**Step 4: Run test to verify it passes**

Run: `bun run test src/ui/show.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/ui/show.tsx src/ui/show.test.tsx src/ui/gate.tsx
git commit -m "feat: add show gate with protect alias and auth wrappers"
```

### Task 5: Implement `useAuthGate` and hybrid conflict policy behavior

**Files:**
- Modify: `src/core/create-auth-gate.tsx`
- Create: `src/core/use-auth-gate.test.tsx`

**Step 1: Write failing tests for hook and conflict policy**

Cover:

- hook returns normalized auth snapshot
- `strict` policy keeps pending until async resolves
- `optimistic` policy allows sync-allow first in hybrid mode

**Step 2: Run test to verify it fails**

Run: `bun run test src/core/use-auth-gate.test.tsx`
Expected: FAIL on missing hook/conflict behavior.

**Step 3: Write minimal implementation**

- implement `useAuthGate`
- implement conflict policy precedence:
  1) per-component
  2) adapter default
  3) library default `strict`

**Step 4: Run test to verify it passes**

Run: `bun run test src/core/use-auth-gate.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/core/create-auth-gate.tsx src/core/use-auth-gate.test.tsx
git commit -m "feat: add useAuthGate and hybrid conflict policy"
```

### Task 6: Wire exports and docs to canonical `Show`

**Files:**
- Modify: `src/index.ts`
- Modify: `README.md`

**Step 1: Write failing integration checks**

Run:

```bash
bun run typecheck
bun run build
```

Expected: FAIL until exports are correctly wired.

**Step 2: Write minimal export/doc updates**

In `src/index.ts`, export:

- factory + core types
- remove placeholder `Gate` export

In `README.md`, document:

- `Show` as canonical API
- `Protect` compatibility alias
- client-side-only caveat
- adapter modes (`sync`, `async`, `hybrid`)

**Step 3: Run verification suite**

Run:

```bash
bun run test
bun run typecheck
bun run lint
bun run build
```

Expected: all PASS.

**Step 4: Commit**

```bash
git add src/index.ts README.md
git commit -m "docs: publish show-first api and adapter mode guidance"
```

### Task 7: Final QA and release readiness checks

**Files:**
- Modify: `README.md` (if QA uncovers gaps)

**Step 1: Validate behavior matrix manually**

Check these combinations with tests or local example harness:

- signed-in + allowed
- signed-in + denied
- signed-out + signed-in gate
- loading auth
- hybrid strict pending
- hybrid optimistic flip

**Step 2: Run all quality commands again**

Run:

```bash
bun run test
bun run typecheck
bun run lint
bun run build
```

Expected: all PASS.

**Step 3: Commit final polish (if needed)**

```bash
git add README.md
git commit -m "chore: polish docs and verify auth gate v0 readiness"
```
