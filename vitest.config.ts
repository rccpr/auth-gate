import { defineConfig, type ViteUserConfigExport } from "vitest/config";

const config: ViteUserConfigExport = defineConfig({
	test: {
		environment: "jsdom",
		globals: true,
		setupFiles: ["./vitest.setup.ts"],
		coverage: {
			provider: "v8",
			reporter: ["text", "html"],
			include: ["src/**/*.{ts,tsx}"],
		},
	},
});

export default config;
