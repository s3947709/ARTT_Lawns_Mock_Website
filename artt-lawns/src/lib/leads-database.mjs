import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export function openLeadsDatabase() {
  const filename = process.env.LEADS_DATABASE_PATH || path.join(process.cwd(), "data", "leads.sqlite");
  mkdirSync(/* turbopackIgnore: true */ path.dirname(filename), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(filename);
  try {
    db.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS leads (
        id TEXT PRIMARY KEY,
        createdAt TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        suburb TEXT NOT NULL,
        service TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'New'
          CHECK (status IN ('New', 'Contacted', 'Quoted', 'Completed', 'Archived')),
        notes TEXT NOT NULL DEFAULT '',
        updatedAt TEXT NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS leads_created_at ON leads(createdAt DESC);
      CREATE INDEX IF NOT EXISTS leads_status ON leads(status);
      CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY) STRICT;
    `);
    if (!db.prepare("SELECT name FROM migrations WHERE name = ?").get("legacy-json-v1")) {
      const legacy = process.env.QUOTE_STORAGE_DIR || path.join(process.cwd(), "data", "quotes");
      let names = [];
      try { names = readdirSync(/* turbopackIgnore: true */ legacy); }
      catch (error) { if (error.code !== "ENOENT") throw error; }
      db.exec("BEGIN IMMEDIATE");
      try {
        const insert = db.prepare("INSERT INTO leads (id, createdAt, name, email, phone, suburb, service, message, status, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING");
        for (const name of names.filter(name => /^[a-f0-9-]+\.json$/.test(name))) {
          const lead = JSON.parse(readFileSync(/* turbopackIgnore: true */ path.join(/* turbopackIgnore: true */ legacy, name), "utf8"));
          for (const field of ["id", "createdAt", "name", "email", "phone", "suburb", "service", "message"]) {
            if (typeof lead[field] !== "string") throw new Error("Legacy enquiry has missing fields; migration cancelled.");
          }
          insert.run(lead.id, lead.createdAt, lead.name, lead.email, lead.phone, lead.suburb, lead.service, lead.message, lead.status || "New", lead.notes || "", lead.updatedAt || lead.createdAt);
        }
        db.prepare("INSERT INTO migrations (name) VALUES (?)").run("legacy-json-v1");
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
    }
    return db;
  } catch (error) { db.close(); throw error; }
}

let connection;
export function leadsDatabase() {
  connection ??= openLeadsDatabase();
  return connection;
}
