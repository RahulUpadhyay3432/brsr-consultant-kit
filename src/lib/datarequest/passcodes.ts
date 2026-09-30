// Firm passcodes that can be resolved WITHOUT touching the database.
//
// Why this exists: middleware.ts runs in the edge runtime on every /requests
// request and must decide, cheaply and synchronously, whether a session cookie
// is a real passcode. A Supabase round trip there would be slow and fragile, so
// the gate compares against this env-derived allowlist instead. brsr_orgs stays
// the richer source of truth (org ids, used to scope queries); this is the
// fast-path copy that auth can check on its own.
//
// CONSULTANT_PASSCODES holds one firm per line (semicolons also work), each as
//   slug|Display Name|passcode
// e.g.
//   sage|SAGE Sustainability|a-long-random-passcode
//   acme|Acme ESG Advisors|another-long-passcode
//
// The original single CONSULTANT_PASSCODE keeps working on its own, so this can
// stay unset until there is a second firm.

export interface EnvOrg {
  slug: string;
  name: string;
}

function parse(raw: string): Map<string, EnvOrg> {
  const out = new Map<string, EnvOrg>();
  for (const line of raw.split(/[\n;]+/)) {
    const parts = line.split("|").map((p) => p.trim());
    if (parts.length < 3) continue; // blank or malformed line, skip
    const [slug, name, passcode] = parts;
    if (!slug || !passcode) continue;
    out.set(passcode, { slug, name: name || slug });
  }
  return out;
}

// Parsed once per process. The env var never changes at runtime.
let cache: Map<string, EnvOrg> | null = null;

function registry(): Map<string, EnvOrg> {
  if (!cache) cache = parse(process.env.CONSULTANT_PASSCODES || "");
  return cache;
}

// The firm this passcode belongs to, from the env allowlist only.
export function orgFromEnvPasscode(passcode: string): EnvOrg | null {
  if (!passcode) return null;
  return registry().get(passcode) ?? null;
}

// Is this a passcode we accept at all? Checks the per-firm allowlist and the
// original single passcode. Used by middleware as the edge gate, so it stays
// synchronous and dependency-free.
export function isKnownPasscode(passcode: string | undefined): boolean {
  if (!passcode) return false;
  if (registry().has(passcode)) return true;
  const single = process.env.CONSULTANT_PASSCODE;
  return Boolean(single) && passcode === single;
}
