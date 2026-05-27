/**
 * Prints tag, SHA-256 hash, and journal `when` for each migration SQL file.
 * Drizzle stores (hash, created_at=when) in drizzle.__drizzle_migrations — use for baselining.
 *
 * Usage: node scripts/print-drizzle-migration-hashes.cjs
 */
const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");

const root = process.cwd();
const journalPath = path.join(root, "drizzle/migrations/meta/_journal.json");
const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));

console.log("tag\thash\twhen");
for (const e of journal.entries) {
  const sqlPath = path.join(root, "drizzle/migrations", `${e.tag}.sql`);
  const q = fs.readFileSync(sqlPath, "utf8");
  const hash = crypto.createHash("sha256").update(q).digest("hex");
  console.log(`${e.tag}\t${hash}\t${e.when}`);
}
