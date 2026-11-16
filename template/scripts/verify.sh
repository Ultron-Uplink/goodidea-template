#!/usr/bin/env bash
# The one verify. CI runs exactly this. Fans out to every package that defines a script.
set -euo pipefail
cd "$(dirname "$0")/.."
echo "==> structure"
node scripts/check-orphans.mjs
node scripts/check-docs-budget.mjs
node scripts/check-quarantine.mjs
node scripts/check-acceptance-manifest.mjs
node scripts/check-action-pins.mjs
echo "==> lint"
pnpm exec biome check .
echo "==> packages"
pnpm -r --if-present run typecheck
pnpm -r --if-present run test
echo "verify: ok"
