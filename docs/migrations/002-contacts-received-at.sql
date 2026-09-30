-- 002 · brsr_contacts.received_at
--
-- Carried in CLAUDE.md's pending-TODO list for several sessions. The app already
-- reads this column best-effort (mapContact in db.ts does `r.received_at ?? null`),
-- so until it exists the owner card can show a sent date but never a received
-- date. Additive, idempotent, and nothing needs backfilling: the column is
-- populated going forward by markReceived().
alter table brsr_contacts
  add column if not exists received_at timestamptz;

-- ─── Rollback ───────────────────────────────────────────────────────────────
--   alter table brsr_contacts drop column if exists received_at;
