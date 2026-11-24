import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const storage = await mkdtemp(path.join(tmpdir(), "artt-quote-test-"));
const token = randomBytes(32).toString("hex");
const port = 3400 + Math.floor(Math.random() * 1000);
const origin = "http://localhost:" + port;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-p", String(port)], {
  env: { ...process.env, ADMIN_QUOTE_TOKEN: token, QUOTE_STORAGE_DIR: path.join(storage, "legacy"), LEADS_DATABASE_PATH: path.join(storage, "leads.sqlite") }, stdio: "ignore",
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch {}
    await delay(500);
  }
  assert.ok(ready, "Test server started");
  const post = (body, source = origin) => fetch(origin + "/api/quotes", {
    method: "POST", headers: { "Content-Type": "application/json", Origin: source },
    body: JSON.stringify(body),
  });
  assert.equal((await fetch(origin + "/api/quotes")).status, 401);
  assert.equal((await post({})).status, 400);
  const details = { name: "Test Customer", email: "test@example.com", phone: "0400000000", suburb: "Test suburb", service: "Garden maintenance", message: "Test garden maintenance enquiry.", consent: true, website: "" };
  assert.equal((await post(details, "https://different.example")).status, 403);
  assert.equal((await post({ ...details, consent: false })).status, 400);
  assert.equal((await post({ ...details, website: "spam" })).status, 200);
  assert.equal((await readdir(storage)).length, 0, "Spam and invalid requests aren't stored");
  const saved = await post(details);
  assert.equal(saved.status, 201);
  const id = (await saved.json()).id;
  const response = await fetch(origin + "/api/quotes", { headers: { Authorization: "Bearer " + token } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const { quotes } = await response.json();
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].id, id);
  assert.equal(quotes[0].email, details.email);
  assert.ok((await readdir(storage)).includes("leads.sqlite"), "Request stored in SQLite");
  const login = (key) => fetch(origin + "/api/admin/session", { method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
  assert.equal((await login("incorrect")).status, 401);
  const signedIn = await login(token);
  assert.equal(signedIn.status, 200);
  const setCookie = signedIn.headers.get("set-cookie");
  assert.ok(setCookie.includes("HttpOnly"));
  assert.ok(setCookie.includes("SameSite=Strict"));
  const cookie = setCookie.split(";")[0];
  const cookieQuotes = await fetch(origin + "/api/quotes", { headers: { Cookie: cookie } });
  assert.equal(cookieQuotes.status, 200);
  const update = (cookieValue, source = origin, status = "Contacted") => fetch(origin + "/api/admin/quotes/" + id, {
    method: "PATCH", headers: { Cookie: cookieValue, Origin: source, "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes: "Customer prefers an afternoon call." }),
  });
  assert.equal((await update("")).status, 401);
  assert.equal((await update(cookie, "https://different.example")).status, 403);
  assert.equal((await update(cookie, origin, "Invalid")).status, 400);
  assert.equal((await update(cookie)).status, 200);
  const updated = await (await fetch(origin + "/api/quotes", { headers: { Cookie: cookie } })).json();
  assert.equal(updated.quotes[0].status, "Contacted");
  assert.equal(updated.quotes[0].notes, "Customer prefers an afternoon call.");
  const logout = await fetch(origin + "/api/admin/session", { method: "DELETE", headers: { Cookie: cookie, Origin: origin } });
  assert.equal(logout.status, 200);
  assert.ok(logout.headers.get("set-cookie").includes("Max-Age=0"));
  assert.equal((await fetch(origin + "/api/quotes", { headers: { Cookie: cookie } })).status, 401);
  console.log("Quote and admin checks passed: submission, validation, authorization, cookie sign-in, protected updates, persistent notes/status and sign-out.");
} finally {
  server.kill();
  await new Promise(resolve => { if (server.exitCode !== null) resolve(); else server.once("exit", resolve); });
  assert.equal(path.dirname(path.resolve(storage)), path.resolve(tmpdir()));
  assert.ok(path.basename(storage).startsWith("artt-quote-test-"));
  await rm(storage, { recursive: true, force: true });
}
