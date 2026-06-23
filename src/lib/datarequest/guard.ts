// Authenticate the consultant INSIDE each sensitive server action. Next.js server
// actions are dispatched by the `Next-Action` header and can be POSTed to ANY route,
// so the middleware path-matcher (which only covers /requests/*) is not sufficient on
// its own — a request to a public route like `/` could otherwise invoke a consultant
// action unauthenticated. Each consultant-only action calls requireConsultant() as a
// defence-in-depth layer on top of the middleware.
import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Keep in sync with the same literal in middleware.ts and auth.ts.
const AUTH_COOKIE = "bk_auth";

// Redirects to /login (throwing NEXT_REDIRECT, which aborts the action) when the
// request doesn't carry a valid passcode cookie. No-op when authenticated.
export function requireConsultant(): void {
  const expected = process.env.CONSULTANT_PASSCODE;
  const cookie = cookies().get(AUTH_COOKIE)?.value;
  if (!expected || cookie !== expected) {
    redirect("/login");
  }
}
