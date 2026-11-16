import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const good = () => ({
  prd: { requirements: [
      { id: "FR-1", text: "A user can record an idea by voice.", provenance: "stated", acceptance: ["Recording saves"] },
      { id: "FR-2", text: "Ideas are listed newest first.", provenance: "assumed", assumptionId: "A1", acceptance: ["Order is newest first"] } ],
    assumptions: [{ id: "A1", text: "Users want a list view", rank: 1 }],
    riskiest: { assumption: "People will speak ideas aloud", killCriterion: "Fewer than 3 of 10 testers record twice" } },
  issues: [
    { title: "Walking skeleton: deploy and /version", milestone: "m0", area: "infra", frs: ["FR-1"], acceptance: ["/version shows the SHA"] },
    { title: "Record and save an idea", milestone: "m1", area: "client", frs: ["FR-1", "FR-2"], acceptance: ["Idea appears in the list"] } ] });

export default { id: "generator-contract", description: "The generator contract accepts good output and rejects each known-bad shape",
  async run(ctx) {
    const check = (mut) => { const g = good(); mut?.(g); const d = mkdtempSync(join(tmpdir(), "gen-"));
      writeFileSync(join(d, "prd.json"), JSON.stringify(g.prd)); writeFileSync(join(d, "issues.json"), JSON.stringify(g.issues));
      return ctx.exec(`node scripts/validate-generated.mjs ${d}`, ctx.root).code; };
    if (check() !== 0) throw new Error("valid content rejected");
    const bad = {
      "uncovered requirement": (g) => g.issues.pop() && g.issues.push({ title: "m1 only", milestone: "m1", area: "client", frs: ["FR-1"], acceptance: ["x"] }),
      "eight assumptions": (g) => { g.prd.assumptions = Array.from({ length: 8 }, (_, i) => ({ id: `A${i + 1}`, text: "t", rank: i + 1 })); },
      "assumed without assumption": (g) => { delete g.prd.requirements[1].assumptionId; },
      "missing riskiest slice": (g) => { g.issues[1].milestone = "m2"; },
      "missing kill criterion": (g) => { delete g.prd.riskiest.killCriterion; },
      "unknown FR in issue": (g) => { g.issues[0].frs = ["FR-99"]; },
    };
    for (const [name, mut] of Object.entries(bad)) if (check(mut) === 0) throw new Error(`accepted: ${name}`);
  } };
