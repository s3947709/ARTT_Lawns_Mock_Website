import "server-only";
import { randomUUID } from "node:crypto";
import { leadsDatabase } from "./leads-database.mjs";

export type Quote = {
  id: string; createdAt: string; name: string; email: string; phone: string;
  suburb: string; service: string; message: string;
  status?: string; notes?: string; updatedAt?: string;
};

export async function saveQuote(details: Omit<Quote, "id" | "createdAt">) {
  const id = randomUUID();
  const now = new Date().toISOString();
  leadsDatabase().prepare(
    "INSERT INTO leads (id, createdAt, name, email, phone, suburb, service, message, status, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New', '', ?)",
  ).run(id, now, details.name, details.email, details.phone, details.suburb, details.service, details.message, now);
  return id;
}

export async function listQuotes(): Promise<Quote[]> {
  return leadsDatabase().prepare("SELECT * FROM leads ORDER BY createdAt DESC").all() as unknown as Quote[];
}

export async function updateQuote(id: string, status: string, notes: string) {
  if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("Invalid ID");
  const db = leadsDatabase();
  const result = db.prepare("UPDATE leads SET status = ?, notes = ?, updatedAt = ? WHERE id = ?")
    .run(status, notes, new Date().toISOString(), id);
  if (Number(result.changes) === 0) {
    const error = new Error("Enquiry not found") as NodeJS.ErrnoException;
    error.code = "ENOENT";
    throw error;
  }
  return db.prepare("SELECT * FROM leads WHERE id = ?").get(id) as unknown as Quote;
}
