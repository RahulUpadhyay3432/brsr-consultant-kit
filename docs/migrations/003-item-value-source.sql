-- 003 · brsr_request_items.value_source
--
-- Provenance for a collected figure. Found by the P0 audit (2026-09-30): when the
-- consultant accepts a suggestion from the AI document importer for a field that is
-- already assigned to a named data owner, applyBulkImportAction called
-- db.updateItem(), which wrote the value and flipped status to 'received' on THAT
-- OWNER'S item. The assurance ledger then emitted the AI-extracted figure under the
-- owner's name and email, in the one artifact built to be handed to an assurance
-- provider. Nothing in the schema could tell the two apart.
--
-- Values written by the app: 'owner' (a data owner submitted it through their secure
-- link) and 'import' (extracted from a document by the AI importer and accepted by
-- the consultant). NULL means unknown provenance.
--
-- The app reads this best-effort (mapItem does `r.value_source ?? null`) and the
-- write path retries without the column if it is absent, so the feature degrades
-- rather than breaking before this migration runs.
--
-- ⚠️ No backfill is possible or attempted. Rows written before this migration
-- carry NULL, and the ledger renders NULL as "Not recorded" rather than claiming
-- they were owner-submitted — because any value applied through the importer
-- before this fix is indistinguishable from an owner submission in the old data.
alter table brsr_request_items
  add column if not exists value_source text;

-- ─── Rollback ───────────────────────────────────────────────────────────────
--   alter table brsr_request_items drop column if exists value_source;
