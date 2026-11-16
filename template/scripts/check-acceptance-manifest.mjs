// Every acceptance test file is listed in tests/acceptance/manifest.json with a status.
// pending = expected to fail until its issue lands; enforced = must pass. Status can only move pending -> enforced.
import { readFileSync, readdirSync, existsSync } from "node:fs";
const dir = "tests/acceptance";
const manifest = JSON.parse(readFileSync(`${dir}/manifest.json`, "utf8"));
const errs = [];
const listed = new Set(Object.keys(manifest.tests));
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /\.(test|spec)\.[tj]sx?$/.test(f)) : [];
for (const f of files) if (!listed.has(f)) errs.push(`${f} is not in manifest.json`);
for (const [f, t] of Object.entries(manifest.tests)) {
  if (!files.includes(f)) errs.push(`manifest lists ${f} but the file is missing (deleted test?)`);
  if (!["pending", "enforced"].includes(t.status)) errs.push(`${f}: status must be pending or enforced`);
  if (!t.fr) errs.push(`${f}: missing fr`);
}
if (errs.length) { console.error("acceptance manifest: " + errs.join("; ")); process.exit(1); }
console.log(`acceptance manifest: ok (${files.length} tests)`);
