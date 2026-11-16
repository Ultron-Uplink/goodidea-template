#!/usr/bin/env node
// Render template/ into an output directory.
// Usage: node scripts/render.mjs --values values.json --out ./out
// Fails (exit 1) if any {{@placeholder}} is left unresolved or any value is missing.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "template.manifest.json"), "utf8"));
const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]]] : a), []));
if (!args.values || !args.out) { console.error("usage: render.mjs --values values.json --out dir"); process.exit(2); }

const values = JSON.parse(readFileSync(args.values, "utf8"));
const errors = [];
const resolved = {};
for (const [name, spec] of Object.entries(manifest.placeholders)) {
  let v = values[name] ?? spec.default;
  if (name === "template_version") v = manifest.templateVersion;
  if (v === undefined) { errors.push(`missing value: ${name}`); continue; }
  if (spec.type === "slug" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) errors.push(`${name} must be kebab-case, got "${v}"`);
  if (/["\\`$<>\n\r]|\{\{/.test(String(v))) errors.push(`${name} must not contain quotes, backslashes, backticks, $, angle brackets, newlines or braces (it is written into code and config)`);
  resolved[name] = String(v);
}
for (const k of Object.keys(values)) if (!(k in manifest.placeholders)) errors.push(`unknown value: ${k}`);

const re = /\{\{@([a-z_]+)\}\}/g;
const src = join(root, manifest.sourceDir);
const written = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const rel = relative(src, p);
    const raw = readFileSync(p, "utf8");
    const out = raw.replace(re, (m, n) => {
      if (!(n in resolved)) { errors.push(`${rel}: undeclared placeholder ${m}`); return m; }
      return resolved[n];
    });
    const dest = join(args.out, rel);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, out);
    written.push(rel);
  }
}
if (!errors.length) walk(src);
if (errors.length) { console.error("render failed:\n- " + errors.join("\n- ")); process.exit(1); }
// Final guard: nothing unresolved anywhere in the output.
for (const rel of written) {
  if (re.test(readFileSync(join(args.out, rel), "utf8"))) { console.error(`unresolved placeholder in ${rel}`); process.exit(1); }
  re.lastIndex = 0;
}
console.log(`rendered ${written.length} files to ${args.out}`);
