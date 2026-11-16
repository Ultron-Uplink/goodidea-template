# Playbook: add-feature (issue label `type:feature`)
1. Read the issue, its FR-IDs in `docs/product/PRD.md`, and the matching acceptance test in `tests/acceptance/`.
2. If the acceptance test is `pending`, make it pass; do not edit it. If it is wrong, stop and label `test-change` with a reason.
3. Implement the smallest change. Shared types and zod schemas go in `packages/shared/`.
4. Add unit tests beside the code. Run `pnpm verify`.
5. UI work: follow `docs/design/DESIGN.md`; copy comes from the strings file, never inline.
6. Open one PR: `Closes #<issue>`, FR-IDs, evidence from CI. Update `STATUS.md`.
