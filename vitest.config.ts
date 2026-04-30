import path from "path";
import { fileURLToPath } from "url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"],
    coverage: {
      provider: "v8",
      include: ["src/api/**", "src/hooks/**", "src/retailers/**"],
      exclude: ["src/**/*.d.ts"],
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      // Stub the WXT #imports barrel so tests never touch extension APIs
      "#imports": path.resolve(__dirname, "tests/__mocks__/wxt-imports.ts"),
      "~/": path.resolve(__dirname, "src") + "/",
    },
  },
});
