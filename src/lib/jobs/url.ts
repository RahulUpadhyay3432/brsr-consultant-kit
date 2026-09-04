// Canonical identity for a job's apply link.
//
// Job boards append the role's POSITION IN THE LISTING to its detail URL
// (iimjobs: `?ref=kp_br&jobPos=14`). That number changes every time the board
// reorders, so the same posting arrives with a different URL on each scrape and
// slips past any dedup keyed on the raw URL — in September 2026 this had stored
// one role nine separate times, and 67 of 107 stored rows were duplicates.
//
// Stripping the volatile params gives a posting one stable identity. Real query
// params that actually address the job (Indeed's `?jk=…`) are deliberately kept.
//
// `scripts/scrape-jobs.mjs` mirrors this function — it runs as a standalone node
// script in GitHub Actions and cannot import TypeScript. Keep the two in sync;
// the tests next to this file are the reference behaviour.
const TRACKING_PARAM = /^(jobpos|ref|src|source|position|fromjob|utm_[a-z]+)$/i;

export function canonicalUrl(u: string | null | undefined): string {
  try {
    const url = new URL(String(u ?? "").trim());
    url.hash = "";
    // Collect first, then delete: mutating the params while iterating them skips
    // entries. `forEach` rather than spreading `.keys()`, which the build target
    // rejects without downlevelIteration.
    const drop: string[] = [];
    url.searchParams.forEach((_value, key) => {
      if (TRACKING_PARAM.test(key)) drop.push(key);
    });
    drop.forEach((key) => url.searchParams.delete(key));
    url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    // Not a parseable URL (the extractor occasionally emits a truncated one).
    // Return it unchanged so the caller still has a stable key to dedup on.
    return String(u ?? "").trim();
  }
}
