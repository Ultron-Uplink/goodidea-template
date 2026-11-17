#!/usr/bin/env node
// Apply repo settings, labels and the main ruleset to a repo. Idempotent: safe to run twice.
// Usage: GITHUB_TOKEN=... node scripts/apply-settings.mjs <owner/repo> [--dry-run] [--settings-dir path] [--receipt path] [--status path]
// GITHUB_API overrides the API base (used by the self-test).
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const repo = argv.shift();
const options = {};
while (argv.length) {
  const flag = argv.shift();
  if (flag === "--dry-run") options[flag] = true;
  else if (["--settings-dir", "--receipt", "--status"].includes(flag) && argv[0] && !argv[0].startsWith("--")) options[flag] = argv.shift();
  else { console.error(`invalid or missing option: ${flag}`); process.exit(2); }
}
const dry = options["--dry-run"];
const dir = options["--settings-dir"] ?? join(root, "template", "settings");
if (!repo || !/^[^/\s-][^/\s]*\/[^/\s]+$/.test(repo)) { console.error("usage: apply-settings.mjs <owner/repo> [--dry-run] [--settings-dir path] [--receipt path] [--status path]"); process.exit(2); }
// Read before remote mutations, so a missing STATUS cannot leave a half-reported sync.
const statusText = options["--status"] ? readFileSync(options["--status"], "utf8") : null;
const base = process.env.GITHUB_API ?? "https://api.github.com";
const token = process.env.GITHUB_TOKEN;
if (!token && !dry) { console.error("GITHUB_TOKEN is required"); process.exit(2); }
const load = (f) => JSON.parse(readFileSync(join(dir, f), "utf8"));

async function api(method, path, body) {
  if (dry && method !== "GET") { console.log(`DRY ${method} ${path}`); return { ok: true, data: {} }; }
  if (dry && !token) return { ok: false, status: 0, data: null };
  const res = await fetch(base + path, { method, headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "content-type": "application/json", "x-github-api-version": "2022-11-28" }, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}
const must = (r, what) => { if (!r.ok) { console.error(`${what} failed (${r.status}): ${JSON.stringify(r.data)}`); process.exit(1); } return r; };

// 1. repo settings
const repository = must(await api("PATCH", `/repos/${repo}`, load("repo-settings.json")), "repo settings");
console.log("settings: applied");

// 2. labels (create or update)
const labels = await api("GET", `/repos/${repo}/labels?per_page=100`);
if (!(dry && labels.status === 0)) must(labels, "list labels");
const existing = new Map((labels.data ?? []).map((l) => [l.name, l]));
let created = 0, updated = 0;
for (const l of load("labels.json")) {
  if (existing.has(l.name)) { must(await api("PATCH", `/repos/${repo}/labels/${encodeURIComponent(l.name)}`, l), `label ${l.name}`); updated++; }
  else { must(await api("POST", `/repos/${repo}/labels`, l), `label ${l.name}`); created++; }
}
console.log(`labels: ${created} created, ${updated} updated`);

// 3. ruleset (create or replace by name)
const rs = load("ruleset-main.json");
// A generic 403 is NOT a plan limit: permission and other failures still stop the sync.
const planLimit = (r) => r.status === 403 && repository.data?.private === true &&
  /^Upgrade to GitHub (?:Pro|Team|Enterprise).* or make this repository public to enable this feature\.?$/i.test(r.data?.message ?? "");
const listed = await api("GET", `/repos/${repo}/rulesets`);
let outcome;
if (planLimit(listed)) outcome = "skipped: plan limit";
else {
  // Tokenless dry runs cannot read existing rulesets.
  if (!(dry && listed.status === 0)) must(listed, "list rulesets");
  const found = (listed.data ?? []).find((r) => r.name === rs.name);
  const applied = await api(found ? "PUT" : "POST", `/repos/${repo}/rulesets${found ? `/${found.id}` : ""}`, rs);
  if (planLimit(applied)) outcome = "skipped: plan limit";
  else { must(applied, "ruleset"); outcome = found ? "updated" : "created"; }
}
const receipt = { repo, settings: "applied", labels: { created, updated }, ruleset: outcome };
if (dry) {
  console.log("dry run: no receipt or STATUS written");
} else {
  console.log(`ruleset: ${outcome}`);
  if (options["--status"]) {
    const line = outcome === "skipped: plan limit"
      ? "Branch protection: skipped: plan limit — unavailable on this private repo's GitHub plan; the owner must check CI and review before merging."
      : "Branch protection: applied (main ruleset).";
    const next = /^Branch protection:.*$/m.test(statusText)
      ? statusText.replace(/^Branch protection:.*$/m, line)
      : `${statusText.trimEnd()}\n${line}\n`;
    writeFileSync(options["--status"], next);
  }
  if (options["--receipt"]) writeFileSync(options["--receipt"], JSON.stringify(receipt, null, 2) + "\n");
  console.log(JSON.stringify(receipt));
}
