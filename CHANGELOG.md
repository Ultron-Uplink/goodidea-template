# Changelog

## 0.2.1
- Keep Biome pinned exactly to 2.6.8, migrate its schema and recommended preset, and guard against version/configuration drift with a fixture.
- Clarify private-by-default, owner-merge standing orders and first-day agent onboarding.
- Record private-repo plan-limit ruleset skips in the sync receipt and STATUS, with a regression fixture and ledger entry.
- Keep the rendered template version aligned with the release metadata.

## 0.2.0
- Working walking-skeleton preset: TypeScript pnpm workspace with a Hono server (/health, /version, env schema, error taxonomy), React + Vite + Tailwind client, shared zod schemas, Biome, Vitest. Full verify passes on a rendered project.
- Generator contract (docs/GENERATOR.md) and executable validator.
- apply-settings script (repo settings, labels, ruleset), idempotent.
- Action-pin report (warn mode; strict once SHAs are pinned).
- Ledger generalised so the repo can be public. MIT licence.

## 0.1.0
- First cut: layout, renderer, verify script and structure checks, CI, CODEOWNERS, labels, ruleset and repo settings as JSON, five agent playbooks, ledger, fixtures, self-test.
