"use client";
import { useState, type FormEvent } from "react";

export default function QuoteForm() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true); setError(""); setSuccess("");
    try {
      const response = await fetch("/api/quotes", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(data), consent: data.get("consent") === "on" }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Please try again.");
      setSuccess(result.message); form.reset();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally { setPending(false); }
  }
  return <section id="get-a-quote" className="quote-section" aria-labelledby="quote-title">
    <div className="quote-heading">
      <p className="garden-eyebrow">Tell us what you need</p>
      <h2 id="quote-title">Get a Quote</h2>
      <p>Leave your details and a little about the job. The team can contact you to discuss your garden and prepare a prospective quote.</p>
      <p className="quote-note">Submitting a request does not confirm a booking or a price. All fields are required.</p>
    </div>
    <form className="quote-form" onSubmit={submit} aria-busy={pending}>
      <fieldset disabled={pending}>
        <div className="quote-fields">
          <label>Full name<input name="name" autoComplete="name" required minLength={2} maxLength={100} /></label>
          <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
          <label>Phone number<input name="phone" type="tel" autoComplete="tel" required pattern="[+0-9 ().\\-]{6,30}" maxLength={30} /></label>
          <label>Suburb / postcode<input name="suburb" autoComplete="address-level2" required minLength={2} maxLength={100} /></label>
          <label className="quote-wide">Service required<select name="service" required defaultValue=""><option value="" disabled>Select a service</option><option>Lawn maintenance</option><option>Garden maintenance</option><option>Other / not sure</option></select></label>
          <label className="quote-wide">Tell us about the job<textarea name="message" rows={4} required minLength={10} maxLength={2000} placeholder="What needs doing? Include the approximate size and whether you need ongoing maintenance." /></label>
        </div>
        <label className="quote-trap" aria-hidden="true">Leave this empty<input name="website" tabIndex={-1} autoComplete="off" /></label>
        <label className="quote-consent"><input name="consent" type="checkbox" required /><span>I agree to ARTT using these details to contact me about this quote request.</span></label>
        <button className="garden-button" type="submit">{pending ? "Sending request…" : "Send quote request"}</button>
      </fieldset>
      <div aria-live="polite">{success && <p className="quote-success" role="status">{success}</p>}</div>
      {error && <p className="quote-error" role="alert">{error}</p>}
    </form>
  </section>;
}

