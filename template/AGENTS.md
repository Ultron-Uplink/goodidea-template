# AGENTS.md — {{@project_name}}

> Mission: {{@mission}}
> Read this file fully before planning or editing. Follow higher-priority instructions; ask the owner about unresolved conflicts.

## Commands
```bash
pnpm install --frozen-lockfile   # setup
pnpm verify                     # lint, typecheck, unit, acceptance, orphan and docs checks
```
Run `pnpm verify` before opening or updating a PR; CI runs the same command. Local success does not replace CI.

## Layout
- `client/` React + Vite SPA. `server/` Node + Hono API. `packages/shared/` shared zod schemas and types.
- `docs/product/` PRD (FR-IDs). `docs/contracts/` API and data contracts. `docs/design/DESIGN.md` tokens.
- `tests/acceptance/` tests tracked by FR in `manifest.json`. `.agents/playbooks/` playbook matching the issue's task type.
- `STATUS.md` short handoff, updated each session. Keep top-level files within `scripts/check-orphans.mjs`'s allowlist.

## Standing orders
1. Private by default; only the owner can authorize making the repo public.
2. Autonomy L0: agents never merge. {{@owner_login}} merges.
3. One issue, one small PR with `Closes #N` (the issue number). Branch: `agent/<issue>-<ticket-short-name>`, ending with the ticket short name. Reuse the branch and PR on retries.
4. Protected paths need `{{@owner_login}}` approval: `tests/acceptance/`, `docs/contracts/`, `.github/`, `scripts/`, `AGENTS.md`, `quarantine.yml`, `settings/`.
5. Never weaken, skip or delete a test to get green. Acceptance-test changes need the `test-change` label and a written reason.
6. Reproduce and name the cause (failing test or log) before changing config, timeouts or retries.
7. PR evidence must include a CI link or rerunnable command; screenshots do not substitute for check output.
8. No secrets in code, tests or logs. Read config through the env schema only.
9. No new dependency without issue approval. Touch only what the issue needs.
10. After two failed attempts at the same fix, label `agent:blocked` and comment what you tried and what you need.

## Definition of done
- [ ] Acceptance criteria met and covered by a test; `pnpm verify` passes and CI is green.
- [ ] PR closes the issue, lists FR-IDs touched, and includes reproducible evidence.
- [ ] `STATUS.md` updated.

Template version {{@template_version}}.
