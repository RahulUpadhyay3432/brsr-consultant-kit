import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findOrgByPasscode, findOrgBySlug } from "./db";
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

// The firm that owns the campaigns created before the firm tier existed, and
// the one the original CONSULTANT_PASSCODE signs in to. Matches the slug seeded
// by docs/migrations/001-firm-tier-orgs.sql.
const DEFAULT_ORG_SLUG = "saaksh";

// Memoised for the lifetime of one request. The Collect layout and the page it
// wraps both need the firm, and so does every server action, so without this a
// single render costs two or more Supabase round trips just to resolve who is
// signed in. React's cache() dedupes per request, not across requests, so a
// passcode change still takes effect on the next one.
const resolve = cache(async (): Promise<{ org: Org } | { error: OrgError }> => {
  const passcode = cookies().get(AUTH_COOKIE)?.value;
  if (!passcode) return { error: "anonymous" };

  // 1. A real firm. Scoped to its own clients.
  const row = await findOrgByPasscode(passcode);
  if (row) return { org: { ...row, legacy: false } };

  // 2. Configured as a firm in env but with no brsr_orgs row, so there is no
  //    org id to scope by. Falling through to unscoped here would show this
  //    firm every other firm's clients, so refuse instead.
  if (orgFromEnvPasscode(passcode)) return { error: "missing-org-row" };

  // 3. The original single passcode. It has no row of its own — the secret
  //    stays in the environment — so resolve the default firm by slug and scope
  //    to it. Before the migration there is no such row, and we fall back to
  //    unscoped, which is exactly the old single-tenant behaviour.
  const single = process.env.CONSULTANT_PASSCODE;
  if (single && passcode === single) {
    const home = await findOrgBySlug(DEFAULT_ORG_SLUG);
    if (home) return { org: { ...home, legacy: false } };
    return { org: { id: null, slug: DEFAULT_ORG_SLUG, name: "My practice", legacy: true } };
  }

  return { error: "unknown-passcode" };
});

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
