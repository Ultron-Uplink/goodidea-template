import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export default { id: "ruleset-plan-limit", description: "private Free-plan rulesets are explicitly skipped; permission failures remain errors",
  async run(ctx) {
    const project = ctx.render();
    const receipt = join(project, "receipt.json");
    const status = join(project, "STATUS.md");
    const initial = readFileSync(status, "utf8");
    const upgrade = "Upgrade to GitHub Pro or make this repository public to enable this feature.";
    let mode = "list-limit", privateRepo = true, writes = 0;
    const server = createServer((req, res) => {
      req.resume(); req.on("end", () => {
        const send = (code, data) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(data)); };
        if (req.method === "PATCH" && req.url === "/repos/o/r") return send(200, { private: privateRepo });
        if (req.url.startsWith("/repos/o/r/labels")) return send(200, req.method === "GET" ? [] : {});
        if (req.url === "/repos/o/r/rulesets") {
          if (req.method !== "GET") writes++;
          if (mode === "permission") return send(403, { message: "Resource not accessible by integration" });
          if (mode === "server-error") return send(500, { message: upgrade });
          if (mode === "list-limit" || (mode === "write-limit" && req.method !== "GET")) return send(403, { message: upgrade });
          if (req.method === "GET") return send(200, []);
          return send(201, {});
        }
        send(404, { message: "unexpected request" });
      });
    });
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const run = (...extra) => new Promise((resolve, reject) => {
      const p = spawn(process.execPath, ["scripts/apply-settings.mjs", "o/r", "--receipt", receipt, "--status", status, ...extra], {
        cwd: ctx.root, env: { ...process.env, GITHUB_TOKEN: "fixture", GITHUB_API: `http://127.0.0.1:${server.address().port}` },
      });
      let out = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d));
      p.on("error", reject); p.on("close", (code) => resolve({ code, out }));
    });
    const assert = (ok, message) => { if (!ok) throw new Error(message); };
    try {
      for (mode of ["list-limit", "write-limit"]) {
        for (let i = 0; i < 2; i++) {
          const r = await run(); assert(r.code === 0, r.out);
          assert(JSON.parse(readFileSync(receipt, "utf8")).ruleset === "skipped: plan limit", "missing skip receipt");
          const text = readFileSync(status, "utf8");
          assert(text.includes("Branch protection: skipped: plan limit") && text.includes("owner must check CI"), "missing honest STATUS warning");
          assert(text.startsWith(initial.trimEnd()) && text.match(/Branch protection:/g).length === 1, "STATUS duplicated or handoff lost");
        }
        if (mode === "list-limit") assert(writes === 0, "attempted ruleset write after known plan limit");
      }
      for (mode of ["permission", "server-error"]) {
        writeFileSync(receipt, "unchanged");
        const before = readFileSync(status, "utf8");
        const r = await run(); assert(r.code !== 0, "non-plan error was swallowed");
        assert(readFileSync(receipt, "utf8") === "unchanged" && readFileSync(status, "utf8") === before, "failure reported success");
      }
      mode = "list-limit"; privateRepo = false;
      assert((await run()).code !== 0, "public repo error misclassified as private plan limit");
      privateRepo = true; mode = "success";
      assert((await run()).code === 0, "successful ruleset failed");
      assert(JSON.parse(readFileSync(receipt, "utf8")).ruleset === "created", "missing applied receipt");
      assert(!readFileSync(status, "utf8").includes("plan limit"), "stale skip after successful retry");
      const before = readFileSync(status, "utf8"), beforeReceipt = readFileSync(receipt, "utf8");
      assert((await run("--dry-run")).code === 0, "dry run failed");
      assert(readFileSync(status, "utf8") === before && readFileSync(receipt, "utf8") === beforeReceipt, "dry run wrote success evidence");
      assert(existsSync(status), "STATUS lost");
    } finally { server.close(); }
  } };
