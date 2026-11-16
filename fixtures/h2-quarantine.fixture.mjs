import { writeFileSync } from "node:fs";
export default { id: "H2", description: "Expired, over-long or incomplete quarantine entries must fail",
  async run(ctx) {
    const d = ctx.render();
    const bad = (y) => { writeFileSync(`${d}/quarantine.yml`, y); return ctx.exec("node scripts/check-quarantine.mjs", d).code; };
    if (bad("entries:\n  - test: a\n    reason: r\n    issue: 1\n    owner: o\n    expires: 2020-01-01\n") === 0) throw new Error("expired entry accepted");
    const far = new Date(Date.now() + 40 * 86400000).toISOString().slice(0, 10);
    if (bad(`entries:\n  - test: a\n    reason: r\n    issue: 1\n    owner: o\n    expires: ${far}\n`) === 0) throw new Error("far-future expiry accepted");
    if (bad("entries:\n  - test: a\n    expires: 2099-01-01\n") === 0) throw new Error("incomplete entry accepted");
  } };
