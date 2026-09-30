// Authenticate the consultant INSIDE each sensitive server action. Next.js server
// actions are dispatched by the `Next-Action` header and can be POSTed to ANY route,
// so the middleware path-matcher (which only covers /requests/*) is not sufficient on
// its own, a request to a public route like `/` could otherwise invoke a consultant
// action unauthenticated. Each consultant-only action calls requireConsultant() as a
// defence-in-depth layer on top of the middleware.
import "server-only";
import { requireOrg, type Org } from "./org";

// Redirects to /login (throwing NEXT_REDIRECT, which aborts the action) when the
// request doesn't carry a passcode cookie belonging to a firm. On success it
// returns that firm, so the action can scope its queries: pass `org.id` into the
// db helpers and a consultant can only ever touch their own firm's campaigns.
export async function requireConsultant(): Promise<Org> {
  return requireOrg();
}
