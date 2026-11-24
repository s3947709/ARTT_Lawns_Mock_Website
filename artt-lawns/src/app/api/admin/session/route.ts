import { authorized, cookie, createSession, matchesKey, revokeSession, sameOrigin } from "@/lib/admin-auth";
const headers = { "Cache-Control": "no-store" };
let failures = 0;
let resetAt = Date.now() + 60000;
export async function GET(request: Request) {
  return Response.json({ authenticated: authorized(request) }, { status: authorized(request) ? 200 : 401, headers });
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
  if (Date.now() > resetAt) { failures = 0; resetAt = Date.now() + 60000; }
  if (failures >= 10) return Response.json({ error: "Too many attempts. Try again in a minute." }, { status: 429, headers });
  const text = await request.text();
  if (text.length > 1024) return Response.json({ error: "Invalid request." }, { status: 400, headers });
  let body;
  try { body = JSON.parse(text); } catch { return Response.json({ error: "Invalid request." }, { status: 400, headers }); }
  if (!body || typeof body.key !== "string" || !matchesKey(body.key)) {
    failures++;
    return Response.json({ error: "Incorrect access key, or admin access is not configured." }, { status: 401, headers });
  }
  return Response.json({ authenticated: true }, { headers: { ...headers, "Set-Cookie": cookie(createSession(), request) } });
}
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Invalid request origin." }, { status: 403, headers });
  revokeSession(request);
  return Response.json({ authenticated: false }, { headers: { ...headers, "Set-Cookie": cookie("", request, true) } });
}

