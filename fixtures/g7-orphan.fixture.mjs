import { writeFileSync } from "node:fs";
export default { id: "G7/H8", description: "A stray top-level file must fail verify",
  async run(ctx) { const d = ctx.render(); writeFileSync(`${d}/FINAL_REPORT.md`, "x");
    const r = ctx.exec("node scripts/check-orphans.mjs", d); if (r.code === 0) throw new Error("orphan check passed with a stray file"); } };
