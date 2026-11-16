import { createServer } from "node:http";
import { spawn } from "node:child_process";

export default { id: "settings-idempotent", description: "apply-settings twice creates things once, then only updates",
  async run(ctx) {
    const labels = new Map(); const rulesets = []; const log = [];
    const server = createServer((req, res) => { let body = ""; req.on("data", (c) => (body += c)); req.on("end", () => {
      const json = body ? JSON.parse(body) : null; log.push(`${req.method} ${req.url.split("?")[0]}`);
      const send = (c, o) => { res.writeHead(c, { "content-type": "application/json" }); res.end(JSON.stringify(o)); };
      if (req.method === "PATCH" && req.url === "/repos/o/r") return send(200, {});
      if (req.method === "GET" && req.url.startsWith("/repos/o/r/labels")) return send(200, [...labels.values()]);
      if (req.method === "POST" && req.url === "/repos/o/r/labels") { labels.set(json.name, json); return send(201, json); }
      if (req.method === "PATCH" && req.url.startsWith("/repos/o/r/labels/")) return send(200, {});
      if (req.method === "GET" && req.url === "/repos/o/r/rulesets") return send(200, rulesets);
      if (req.method === "POST" && req.url === "/repos/o/r/rulesets") { rulesets.push({ id: 7, name: json.name }); return send(201, {}); }
      if (req.method === "PUT" && req.url === "/repos/o/r/rulesets/7") return send(200, {});
      send(404, { message: "unexpected " + req.method + " " + req.url }); }); });
    await new Promise((r) => server.listen(0, r));
    const port = server.address().port;
    const run = () => new Promise((resolve) => { const p = spawn("node", ["scripts/apply-settings.mjs", "o/r"], { cwd: ctx.root, env: { ...process.env, GITHUB_TOKEN: "t", GITHUB_API: `http://127.0.0.1:${port}` } });
      let out = ""; p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (out += d)); p.on("close", (code) => resolve({ code, out })); });
    try {
      const a = await run(); if (a.code !== 0) throw new Error("first run failed: " + a.out);
      const mark = log.length;
      const b = await run(); if (b.code !== 0) throw new Error("second run failed: " + b.out);
      const second = log.slice(mark);
      if (second.some((l) => l.startsWith("POST"))) throw new Error("second run created things again: " + second.filter((l) => l.startsWith("POST")).join(", "));
      if (!second.includes("PUT /repos/o/r/rulesets/7")) throw new Error("second run did not update the ruleset");
    } finally { server.close(); }
  } };
