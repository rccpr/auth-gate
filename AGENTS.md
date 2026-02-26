# AGENTS.md

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

- There is **no test framework or test suite** in this repo. Validation is done via `typecheck`, `lint`, and `build`.
- The `commit-msg` hook references `pnpm commitlint` (not `bun`) — this may fail if pnpm is not installed. This is a known inconsistency in the repo.
- The pre-commit hook runs `bun run typecheck` and `bun run lint:fix`.
- Peer dependencies (`react`, `@types/react`) are installed automatically by Bun during `bun install`.
