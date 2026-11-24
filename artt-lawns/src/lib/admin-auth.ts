import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const sessionCookie = "artt_admin";
const revoked = new Map<string, number>();
export function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}
export function matchesKey(value: string) {
  const key = process.env.ADMIN_QUOTE_TOKEN;
  return Boolean(key && key.length >= 32 && Buffer.byteLength(value) === Buffer.byteLength(key) && timingSafeEqual(Buffer.from(value), Buffer.from(key)));
}
function sign(value: string) {
  return createHmac("sha256", process.env.ADMIN_QUOTE_TOKEN || "").update("admin-session:" + value).digest("hex");
}
export function createSession() {
  const value = Date.now() + 8 * 60 * 60 * 1000 + "." + randomBytes(24).toString("hex");
  return value + "." + sign(value);
}
export function getSession(request: Request) {
  return request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(sessionCookie + "="))?.slice(sessionCookie.length + 1) || "";
}
export function authorized(request: Request) {
  // Keep the existing server-side access-key API compatible.
  if (matchesKey(request.headers.get("authorization")?.replace(/^Bearer /, "") || "")) return true;
  const session = getSession(request);
  const [expiry, nonce, signature] = session.split(".");
  if (!process.env.ADMIN_QUOTE_TOKEN || process.env.ADMIN_QUOTE_TOKEN.length < 32 ||
      !expiry || !/^[a-f0-9]{48}$/.test(nonce || "") || !/^[a-f0-9]{64}$/.test(signature || "") || !/^\d+$/.test(expiry) || Number(expiry) <= Date.now() || revoked.has(session)) return false;
  const expected = sign(expiry + "." + nonce);
  return signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
export function revokeSession(request: Request) {
  const session = getSession(request);
  for (const [key, expiry] of revoked) if (expiry < Date.now()) revoked.delete(key);
  if (session) revoked.set(session, Number(session.split(".")[0]));
}
export function cookie(value: string, request: Request, clear = false) {
  return sessionCookie + "=" + value + "; HttpOnly; SameSite=Strict; Path=/; Max-Age=" + (clear ? 0 : 28800) +
    (new URL(request.url).protocol === "https:" ? "; Secure" : "");
}

