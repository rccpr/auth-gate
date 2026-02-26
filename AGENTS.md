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
