# Changing the template

1. Every change runs `node scripts/self-test.mjs`. It must pass.
2. A real-world mistake becomes a row in `ledger/ledger.yml` and a fixture in `fixtures/` before the fix ships.
3. Bump `.template-version` (semver) and add a line to `CHANGELOG.md`.
4. Generated projects are never changed silently. A new version is offered as a migration PR.
