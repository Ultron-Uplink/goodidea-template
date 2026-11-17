# Changing the template

1. Before opening or updating a PR, run `node scripts/self-test.mjs`. It must pass. Keep one small PR per issue, use a branch ending in the ticket short name, and include `Closes #N` (cross-repo issues use their full reference). The owner merges (L0); agents do not merge or tag.
2. A real-world mistake becomes a row in `ledger/ledger.yml` and a fixture in `fixtures/` before the fix ships.
3. For a release, bump `.template-version` and the manifest version together (semver), and update `CHANGELOG.md`. Quality PRs may propose the next tag without changing versions; the owner decides the release and downstream pin bump.
4. Generated projects are never changed silently. A new version is offered as a migration PR.
