import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protects the consultant area only. The free tool (/) and recipient links
// (/submit/*) stay public, recipients must never be asked to log in.
const AUTH_COOKIE = "bk_auth";

export function middleware(req: NextRequest) {
  const expected = process.env.CONSULTANT_PASSCODE;
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;

  if (!expected || cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/requests", "/requests/:path*"],
};
