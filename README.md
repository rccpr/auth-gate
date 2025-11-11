# auth-gate

A JSR-compliant React library for protecting views in your application with authentication gates.

Partially inspired by the Clerk [Protect component](https://github.com/clerk/javascript/blob/539fad7b80ed284a7add6cf8c4c45cf4c6a0a8b2/packages/react/src/components/controlComponents.tsx#L94).

## Installation

### From JSR (recommended)

```bash
# Deno
deno add @rccpr/auth-gate

# npm
npx jsr add @rccpr/auth-gate

# Yarn
yarn dlx jsr add @rccpr/auth-gate

# pnpm
pnpm dlx jsr add @rccpr/auth-gate

# Bun
bunx jsr add @rccpr/auth-gate
```

### From npm

```bash
# npm
npm install @rccpr/auth-gate

# Yarn
yarn add @rccpr/auth-gate

# pnpm
pnpm add @rccpr/auth-gate

# Bun
bun add @rccpr/auth-gate
```



## Development

### Prerequisites

- [Bun](https://bun.sh/) (for development)

### Setup

```bash
bun install
```

### Available Scripts

```bash
# Build for npm
bun run build

# Type checking
bun run typecheck

# Lint with Biome
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format
```

### JSR Compliance

This library follows JSR's ["no slow types"](https://jsr.io/docs/about-slow-types) policy:

- ✅ All exported functions have explicit return types
- ✅ All exported types are properly declared
- ✅ `isolatedDeclarations: true` in TypeScript config
- ✅ No destructuring in exports
- ✅ No global or module augmentation


## License

MIT 