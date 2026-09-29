// Session cookie names (shared by proxy.ts and the session module — no server-only imports).
// "__Host-" requires Secure + Path=/ + no Domain, so it's only used in production over HTTPS.

export const SESSION_COOKIE_SECURE = "__Host-jr_admin";
export const SESSION_COOKIE_DEV = "jr_admin";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function sessionCookieName(): string {
  return process.env.NODE_ENV === "production" ? SESSION_COOKIE_SECURE : SESSION_COOKIE_DEV;
}
