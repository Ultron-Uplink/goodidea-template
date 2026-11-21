import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export default {
  id: "release-metadata",
  description: "release and rendered versions agree; ledger IDs stay unique when combining changes",
  run(ctx) {
    const read = (dir, file) => readFileSync(join(dir, file), "utf8");
    const version = read(ctx.root, ".template-version").trim();
    const manifest = JSON.parse(read(ctx.root, "template.manifest.json"));
    assert.equal(manifest.templateVersion, version);
    assert.equal(read(ctx.render(), ".template-version").trim(), version);
    assert.ok(read(ctx.root, "CHANGELOG.md").includes(`## ${version}\n`));
    const ids = [...read(ctx.root, "ledger/ledger.yml").matchAll(/^- id: (\S+)$/gm)].map((m) => m[1]);
    assert.equal(new Set(ids).size, ids.length, "duplicate ledger ID");
  },
};
