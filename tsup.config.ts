import { defineConfig } from "tsup";

const config: unknown = defineConfig({
    entry: ["src/index.ts"],
    dts: true,
    sourcemap: true,
    clean: true,
    format: ["esm", "cjs"],
    external: ["react", "react-dom"],
});

export default config;
