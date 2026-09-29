import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_DEV, SESSION_COOKIE_SECURE } from "@/lib/auth/cookie";

/**
 * Optimistic admin guard (SPEC §43). Only checks that a session cookie exists and redirects to
 * the login page otherwise — the real session + role verification happens server-side in every
 * admin page and Server Action (lib/auth/session.ts). Also keeps /admin out of search indexes.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === "/admin/login";
  const hasSession = request.cookies.has(SESSION_COOKIE_SECURE) || request.cookies.has(SESSION_COOKIE_DEV);

  if (!isLogin && !hasSession) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    const res = NextResponse.redirect(url);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }

  const res = NextResponse.next();
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "private, no-store");
  return res;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
