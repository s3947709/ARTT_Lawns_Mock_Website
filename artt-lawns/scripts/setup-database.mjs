import { openLeadsDatabase } from "../src/lib/leads-database.mjs";
const db = openLeadsDatabase();
try {
  const { total } = db.prepare("SELECT COUNT(*) AS total FROM leads").get();
  console.log("Lead database ready. Stored leads: " + total + ". Legacy JSON files are preserved.");
} finally { db.close(); }
