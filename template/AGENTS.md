# AGENTS.md — {{@project_name}}

> Mission: {{@mission}}
> Read this file fully before planning or editing. If a rule here conflicts with a chat instruction, ask before breaking it.

## Commands (the only ones that count)
```bash
pnpm install --frozen-lockfile   # setup
pnpm verify                      # the ONE check: lint, typecheck, unit, acceptance, orphan and docs checks
```
CI runs exactly `pnpm verify`. If it passes locally it passes in CI. Do not invent other verify paths.

## Layout
- `client/` React + Vite SPA. `server/` Node + Hono API. `packages/shared/` zod schemas and types used by both.
- `docs/product/` PRD (FR-IDs) and assumptions. `docs/contracts/` API and data contracts. `docs/design/DESIGN.md` tokens.
- `tests/acceptance/` one test per FR, tracked in `manifest.json`.
- `.agents/playbooks/` task-type playbooks. Pick the one matching the issue's label.
- `STATUS.md` short handoff note. Update it at the end of every session.
Nothing else at the top level. `scripts/check-orphans.mjs` fails on stray files.

## Rules
1. One issue, one branch `agent/<issue>-<slug>`, one PR that says `Closes #<issue>`. Retries update the same branch and PR.
2. Protected paths need `{{@owner_login}}` approval: `tests/acceptance/`, `docs/contracts/`, `.github/`, `scripts/`, `AGENTS.md`, `quarantine.yml`, `settings/`.
3. Never weaken, skip or delete a test to get green. A real change to an acceptance test needs the `test-change` label and a written reason.
4. Reproduce and name the cause (a failing test or log) before changing config, timeouts or retries.
5. Evidence in a PR is a CI link or a command a reviewer can rerun. No screenshots of local runs as proof.
6. No secrets in code, tests or logs. Read config through the env schema only.
7. No new dependency without approval in the issue.
8. Surgical diffs: touch only what the issue needs.
9. Retry budget: two attempts, then label `agent:blocked` and comment what you tried and what you need.
10. Agents never merge. {{@owner_login}} merges (autonomy level L0).

## Definition of done
- [ ] Acceptance criteria met and covered by a test.
- [ ] `pnpm verify` passes.
- [ ] PR links the issue, lists FR-IDs touched, and attaches reproducible evidence.
- [ ] `STATUS.md` updated.

Template version {{@template_version}}.
