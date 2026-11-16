import { writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
export default { id: "renderer", description: "Missing or invalid values must fail rendering",
  async run(ctx) { const dir = mkdtempSync(join(tmpdir(), "bad-"));
    const vals = join(dir, "v.json"); writeFileSync(vals, JSON.stringify({ project_name: "X", project_slug: "Not Kebab", owner: "o", owner_login: "o", mission: "m" }));
    const r = ctx.exec(`node scripts/render.mjs --values ${vals} --out ${join(dir, "out")}`, ctx.root);
    if (r.code === 0) throw new Error("renderer accepted an invalid slug");
    writeFileSync(vals, JSON.stringify({ project_name: "X", project_slug: "x", owner: "o", owner_login: "o", mission: 'He said "hi"' }));
    const q = ctx.exec(`node scripts/render.mjs --values ${vals} --out ${join(dir, "out2")}`, ctx.root);
    if (q.code === 0) throw new Error("renderer accepted a mission with quotes"); } };
