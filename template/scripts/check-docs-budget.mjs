// Per-document size cap so every file can be read in one pass (ledger G6, H9).
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
const CAP = { "AGENTS.md": 12_000, default: 20_000 }; // bytes
const bad = [];
function walk(d) {
  for (const n of readdirSync(d)) {
    if (n === "node_modules" || n === ".git") continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!n.endsWith(".md")) continue;
    const cap = CAP[n] ?? CAP.default;
    const size = statSync(p).size;
    if (size > cap) bad.push(`${p}: ${size} bytes > ${cap}`);
  }
}
walk(".");
if (bad.length) { console.error("Documents over budget (split them):\n- " + bad.join("\n- ")); process.exit(1); }
console.log("docs budget: ok");
