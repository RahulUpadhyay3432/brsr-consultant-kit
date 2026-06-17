import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Unit tests run against the pure logic only (no DB / network / React).
// The "@" alias mirrors tsconfig so imports resolve the same way.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
