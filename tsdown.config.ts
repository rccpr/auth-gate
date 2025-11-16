import { defineConfig } from "tsdown";

const config: unknown = defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  platform: 'neutral',
  dts: true,
  sourcemap: true,
  skipNodeModulesBundle: true,
  clean: true,
});

export default config;
