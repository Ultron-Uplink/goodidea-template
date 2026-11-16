#!/usr/bin/env node
// Render a sample project, run its verify, then replay every fixture. Exit 1 on any failure.
import { mkdtempSync, writeFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const values = { project_name: "Sample App", project_slug: "sample-app", owner: "acme", owner_login: "acme-owner", agent_login: "acme-agent", mission: "Help sample users do a sample thing." };
const exec = (cmd, cwd) => { const r = spawnSync(cmd, { cwd, shell: true, encoding: "utf8" }); return { code: r.status ?? 1, out: (r.stdout ?? "") + (r.stderr ?? "") }; };
const render = () => {
  const dir = mkdtempSync(join(tmpdir(), "tpl-"));
  const vals = join(dir, "values.json"); writeFileSync(vals, JSON.stringify(values));
  const out = join(dir, "project");
  const r = exec(`node scripts/render.mjs --values ${vals} --out ${out}`, root);
  if (r.code) throw new Error("render failed: " + r.out);
  return out;
};
let failed = 0;
const step = (name, fn) => { try { fn(); console.log(`PASS  ${name}`); } catch (e) { failed++; console.log(`FAIL  ${name}\n      ${String(e.message).split("\n").join("\n      ")}`); } };

step("render sample project", () => render());
step("sample project passes its own structure checks", () => {
  const d = render();
  for (const s of ["check-orphans", "check-docs-budget", "check-quarantine", "check-acceptance-manifest"]) {
    const r = exec(`node scripts/${s}.mjs`, d); if (r.code) throw new Error(`${s}: ${r.out}`);
  }
});
step("rendered project installs and passes the FULL verify (lint, types, tests)", () => {
  const d = render();
  let r = exec("pnpm install 2>&1", d); if (r.code) throw new Error("install: " + r.out.slice(-600));
  r = exec("pnpm verify 2>&1", d); if (r.code) throw new Error("verify: " + r.out.slice(-1200));
  r = exec("pnpm install --frozen-lockfile 2>&1", d); if (r.code) throw new Error("frozen lockfile: " + r.out.slice(-400));
});
step("settings JSON parses", () => { const d = render(); for (const f of ["labels", "ruleset-main", "repo-settings"]) JSON.parse(require_(join(d, "settings", f + ".json"))); });
function require_(p) { return exec(`cat ${p}`, root).out; }

for (const f of readdirSync(join(root, "fixtures")).filter((n) => n.endsWith(".fixture.mjs"))) {
  const mod = (await import(pathToFileURL(join(root, "fixtures", f)).href)).default;
  await Promise.resolve().then(() => mod.run({ render, exec, root })).then(() => console.log(`PASS  fixture ${mod.id}: ${mod.description}`)).catch((e) => { failed++; console.log(`FAIL  fixture ${mod.id}: ${e.message}`); });
}
console.log(failed ? `\n${failed} failure(s)` : "\nall checks passed");
process.exit(failed ? 1 : 0);
