import { authorized } from "@/lib/admin-auth";
import { listQuotes, saveQuote } from "@/lib/quotes";

const headers = { "Cache-Control": "no-store" };
export async function POST(request: Request) {
  if (!process.env.ADMIN_QUOTE_TOKEN || process.env.ADMIN_QUOTE_TOKEN.length < 32)
    return Response.json({ error: "Quote requests are not available yet. Please try again later." }, { status: 503, headers });
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json({ error: "Please submit the form from this website." }, { status: 403, headers });
  if (Number(request.headers.get("content-length")) > 16000)
    return Response.json({ error: "Your request is too large." }, { status: 413, headers });
  let body;
  try {
    const text = await request.text();
    if (text.length > 16000) return Response.json({ error: "Your request is too large." }, { status: 413, headers });
    body = JSON.parse(text);
  } catch { return Response.json({ error: "Invalid request." }, { status: 400, headers }); }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return Response.json({ error: "Invalid request." }, { status: 400, headers });
  if (body.website) return Response.json({ message: "Request received." }, { headers });
  const fields = ["name", "email", "phone", "suburb", "service", "message"] as const;
  const details = Object.fromEntries(fields.map(key => [key, typeof body[key] === "string" ? body[key].trim() : ""])) as Record<typeof fields[number], string>;
  if (details.name.length < 2 || details.name.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email) || details.email.length > 254 ||
      !/^[+\d\s().-]{6,30}$/.test(details.phone) ||
      details.suburb.length < 2 || details.suburb.length > 100 ||
      !["Lawn maintenance", "Garden maintenance", "Other / not sure"].includes(details.service) ||
      details.message.length < 10 || details.message.length > 2000 || body.consent !== true)
    return Response.json({ error: "Please check all fields and agree to be contacted about your quote." }, { status: 400, headers });
  try {
    const id = await saveQuote(details);
    return Response.json({ id, message: "Thanks! Your request has been saved for the team to review and contact you about a quote." }, { status: 201, headers });
  } catch {
    return Response.json({ error: "We couldn't save your request. Please try again." }, { status: 503, headers });
  }
}

export async function GET(request: Request) {
  if (!authorized(request))
    return Response.json({ error: "Admin access key is incorrect or not configured." }, { status: 401, headers });
  try { return Response.json({ quotes: await listQuotes() }, { headers }); }
  catch { return Response.json({ error: "Unable to load quote requests." }, { status: 503, headers }); }
}

