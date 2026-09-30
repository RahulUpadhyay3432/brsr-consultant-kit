import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findOrgByPasscode } from "./db";
import { orgFromEnvPasscode } from "./passcodes";

// Which firm the signed-in consultant belongs to.
//
// Collect began single-tenant: one CONSULTANT_PASSCODE, and every campaign was
// visible to anyone who signed in. The firm tier adds real separation — a
// passcode that matches a brsr_orgs row scopes the session to that firm's
// clients — while leaving the original passcode working untouched.
//
// Two sources, deliberately:
//   · CONSULTANT_PASSCODES (env) is the fast path middleware can check in the
//     edge runtime with no database round trip. It gates entry.
//   · brsr_orgs (table) carries the org id that every campaign query filters
//     on. It is what actually isolates one firm's data from another's.
//
// So adding a firm means BOTH: a line in CONSULTANT_PASSCODES and a row in
// brsr_orgs (docs/migrations/001-firm-tier-orgs.sql shows the insert). If only
// the env line exists we fail closed rather than fall back to showing that
// session everything — see resolve() below.
export interface Org {
  /** brsr_orgs.id — campaign queries filter on this. null means unscoped. */
  id: string | null;
  slug: string;
  name: string;
  /** true on the original single passcode, before any firm exists */
  legacy: boolean;
}

/** Why a session could not be resolved to a firm. */
export type OrgError = "anonymous" | "unknown-passcode" | "missing-org-row";

// Cookie name is shared with auth.ts and middleware.ts — keep all three in sync.
const AUTH_COOKIE = "bk_auth";

async function resolve(): Promise<{ org: Org } | { error: OrgError }> {
  const passcode = cookies().get(AUTH_COOKIE)?.value;
  if (!passcode) return { error: "anonymous" };

  // 1. A real firm. Scoped to its own clients.
  const row = await findOrgByPasscode(passcode);
  if (row) return { org: { ...row, legacy: false } };

  // 2. Configured as a firm in env but with no brsr_orgs row, so there is no
  //    org id to scope by. Falling through to unscoped here would show this
  //    firm every other firm's clients, so refuse instead.
  if (orgFromEnvPasscode(passcode)) return { error: "missing-org-row" };

  // 3. The original single passcode, with no firms set up at all. Unchanged
  //    single-tenant behaviour: unscoped, because there is nothing to separate.
  const single = process.env.CONSULTANT_PASSCODE;
  if (single && passcode === single) {
    return { org: { id: null, slug: "saaksh", name: "My practice", legacy: true } };
  }

  return { error: "unknown-passcode" };
}

/** The firm for this request, or null when it cannot be resolved. */
export async function currentOrg(): Promise<Org | null> {
  const r = await resolve();
  return "org" in r ? r.org : null;
}

// currentOrg() or bounce to sign-in. Every server component and server action
// under /requests calls this and passes org.id into the db helpers.
export async function requireOrg(): Promise<Org> {
  const r = await resolve();
  if ("org" in r) return r.org;
  // A firm that exists in env but not in the table is a setup mistake, not a
  // failed login; say so rather than silently looping the sign-in page.
  redirect(r.error === "missing-org-row" ? "/login?error=setup" : "/login");
}
