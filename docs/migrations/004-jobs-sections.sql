-- 004 · brsr_jobs.sections
--
-- Structured job descriptions (headings + bullet lists) for scraped roles.
-- src/lib/jobs/db.ts already reads this column and degrades to `undefined` when
-- it is absent (`Array.isArray(r.sections) && r.sections.length ? … : undefined`),
-- so the jobs board rendered the plain-text description until this ran.
--
-- Applied 2026-10-02. Additive and idempotent; no backfill — existing rows keep
-- NULL and fall back to the unstructured description, and the scraper populates
-- it going forward.
alter table brsr_jobs
  add column if not exists sections jsonb;

-- ─── Rollback ───────────────────────────────────────────────────────────────
--   alter table brsr_jobs drop column if exists sections;
