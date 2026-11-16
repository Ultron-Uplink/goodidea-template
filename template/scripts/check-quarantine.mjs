// Quarantine rules (ledger H2): max 3 entries, each with reason/issue/owner, expiry within 14 days and not past.
import { readFileSync } from "node:fs";
const text = readFileSync("quarantine.yml", "utf8");
if (/^entries:\s*\[\]\s*$/m.test(text)) { console.log("quarantine: empty"); process.exit(0); }
const blocks = text.split(/^\s*-\s+test:/m).slice(1);
const errs = [];
if (blocks.length > 3) errs.push(`${blocks.length} entries open; maximum is 3`);
const today = new Date(); today.setHours(0, 0, 0, 0);
blocks.forEach((b, i) => {
  for (const k of ["reason", "issue", "owner", "expires"]) if (!new RegExp(`^\\s*${k}:\\s*\\S`, "m").test(b)) errs.push(`entry ${i + 1}: missing ${k}`);
  const m = b.match(/expires:\s*(\d{4}-\d{2}-\d{2})/);
  if (m) {
    const d = new Date(m[1]);
    if (d < today) errs.push(`entry ${i + 1}: expired ${m[1]}`);
    if ((d - today) / 86400000 > 14) errs.push(`entry ${i + 1}: expiry more than 14 days out`);
  }
});
if (errs.length) { console.error("quarantine: " + errs.join("; ")); process.exit(1); }
console.log("quarantine: ok");
