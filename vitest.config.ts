import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  // `tsconfig.json` laisse le JSX à Next (`preserve`) : le transformeur de
  // Vitest doit donc le compiler lui-même pour les tests qui importent des
  // composants (ici le catalogue de décors).
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
  },
});
