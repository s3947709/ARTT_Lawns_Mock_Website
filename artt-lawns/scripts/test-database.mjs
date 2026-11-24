import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { openLeadsDatabase } from "../src/lib/leads-database.mjs";

const temporary = await mkdtemp(path.join(tmpdir(), "artt-db-test-"));
const legacy = path.join(temporary, "legacy");
process.env.QUOTE_STORAGE_DIR = legacy;
process.env.LEADS_DATABASE_PATH = path.join(temporary, "leads.sqlite");
let db;
try {
  await mkdir(legacy);
  const lead = { id: "12345678-1234-1234-1234-123456789abc", createdAt: "2026-01-01T00:00:00.000Z", name: "Test lead", email: "test@example.com", phone: "0400000000", suburb: "Test suburb", service: "Garden maintenance", message: "Example garden job", status: "Quoted", notes: "Existing private note" };
  const file = path.join(legacy, lead.id + ".json");
  await writeFile(file, JSON.stringify(lead));
  db = openLeadsDatabase();
  const imported = db.prepare("SELECT * FROM leads WHERE id = ?").get(lead.id);
  assert.equal(imported.notes, lead.notes);
  assert.equal(imported.status, "Quoted");
  db.prepare("UPDATE leads SET notes = ? WHERE id = ?").run("Saved in database", lead.id);
  db.close(); db = undefined;
  db = openLeadsDatabase();
  assert.equal(db.prepare("SELECT COUNT(*) AS total FROM leads").get().total, 1);
  assert.equal(db.prepare("SELECT notes FROM leads WHERE id = ?").get(lead.id).notes, "Saved in database");
  assert.deepEqual(JSON.parse(await readFile(file, "utf8")), lead);
  assert.equal(db.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  console.log("Database checks passed: legacy import, no duplicates, reopen persistence, original preservation and integrity.");
} finally {
  db?.close();
  assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
  assert.ok(path.basename(temporary).startsWith("artt-db-test-"));
  await rm(temporary, { recursive: true, force: true });
}
