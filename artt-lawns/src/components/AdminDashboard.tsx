"use client";
import { useEffect, useState, type FormEvent } from "react";
type Quote = { id: string; createdAt: string; name: string; email: string; phone: string; suburb: string; service: string; message: string; status?: string; notes?: string };
const statuses = ["New", "Contacted", "Quoted", "Completed", "Archived"];
function Enquiry({ quote, onSaved, onExpired }: { quote: Quote; onSaved: (quote: Quote) => void; onExpired: () => void }) {
  const [status, setStatus] = useState(quote.status || "New");
  const [notes, setNotes] = useState(quote.notes || "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event: FormEvent) {
    event.preventDefault(); setPending(true); setMessage("");
    try {
      const response = await fetch("/api/admin/quotes/" + quote.id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, notes }) });
      if (response.status === 401) { onExpired(); return; }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      onSaved(data.quote); setMessage("Changes saved.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save."); }
    finally { setPending(false); }
  }
  return <article className="admin-enquiry">
    <header><div><h2>{quote.name}</h2><p>{new Date(quote.createdAt).toLocaleString("en-AU", { timeZone: "Australia/Sydney" })} (Sydney)</p></div><span className="admin-badge">{quote.status || "New"}</span></header>
    <dl><dt>Email</dt><dd><a href={"mailto:" + quote.email}>{quote.email}</a></dd><dt>Phone</dt><dd><a href={"tel:" + quote.phone.replace(/[^+0-9]/g, "")}>{quote.phone}</a></dd><dt>Location</dt><dd>{quote.suburb}</dd><dt>Service</dt><dd>{quote.service}</dd></dl>
    <p className="admin-job-message">{quote.message}</p>
    <form className="quote-form" onSubmit={save}><label>Status<select value={status} onChange={event => setStatus(event.target.value)}>{statuses.map(value => <option key={value}>{value}</option>)}</select></label>
      <label>Private admin notes<textarea rows={3} maxLength={5000} value={notes} onChange={event => setNotes(event.target.value)} /></label>
      <button className="garden-button" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button><p role="status">{message}</p>
    </form>
  </article>;
}
export default function AdminDashboard() {
  const [quotes, setQuotes] = useState<Quote[] | null>(null);
  const [key, setKey] = useState("");
  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  function expired() { setQuotes(null); setError("Your session ended. Please sign in again."); }
  async function load() {
    const response = await fetch("/api/quotes", { cache: "no-store" });
    if (response.status === 401) { setQuotes(null); return; }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    setQuotes(data.quotes);
  }
  useEffect(() => { load().catch(() => setError("Unable to load enquiries.")).finally(() => setPending(false)); }, []);
  async function login(event: FormEvent) {
    event.preventDefault(); setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setKey(""); await load();
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign in."); }
    finally { setPending(false); }
  }
  async function logout() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/admin/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to sign out. Try again.");
      setQuotes(null); setKey(""); setSearch(""); setFilter("All");
    } catch (error) { setError(error instanceof Error ? error.message : "Unable to sign out."); }
    finally { setPending(false); }
  }
  const visible = quotes?.filter(quote => (filter === "All" || (quote.status || "New") === filter) && [quote.name, quote.email, quote.phone, quote.suburb, quote.service, quote.message].join(" ").toLowerCase().includes(search.toLowerCase()));
  return <section className="admin-dashboard">
    <div className="admin-heading"><div><p className="garden-eyebrow">ARTT administration</p><h1>Enquiry dashboard</h1><p>Manage quote requests and keep track of customer follow-ups.</p></div>{quotes && <button className="garden-button" disabled={pending} onClick={logout}>Sign out</button>}</div>
    {error && <p className="quote-error" role="alert">{error}</p>}
    {!quotes ? <form className="quote-form admin-login" onSubmit={login}><h2>Admin sign in</h2><p>Use the private admin access key configured for this site.</p><label>Access key<input type="password" required autoComplete="current-password" value={key} onChange={event => setKey(event.target.value)} /></label><button className="garden-button" disabled={pending}>{pending ? "Please wait…" : "Sign in"}</button></form> : <>
      <div className="admin-summary">{["All", "New", "Contacted", "Quoted", "Completed", "Archived"].map(status => <button key={status} aria-pressed={filter === status} onClick={() => setFilter(status)}><strong>{status === "All" ? quotes.length : quotes.filter(q => (q.status || "New") === status).length}</strong>{status === "All" ? "Total enquiries" : status}</button>)}</div>
      <div className="admin-tools"><label>Search enquiries<input type="search" placeholder="Name, email, suburb or job…" value={search} onChange={event => setSearch(event.target.value)} /></label><button disabled={pending} onClick={async () => { setPending(true); setError(""); try { await load(); } catch { setError("Unable to refresh enquiries."); } finally { setPending(false); } }}>{pending ? "Refreshing…" : "Refresh"}</button></div>
      <p role="status">{visible?.length} matching enquiry/enquiries</p>
      {visible?.length === 0 && <p className="admin-empty">{quotes.length ? "No enquiries match your search or status filter." : "No quote requests yet. New homepage submissions will appear here."}</p>}
      {visible?.map(quote => <Enquiry key={quote.id} quote={quote} onExpired={expired} onSaved={updated => setQuotes(current => current?.map(item => item.id === updated.id ? updated : item) || null)} />)}
    </>}
  </section>;
}

