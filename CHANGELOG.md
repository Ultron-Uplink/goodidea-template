# Changelog

## 0.2.0
- Working walking-skeleton preset: TypeScript pnpm workspace with a Hono server (/health, /version, env schema, error taxonomy), React + Vite + Tailwind client, shared zod schemas, Biome, Vitest. Full verify passes on a rendered project.
- Generator contract (docs/GENERATOR.md) and executable validator.
- apply-settings script (repo settings, labels, ruleset), idempotent.
- Action-pin report (warn mode; strict once SHAs are pinned).
- Ledger generalised so the repo can be public. MIT licence.

## 0.1.0
- First cut: layout, renderer, verify script and structure checks, CI, CODEOWNERS, labels, ruleset and repo settings as JSON, five agent playbooks, ledger, fixtures, self-test.
