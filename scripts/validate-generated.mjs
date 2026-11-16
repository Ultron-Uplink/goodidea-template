#!/usr/bin/env node
// The executable contract between GoodIdea's generator and this template.
// Usage: node scripts/validate-generated.mjs <dir>   (dir holds prd.json and issues.json)
// See docs/GENERATOR.md for the shapes. Exit 1 with every problem listed.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) { console.error("usage: validate-generated.mjs <dir>"); process.exit(2); }
const prd = JSON.parse(readFileSync(join(dir, "prd.json"), "utf8"));
const issues = JSON.parse(readFileSync(join(dir, "issues.json"), "utf8"));
const errs = [];
const PROV = ["stated", "derived", "assumed"];
const AREAS = ["client", "server", "data", "infra", "design"];

const reqs = prd.requirements ?? [];
const ids = new Set();
for (const r of reqs) {
  if (!/^FR-\d+$/.test(r.id ?? "")) errs.push(`requirement id "${r.id}" must look like FR-1`);
  if (ids.has(r.id)) errs.push(`duplicate requirement ${r.id}`);
  ids.add(r.id);
  if (!r.text || r.text.trim().length < 10) errs.push(`${r.id}: text too short`);
  if (!PROV.includes(r.provenance)) errs.push(`${r.id}: provenance must be one of ${PROV.join(", ")}`);
  if (!Array.isArray(r.acceptance) || r.acceptance.length === 0) errs.push(`${r.id}: needs at least one checkable acceptance statement`);
}
if (reqs.length === 0) errs.push("no requirements");

const assumptions = prd.assumptions ?? [];
if (assumptions.length > 7) errs.push(`${assumptions.length} assumptions; maximum is 7`);
const aIds = new Set(assumptions.map((a) => a.id));
const ranks = assumptions.map((a) => a.rank);
if (new Set(ranks).size !== ranks.length) errs.push("assumption ranks must be unique");
for (const r of reqs) if (r.provenance === "assumed" && !aIds.has(r.assumptionId)) errs.push(`${r.id} is assumed but has no assumptionId on the assumptions list`);

if (!prd.riskiest?.assumption || !prd.riskiest?.killCriterion) errs.push("riskiest.assumption and riskiest.killCriterion are required");

const covered = new Set();
issues.forEach((i, n) => {
  const label = `issue ${n + 1} "${i.title}"`;
  if (!i.title || i.title.length > 80) errs.push(`${label}: title missing or over 80 characters`);
  if (!["m0", "m1"].includes(i.milestone) && !/^m\d+$/.test(i.milestone ?? "")) errs.push(`${label}: milestone must look like m0, m1, m2`);
  if (!AREAS.includes(i.area)) errs.push(`${label}: area must be one of ${AREAS.join(", ")}`);
  if (!Array.isArray(i.acceptance) || i.acceptance.length === 0) errs.push(`${label}: needs acceptance criteria`);
  if (!Array.isArray(i.frs) || i.frs.length === 0) errs.push(`${label}: must reference at least one FR`);
  for (const f of i.frs ?? []) { if (!ids.has(f)) errs.push(`${label}: references unknown ${f}`); covered.add(f); }
});
for (const id of ids) if (!covered.has(id)) errs.push(`${id} has no issue (coverage gap)`);
if (!issues.some((i) => i.milestone === "m0")) errs.push("no m0 (walking skeleton) issues");
if (!issues.some((i) => i.milestone === "m1")) errs.push("no m1 (riskiest slice) issues");

if (errs.length) { console.error("generated content invalid:\n- " + errs.join("\n- ")); process.exit(1); }
console.log(`generated content ok: ${reqs.length} requirements, ${issues.length} issues`);
