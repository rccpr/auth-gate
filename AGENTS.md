# AGENTS.md

## Project overview
- `@rccpr/auth-gate` is a React library for client-side auth UI gating.
- Scope is display logic only (`Show`/`Protect` patterns), not backend authorization.

## Setup and commands
- Install deps: `bun install`
- Build: `bun run build`
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Lint fix: `bun run lint:fix`
- Format: `bun run format`

## Code conventions
- Language: TypeScript + React 19 (`src/**/*.ts`, `src/**/*.tsx`).
- Formatting/linting: Biome (`biome.json`), tabs, double quotes.
- Keep APIs minimal and provider-agnostic; avoid overengineering.
- Prefer client-side-safe behavior and explicit loading states.

## Testing and verification
- Run `bun run typecheck` and `bun run lint` before finishing changes.
- Run `bun run build` for export/type output validation.
- If tests exist, run `bun run test`.

## Design guidance for this repo
- Favor `Show` naming for conditional rendering semantics.
- Keep `Protect` as compatibility alias when needed.
- Normalize auth decisions to `allowed | denied | pending | error`.
- Treat this library as UX gating; document that server auth is still required.

## Cursor Cloud specific instructions

This is a single-package React library (`@rccpr/auth-gate`). There are no backend services, databases, or external dependencies to run.

### Package manager

**Bun is required.** The `preinstall` script enforces `only-allow bun`. If Bun is not on `$PATH`, source `~/.bashrc` or set `export BUN_INSTALL="$HOME/.bun" && export PATH="$BUN_INSTALL/bin:$PATH"`.

### Key commands

All standard dev commands are in `package.json` scripts — see README.md "Available Scripts" section:

- `bun run lint` — Biome lint check
- `bun run lint:fix` — Biome lint with auto-fix
- `bun run typecheck` — TypeScript type check (`tsc --noEmit`)
- `bun run build` — Build library to `dist/` (ESM + CJS + types)
- `bun run dev` — Watch mode (rebuilds on file changes)
- `bun run format` — Biome format with auto-fix

### Notes

- The `commit-msg` hook references `pnpm commitlint` (not `bun`) — this may fail if pnpm is not installed. This is a known inconsistency in the repo.
- The pre-commit hook runs `bun run typecheck` and `bun run lint:fix`.
- Peer dependencies (`react`, `@types/react`) are installed automatically by Bun during `bun install`.

### Example projects

Example apps live in `examples/`. Each has its own `package.json` and `node_modules`.

- **`examples/clerk-vite/`** — Clerk integration playground (Vite + React). Requires `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`. Run with `bun run dev` from that directory. Resolves `@rccpr/auth-gate` from source via Vite alias, so library changes hot-reload instantly.
- E2e tests use Playwright Component Testing (`@playwright/experimental-ct-react`). Run with `bun run test:e2e`. Tests are in `e2e/` and use wrapper components in `e2e/helpers/` to provide mock auth context.
- The `e2e/` directory is excluded from both `tsconfig.json` and `vitest.config.ts` to avoid conflicts between Playwright and Vitest test runners.
- Pre-existing issue: `bun run build` fails because `src/index.ts` imports `./adapters/stack-auth.tsx` but the file is `stack-auth.ts`.
