import { openLeadsDatabase } from "../src/lib/leads-database.mjs";

// Fictional enquiries. Stable IDs make reruns safe and preserve admin edits.
const samples = [
  ["Alex", "New", "Lawn maintenance", "Sample suburb A", "Front and back lawns need mowing. Approximately 150 square metres, with access through a side gate.", ""],
  ["Morgan", "New", "Garden maintenance", "Sample suburb B", "Looking for help tidying two garden beds and removing weeds around the path.", ""],
  ["Jamie", "Contacted", "Other / not sure", "Sample suburb C", "The garden has become overgrown. Would like advice on an initial tidy-up and ongoing care.", "DEMO: Initial discussion completed. Awaiting garden photos."],
  ["Taylor", "Quoted", "Lawn maintenance", "Sample suburb D", "Interested in regular maintenance for a small lawn. Please discuss suitable visit frequency.", "DEMO: Prospective quote prepared; awaiting customer response."],
  ["Casey", "Completed", "Garden maintenance", "Sample suburb E", "One-off garden bed tidy-up before a family gathering.", "DEMO: Example completed enquiry."],
  ["Riley", "Archived", "Other / not sure", "Sample suburb F", "Enquiring about maintenance for a rental property between tenancies.", "DEMO: Customer no longer requires the work."],
];
const db = openLeadsDatabase();
try {
  db.exec("BEGIN IMMEDIATE");
  const insert = db.prepare("INSERT INTO leads (id, createdAt, name, email, phone, suburb, service, message, status, notes, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING");
  let inserted = 0;
  for (const [index, [name, status, service, suburb, message, notes]] of samples.entries()) {
    const date = new Date(Date.now() - index * 86400000).toISOString();
    const result = insert.run(
      "de000000-0000-4000-8000-" + String(index + 1).padStart(12, "0"),
      date, "[DEMO] " + name, "demo." + name.toLowerCase() + "@example.com",
      "Not provided (demo)", suburb, service, "[FICTIONAL SAMPLE] " + message,
      status, notes || "DEMO DATA: Not a real customer. Do not contact.", date,
    );
    inserted += Number(result.changes);
  }
  db.exec("COMMIT");
  const ids = samples.map((_, index) => "de000000-0000-4000-8000-" + String(index + 1).padStart(12, "0"));
  const present = ids.filter(id => db.prepare("SELECT id FROM leads WHERE id = ?").get(id)).length;
  console.log("Added " + inserted + " fictional enquiries. Verified " + present + " sample records. Existing enquiries and admin edits preserved.");
} catch (error) {
  db.exec("ROLLBACK");
  throw error;
} finally { db.close(); }
