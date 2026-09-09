import { fileURLToPath } from "node:url";
import { configDefaults, defineConfig } from "vitest/config";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    // `.claude/worktrees/` holds full git worktrees of this repo, each with its
    // own `node_modules`. Without this the glob above collects a SECOND copy of
    // every test from them, and those copies resolve `react-dom` out of the
    // worktree while `react` still comes from here — two Reacts in one process,
    // which surfaces as `Cannot read properties of null (reading 'useState')`
    // in tests that have nothing to do with the change being made.
    exclude: [...configDefaults.exclude, "**/.claude/**"],
  },
});
