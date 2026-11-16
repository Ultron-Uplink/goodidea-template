#!/usr/bin/env node
// Apply repo settings, labels and the main ruleset to a repo. Idempotent: safe to run twice.
// Usage: GITHUB_TOKEN=... node scripts/apply-settings.mjs <owner/repo> [--dry-run] [--settings-dir path]
// GITHUB_API overrides the API base (used by the self-test).
import { readFileSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const repo = argv.find((a) => /^[^/\s-][^/\s]*\/[^/\s]+$/.test(a));
const dry = argv.includes("--dry-run");
const dirFlag = argv.indexOf("--settings-dir");
const dir = dirFlag >= 0 ? argv[dirFlag + 1] : join(root, "template", "settings");
if (!repo) { console.error("usage: apply-settings.mjs <owner/repo> [--dry-run] [--settings-dir path]"); process.exit(2); }
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
must(await api("PATCH", `/repos/${repo}`, load("repo-settings.json")), "repo settings");
console.log("settings: applied");

// 2. labels (create or update)
const existing = new Map(((await api("GET", `/repos/${repo}/labels?per_page=100`)).data ?? []).map((l) => [l.name, l]));
let created = 0, updated = 0;
for (const l of load("labels.json")) {
  if (existing.has(l.name)) { must(await api("PATCH", `/repos/${repo}/labels/${encodeURIComponent(l.name)}`, l), `label ${l.name}`); updated++; }
  else { must(await api("POST", `/repos/${repo}/labels`, l), `label ${l.name}`); created++; }
}
console.log(`labels: ${created} created, ${updated} updated`);

// 3. ruleset (create or replace by name)
const rs = load("ruleset-main.json");
const rulesets = (await api("GET", `/repos/${repo}/rulesets`)).data ?? [];
const found = rulesets.find((r) => r.name === rs.name);
if (found) must(await api("PUT", `/repos/${repo}/rulesets/${found.id}`, rs), "ruleset"); else must(await api("POST", `/repos/${repo}/rulesets`, rs), "ruleset");
console.log(`ruleset: ${found ? "updated" : "created"}`);
