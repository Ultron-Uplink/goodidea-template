# Generator contract

How GoodIdea's "Create repo" button uses this template. The executable version of this document is `scripts/validate-generated.mjs`.

## Steps
1. Read the idea (and the owner's confirmed assumptions).
2. Choose values for every placeholder in `template.manifest.json`.
3. Ask the model for the model-generated files only: `prd.json` and `issues.json` (shapes below), plus the PRD, DESIGN and acceptance test text.
4. Run `node scripts/validate-generated.mjs <dir>`. If it fails, send the error list back to the model once; if it fails again, stop and show the owner.
5. Render: `node scripts/render.mjs --values values.json --out <dir>`, then run `pnpm install` in the output so `pnpm-lock.yaml` exists, then `pnpm verify`. Do not continue if verify fails.
6. Preview for the owner: file tree, requirement-to-issue coverage, design style tiles. Wait for approval.
7. Create the repo (private by default), push the rendered files, run `scripts/apply-settings.mjs`, then create the issues from `issues.json`.
8. Wait for CI on the new repo to pass before marking it ready. Record the template version used (`.template-version`).

Every step must be safe to run again after a failure halfway.

## prd.json
```json
{
  "requirements": [
    { "id": "FR-1", "text": "…", "provenance": "stated | derived | assumed",
      "assumptionId": "A1 (required when assumed)", "acceptance": ["checkable statement"] }
  ],
  "assumptions": [ { "id": "A1", "text": "…", "rank": 1 } ],
  "riskiest": { "assumption": "…", "killCriterion": "…" }
}
```
At most 7 assumptions, ranks unique. The owner confirms or strikes them before generation continues.

## issues.json
```json
[ { "title": "≤ 80 chars", "milestone": "m0 | m1 | m2…", "area": "client | server | data | infra | design",
    "frs": ["FR-1"], "acceptance": ["…"], "files": ["optional"], "outOfScope": "optional" } ]
```
Every requirement is covered by at least one issue. There is at least one `m0` issue (walking skeleton) and one `m1` issue (riskiest slice). Later milestones stay as short epics until needed.

## Defaults for generated repos
Private. No licence until the owner picks one. Autonomy level L0 (the owner merges). Default branch `main`.
