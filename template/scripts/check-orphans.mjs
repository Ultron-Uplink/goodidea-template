// Fails when the repo root contains anything not on the allowlist (ledger G7, H8).
import { readdirSync } from "node:fs";
const allowed = new Set([
  ".agents", ".git", ".github", ".gitignore", ".template-version", "AGENTS.md", "CLAUDE.md", "README.md", "STATUS.md",
  "client", "docs", "node_modules", "package.json", "packages", "pnpm-lock.yaml", "pnpm-workspace.yaml",
  "quarantine.yml", "biome.json", "tsconfig.base.json", "scripts", "server", "settings", "supabase", "tests", ".env.example", "LICENSE",
]);
const stray = readdirSync(".").filter((n) => !allowed.has(n));
if (stray.length) { console.error("Unexpected top-level entries (add to allowlist in scripts/check-orphans.mjs with owner approval, or remove):\n- " + stray.join("\n- ")); process.exit(1); }
console.log("orphans: ok");
