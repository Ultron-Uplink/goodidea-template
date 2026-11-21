import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export default {
  id: "G13",
  description: "Biome stays exactly pinned with a matching, migrated configuration",
  run(ctx) {
    const dir = ctx.render();
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    const config = JSON.parse(readFileSync(join(dir, "biome.json"), "utf8"));
    assert.equal(pkg.devDependencies["@biomejs/biome"], "2.6.8");
    assert.equal(config.$schema, "https://biomejs.dev/schemas/2.6.8/schema.json");
    assert.equal(config.linter.rules.preset, "recommended");
    assert.equal(Object.hasOwn(config.linter.rules, "recommended"), false);
  },
};
