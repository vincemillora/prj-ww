import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Nested git worktrees live under .claude/worktrees — full checkouts of the
    // repo (with their own build output). Never lint them, and ignore nested
    // build dirs anywhere so eslint doesn't crawl generated bundles.
    ".claude/**",
    // .agents mirrors .claude: tracked agent-skill tooling, not app source, and
    // it carries vendored bundles (modern-screenshot.umd.js alone accounted for
    // 78 warnings). Both directories are committed, so without this `eslint .`
    // reported 146 warnings across 20 files that nothing here owns — noise that
    // buries a real finding in app code.
    ".agents/**",
    "**/.next/**",
  ]),
]);

export default eslintConfig;
