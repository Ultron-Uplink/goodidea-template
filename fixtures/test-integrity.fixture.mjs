import { rmSync, writeFileSync } from "node:fs";
export default { id: "v3-test-integrity", description: "A deleted acceptance test still listed in the manifest must fail",
  async run(ctx) { const d = ctx.render();
    writeFileSync(`${d}/tests/acceptance/manifest.json`, JSON.stringify({ tests: { "fr1.test.ts": { fr: "FR-1", status: "enforced" } } }));
    const r = ctx.exec("node scripts/check-acceptance-manifest.mjs", d); if (r.code === 0) throw new Error("manifest accepted a missing test file"); } };
