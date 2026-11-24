import { authorized, sameOrigin } from "@/lib/admin-auth";
import { updateQuote } from "@/lib/quotes";
const headers = { "Cache-Control": "no-store" };
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return Response.json({ error: "Please sign in again." }, { status: 401, headers });
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id)) return Response.json({ error: "Invalid request ID." }, { status: 400, headers });
  const text = await request.text();
  if (text.length > 12000) return Response.json({ error: "Notes are too long." }, { status: 400, headers });
  let body;
  try { body = JSON.parse(text); } catch { return Response.json({ error: "Invalid request." }, { status: 400, headers }); }
  if (!body || !["New", "Contacted", "Quoted", "Completed", "Archived"].includes(body.status) ||
      typeof body.notes !== "string" || body.notes.length > 5000)
    return Response.json({ error: "Select a valid status and keep notes under 5,000 characters." }, { status: 400, headers });
  try {
    const quote = await updateQuote(id, body.status, body.notes);
    return Response.json({ quote }, { headers });
  } catch (error) {
    const missing = (error as NodeJS.ErrnoException).code === "ENOENT";
    return Response.json({ error: missing ? "Enquiry not found." : "Unable to save changes." }, { status: missing ? 404 : 503, headers });
  }
}

