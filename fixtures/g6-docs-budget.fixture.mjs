import { writeFileSync } from "node:fs";
export default { id: "G6/H9", description: "An oversized document must fail verify",
  async run(ctx) { const d = ctx.render(); writeFileSync(`${d}/docs/product/huge.md`, "x".repeat(25_000));
    const r = ctx.exec("node scripts/check-docs-budget.mjs", d); if (r.code === 0) throw new Error("docs budget passed with a 25 KB file"); } };
