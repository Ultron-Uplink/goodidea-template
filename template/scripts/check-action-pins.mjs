// Reports workflow actions not pinned to a full commit SHA (supply chain, ledger G11).
// Warns by default; set STRICT=1 to fail. Fix with: npx pinact run
import { readdirSync, readFileSync, existsSync } from "node:fs";
const dir = ".github/workflows";
const loose = [];
if (existsSync(dir)) for (const f of readdirSync(dir)) {
  readFileSync(`${dir}/${f}`, "utf8").split("\n").forEach((line, i) => {
    const m = line.match(/uses:\s*([^\s#]+)@([^\s#]+)/);
    if (m && !m[1].startsWith("./") && !/^[0-9a-f]{40}$/.test(m[2])) loose.push(`${f}:${i + 1} ${m[1]}@${m[2]}`);
  });
}
if (loose.length) { console.warn("unpinned actions:\n- " + loose.join("\n- ")); if (process.env.STRICT === "1") process.exit(1); }
else console.log("action pins: ok");
