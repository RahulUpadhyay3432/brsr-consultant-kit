-- 001 · Firm tier: per-firm isolation for Collect
--
-- Additive and idempotent; safe to re-run. Verified against the live schema
-- before first application (brsr_requests.id is uuid default gen_random_uuid(),
-- pgcrypto present, no org_id column, no brsr_orgs table).
--
-- Before this, Collect was single-tenant in a way that mattered: listCampaigns()
-- ran `select * from brsr_requests` with no WHERE clause and one shared
-- CONSULTANT_PASSCODE let in everyone, so any consultant who signed in saw every
-- other consultant's clients. After it, each firm owns its campaigns and every
-- campaign query is filtered by org_id.

-- ─── 1. The firms ───────────────────────────────────────────────────────────
-- passcode is NULLABLE on purpose. The default firm below signs in with the
-- original CONSULTANT_PASSCODE, which stays in the environment: a live secret
-- should not be copied into a table. org.ts resolves that firm by slug instead.
create table if not exists brsr_orgs (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,          -- url-safe key, e.g. 'sage'
  name       text not null,                 -- display name, e.g. 'SAGE Sustainability'
  passcode   text unique,                   -- this firm's own passcode, or null
  created_at timestamptz not null default now()
);

alter table brsr_orgs enable row level security;
-- No policies, matching every other brsr_ table: only the server's service_role
-- key touches this. RLS on with no policies means the anon key can read nothing.

-- ─── 2. Scope campaigns to a firm ───────────────────────────────────────────
-- Note: brsr_requests also has an older, unused `consultant_id` column (0 of 9
-- rows populated, referenced nowhere in the app). Left untouched — it is the
-- natural home for per-person attribution when seats land, which is a different
-- thing from firm isolation.
alter table brsr_requests
  add column if not exists org_id uuid references brsr_orgs(id) on delete cascade;

create index if not exists brsr_requests_org_id_idx on brsr_requests (org_id);

-- ─── 3. The default firm, and adopting what already exists ──────────────────
insert into brsr_orgs (slug, name, passcode)
values ('saaksh', 'Saaksh', null)
on conflict (slug) do nothing;

update brsr_requests
   set org_id = (select id from brsr_orgs where slug = 'saaksh')
 where org_id is null;

-- ─── 4. Adding a firm ───────────────────────────────────────────────────────
-- Two steps, and BOTH are needed:
--   a) the row here, which carries the org id that isolates its data:
--        insert into brsr_orgs (slug, name, passcode)
--        values ('sage', 'SAGE Sustainability', '<long-random-passcode>');
--   b) a matching line in the CONSULTANT_PASSCODES env var, which is what
--      middleware checks in the edge runtime without a database round trip:
--        sage|SAGE Sustainability|<the same long-random-passcode>
-- With only (b), requireOrg() fails closed and /login says the row is missing,
-- rather than falling through and showing that firm everyone else's clients.

-- ─── Rollback ───────────────────────────────────────────────────────────────
--   alter table brsr_requests drop column if exists org_id;
--   drop table if exists brsr_orgs;
