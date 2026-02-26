import { defineConfig, type ViteUserConfigExport } from "vitest/config";

const config: ViteUserConfigExport = defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		passWithNoTests: true,
		setupFiles: ["./src/test/setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html", "json-summary"],
			include: ["src/**/*.{ts,tsx}"],
			exclude: ["e2e/**", "node_modules/**"],
		},
	},
});

export default config;
