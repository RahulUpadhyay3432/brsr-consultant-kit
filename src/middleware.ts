import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isKnownPasscode } from "@/lib/datarequest/passcodes";

// Protects the consultant area only. The free tool (/) and recipient links
// (/submit/*) stay public, recipients must never be asked to log in.
const AUTH_COOKIE = "bk_auth";

// Still a real passcode comparison, just against every firm's passcode rather
// than a single one (see lib/datarequest/passcodes.ts). Fails closed exactly as
// before: no cookie, an unknown cookie, or no passcode configured at all all
// redirect to /login.
export function middleware(req: NextRequest) {
  const cookie = req.cookies.get(AUTH_COOKIE)?.value;

  if (!isKnownPasscode(cookie)) {
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
