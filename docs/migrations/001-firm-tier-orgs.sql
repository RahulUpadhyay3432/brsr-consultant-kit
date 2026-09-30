-- 001 · Firm tier: per-firm isolation for Collect
--
-- Run this in the Supabase SQL editor (PostgREST can't do DDL).
-- Safe to run on a live database: every statement is additive and idempotent.
--
-- Before this migration Collect is single-tenant: one CONSULTANT_PASSCODE, and
-- listCampaigns() returned every campaign to whoever signed in. After it, each
-- firm gets a row in brsr_orgs with its own passcode, and every campaign query
-- is filtered by org_id. Code degrades gracefully either side of this, so
-- running it late breaks nothing.

-- ─── 1. The firms ───────────────────────────────────────────────────────────
create table if not exists brsr_orgs (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,          -- url-safe key, e.g. 'sage'
  name       text not null,                 -- display name, e.g. 'SAGE Sustainability'
  passcode   text not null unique,          -- this firm's sign-in passcode
  created_at timestamptz not null default now()
);

alter table brsr_orgs enable row level security;
-- No policies: only the server's service_role key touches this table.

-- ─── 2. Scope campaigns to a firm ───────────────────────────────────────────
alter table brsr_requests
  add column if not exists org_id uuid references brsr_orgs(id) on delete cascade;

create index if not exists brsr_requests_org_id_idx on brsr_requests (org_id);

-- ─── 3. Seed ────────────────────────────────────────────────────────────────
-- A home for the campaigns that already exist. Its passcode is the one you are
-- using today, so your current sign-in keeps working unchanged.
-- Replace 'CHANGE_ME' with the current value of CONSULTANT_PASSCODE.
insert into brsr_orgs (slug, name, passcode)
values ('saaksh', 'Saaksh', 'CHANGE_ME')
on conflict (slug) do nothing;

-- Adopt every pre-existing campaign into that firm.
update brsr_requests
   set org_id = (select id from brsr_orgs where slug = 'saaksh')
 where org_id is null;

-- ─── 4. Add a firm ──────────────────────────────────────────────────────────
-- One row per firm. Give each its own passcode; they see only their own clients.
--   insert into brsr_orgs (slug, name, passcode)
--   values ('sage', 'SAGE Sustainability', 'a-long-random-passcode');

-- ─── Rollback ───────────────────────────────────────────────────────────────
--   alter table brsr_requests drop column if exists org_id;
--   drop table if exists brsr_orgs;
