// Supabase data access for the data-request feature, via the PostgREST REST API
// using the service_role key (server-only; bypasses RLS). No SDK dependency.
//
// Tables: brsr_requests (campaign) → brsr_contacts (owner) → brsr_request_items.
import "server-only";
import type { Campaign, Contact, Item, CompanyContact, ValueSource } from "./types";
import type { RequestField } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(): { url: string; key: string } {
  if (!URL || !KEY) {
    throw new Error("Supabase env not set, add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local");
  }
  return { url: URL, key: KEY };
}

async function rest(path: string, init?: RequestInit & { prefer?: string }): Promise<Response> {
  const { url, key } = assertEnv();
  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
  if (init?.prefer) headers["Prefer"] = init.prefer;
  const res = await fetch(`${url}/rest/v1/${path}`, { ...init, headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Supabase ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return res;
}

// ─── Row shapes (snake_case from Postgres) ──────────────────────────────────
interface ItemRow {
  id: string; field_id: string; field_label: string; field_unit: string | null;
  field_kind: string; field_category: string | null; value: string | null; status: string;
  prior_value?: string | null;
  field_section?: string | null; field_principle?: string | null; field_indicator_type?: string | null;
  evidence_path?: string | null; evidence_name?: string | null;
  value_source?: string | null;
}
interface ContactRow {
  id: string; name: string | null; email: string; token: string; status: string;
  last_emailed_at?: string | null; reminders_sent?: number | null;
  received_at?: string | null;
  brsr_request_items?: ItemRow[];
}
interface CampaignRow {
  id: string; client_name: string; reporting_period: string | null; deadline: string | null; created_at: string;
  narrative?: Record<string, string> | null;
  brsr_contacts?: ContactRow[];
}

// Provenance of a value, read best-effort: the column only exists once migration
// 003 has run, and anything unrecognised is treated as unrecorded rather than
// guessed at.
function normSource(v: unknown): ValueSource {
  return v === "owner" || v === "import" ? v : null;
}

function mapItem(r: ItemRow): Item {
  const it = r.field_indicator_type;
  return {
    id: r.id, fieldId: r.field_id, label: r.field_label, unit: r.field_unit,
    kind: (r.field_kind === "activity" ? "activity" : "value"),
    category: r.field_category,
    section: (r.field_section === "A" || r.field_section === "B" || r.field_section === "C") ? r.field_section : null,
    principle: r.field_principle ?? null,
    indicatorType: (it === "essential" || it === "leadership") ? it : null,
    value: r.value,
    priorValue: r.prior_value ?? null,
    status: (r.status === "received" ? "received" : "pending"),
    evidencePath: r.evidence_path ?? null,
    evidenceName: r.evidence_name ?? null,
    valueSource: normSource(r.value_source),
  };
}
function mapContact(r: ContactRow): Contact {
  return {
    id: r.id, name: r.name, email: r.email, token: r.token,
    status: (["partial", "received"].includes(r.status) ? (r.status as Contact["status"]) : "pending"),
    lastEmailedAt: r.last_emailed_at ?? null,
    remindersSent: r.reminders_sent ?? 0,
    receivedAt: r.received_at ?? null,
    items: (r.brsr_request_items ?? []).map(mapItem),
  };
}
function mapCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id, clientName: r.client_name, reportingPeriod: r.reporting_period ?? null,
    deadline: r.deadline, createdAt: r.created_at,
    contacts: (r.brsr_contacts ?? []).map(mapContact),
    narrative: r.narrative ?? null, // present once the migration + generation have run
  };
}

const SELECT = "*,brsr_contacts(*,brsr_request_items(*))";

// ─── Orgs: the firm tier ────────────────────────────────────────────────────
// A firm (org) owns its campaigns. Every campaign query below is filtered by
// org_id so one firm can never see another's clients. Both halves of this
// degrade gracefully, because the migration (docs/migrations/001-firm-tier-orgs.sql)
// is run by hand and may not have happened yet:
//   · brsr_orgs missing        → findOrgByPasscode() returns null, and the caller
//                                falls back to the single CONSULTANT_PASSCODE gate.
//   · brsr_requests.org_id     → the scoped query 400s, we retry unscoped once and
//     missing                    remember it, i.e. the old single-tenant behaviour.

interface OrgRow { id: string; slug: string; name: string }
export interface OrgRecord { id: string; slug: string; name: string }

// The firm whose passcode this is, or null when unknown / pre-migration.
export async function findOrgByPasscode(passcode: string): Promise<OrgRecord | null> {
  if (!passcode) return null;
  try {
    const res = await rest(
      `brsr_orgs?passcode=eq.${encodeURIComponent(passcode)}&select=id,slug,name&limit=1`
    );
    const rows = (await res.json()) as OrgRow[];
    return rows[0] ?? null;
  } catch {
    return null; // table absent (pre-migration) or unreachable
  }
}

// The firm with this slug, or null when absent / pre-migration. Used for the
// default firm, which has no passcode of its own in the database: the original
// CONSULTANT_PASSCODE stays in the environment and resolves here by slug, so a
// live secret never has to be copied into a table.
export async function findOrgBySlug(slug: string): Promise<OrgRecord | null> {
  if (!slug) return null;
  try {
    const res = await rest(
      `brsr_orgs?slug=eq.${encodeURIComponent(slug)}&select=id,slug,name&limit=1`
    );
    const rows = (await res.json()) as OrgRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Set once we learn brsr_requests has no org_id column, so we only pay for the
// failed scoped request once per process rather than on every query.
let orgColumnMissing = false;

function isMissingOrgColumn(e: unknown): boolean {
  const m = e instanceof Error ? e.message : String(e);
  return m.includes("org_id") && (m.includes("42703") || m.includes("does not exist"));
}

// Runs a campaign query with the org filter applied, falling back to the
// unscoped query when the column isn't there yet. `build` receives the filter
// fragment to splice into its querystring ("" when unscoped).
async function restScoped(
  build: (orgFilter: string) => string,
  orgId: string | null,
  init?: RequestInit & { prefer?: string },
): Promise<Response> {
  if (!orgId || orgColumnMissing) return rest(build(""), init);
  try {
    return await rest(build(`&org_id=eq.${encodeURIComponent(orgId)}`), init);
  } catch (e) {
    if (!isMissingOrgColumn(e)) throw e;
    orgColumnMissing = true;
    return rest(build(""), init);
  }
}

// Throws unless this campaign belongs to this firm. Used by the mutating calls,
// which take an id the caller could otherwise have guessed. A no-op before the
// migration, when there are no orgs to separate.
async function assertOwned(id: string, orgId: string | null): Promise<void> {
  if (!orgId || orgColumnMissing) return;
  const res = await restScoped(
    (f) => `brsr_requests?id=eq.${encodeURIComponent(id)}${f}&select=id`,
    orgId,
  );
  const rows = (await res.json()) as { id: string }[];
  if (!rows[0]) throw new Error("Campaign not found for this firm");
}

// ─── Queries ────────────────────────────────────────────────────────────────
export async function createCampaign(
  clientName: string, deadline: string | null, reportingPeriod: string | null,
  orgId: string | null = null,
): Promise<string> {
  const insert: Record<string, unknown> = {
    client_name: clientName, deadline, reporting_period: reportingPeriod,
  };
  // Omitted pre-migration, when the column doesn't exist.
  if (orgId && !orgColumnMissing) insert.org_id = orgId;
  const res = await rest("brsr_requests", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify(insert),
  });
  const [row] = (await res.json()) as CampaignRow[];
  return row.id;
}

export async function listCampaigns(orgId: string | null = null): Promise<Campaign[]> {
  const res = await restScoped(
    (f) => `brsr_requests?select=${SELECT}${f}&order=created_at.desc`,
    orgId,
  );
  return ((await res.json()) as CampaignRow[]).map(mapCampaign);
}

export async function getCampaign(id: string, orgId: string | null = null): Promise<Campaign | null> {
  const res = await restScoped(
    (f) => `brsr_requests?id=eq.${encodeURIComponent(id)}${f}&select=${SELECT}`,
    orgId,
  );
  const rows = (await res.json()) as CampaignRow[];
  return rows[0] ? mapCampaign(rows[0]) : null;
}

export async function addContact(
  campaignId: string, name: string, email: string, token: string, fields: RequestField[]
): Promise<void> {
  const res = await rest("brsr_contacts", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      request_id: campaignId, name: name || null, email, token, status: "pending",
      last_emailed_at: new Date().toISOString(), // starts the reminder cadence clock
    }),
  });
  const [contact] = (await res.json()) as ContactRow[];

  const items = fields.map((f) => ({
    contact_id: contact.id,
    field_id: f.id, field_label: f.label, field_unit: f.unit ?? null,
    field_kind: f.kind, field_category: f.category ?? null,
    field_section: f.section, field_principle: f.principle, field_indicator_type: f.indicatorType,
    status: "pending",
  }));
  if (items.length) {
    await rest("brsr_request_items", { method: "POST", body: JSON.stringify(items) });
  }
}

// For the recipient page, contact + items + the parent client name/deadline.
export async function getContactByToken(
  token: string
): Promise<{ contact: Contact; clientName: string; reportingPeriod: string | null; deadline: string | null; campaignId: string } | null> {
  const res = await rest(
    `brsr_contacts?token=eq.${encodeURIComponent(token)}&select=*,brsr_request_items(*),brsr_requests(client_name,reporting_period,deadline)`
  );
  const rows = (await res.json()) as (ContactRow & { request_id: string; brsr_requests: { client_name: string; reporting_period: string | null; deadline: string | null } })[];
  if (!rows[0]) return null;
  return {
    contact: mapContact(rows[0]),
    clientName: rows[0].brsr_requests?.client_name ?? "",
    reportingPeriod: rows[0].brsr_requests?.reporting_period ?? null,
    deadline: rows[0].brsr_requests?.deadline ?? null,
    campaignId: rows[0].request_id,
  };
}

// Writes a value and marks the item received. `source` records WHERE the figure came
// from ("owner" = submitted through the owner's secure link, "import" = extracted from
// a document by the AI importer and accepted by the consultant), so the assurance
// ledger never attributes an AI-extracted number to a named person. If
// `value_source` does not exist yet (migration 003 not run), the write is retried
// without it, so the value still lands.
export async function updateItem(itemId: string, value: string, source?: ValueSource): Promise<void> {
  const path = `brsr_request_items?id=eq.${encodeURIComponent(itemId)}`;
  const base = { value, status: "received" };
  if (source) {
    try {
      await rest(path, { method: "PATCH", body: JSON.stringify({ ...base, value_source: source }) });
      return;
    } catch { /* column missing → fall through to the column-free write */ }
  }
  await rest(path, { method: "PATCH", body: JSON.stringify(base) });
}

// Prior-year figure, written separately from the value so it can be best-effort
// (the previous-FY column is supplementary to the reportable number).
export async function setItemPrior(itemId: string, priorValue: string): Promise<void> {
  await rest(`brsr_request_items?id=eq.${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ prior_value: priorValue }),
  });
}

// Records the supporting document an owner attached. Independent of the value
// (status is untouched), evidence can land with or without a number.
export async function setItemEvidence(itemId: string, path: string, name: string): Promise<void> {
  await rest(`brsr_request_items?id=eq.${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ evidence_path: path, evidence_name: name }),
  });
}

// Persists the AI-drafted per-principle narrative on the campaign. Caller wraps
// this best-effort: the `narrative jsonb` column may not exist until the user runs
// the migration, in which case the draft still shows the freshly-generated prose.
export async function setNarrative(
  campaignId: string, narrative: Record<string, string>, orgId: string | null = null,
): Promise<void> {
  await assertOwned(campaignId, orgId);
  await rest(`brsr_requests?id=eq.${encodeURIComponent(campaignId)}`, {
    method: "PATCH",
    body: JSON.stringify({ narrative }),
  });
}

export async function setContactStatus(contactId: string, status: Contact["status"]): Promise<void> {
  await rest(`brsr_contacts?id=eq.${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

// Records that a reminder was just sent: refresh the cadence clock + bump count.
export async function markReminded(contactId: string, remindersSent: number): Promise<void> {
  await rest(`brsr_contacts?id=eq.${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    body: JSON.stringify({ last_emailed_at: new Date().toISOString(), reminders_sent: remindersSent }),
  });
}

// Stamps when an owner's data was first received (best-effort; the received_at column
// is optional, caller wraps this so a missing column never fails the submission).
export async function markReceived(contactId: string): Promise<void> {
  await rest(`brsr_contacts?id=eq.${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    body: JSON.stringify({ received_at: new Date().toISOString() }),
  });
}

// Update a campaign's editable settings (deadline / reporting period). Columns already
// exist, no migration. Only the keys provided are written.
export async function updateCampaign(
  id: string,
  fields: { deadline?: string | null; reportingPeriod?: string | null },
  orgId: string | null = null,
): Promise<void> {
  await assertOwned(id, orgId);
  const body: Record<string, unknown> = {};
  if ("deadline" in fields) body.deadline = fields.deadline ?? null;
  if ("reportingPeriod" in fields) body.reporting_period = fields.reportingPeriod ?? null;
  if (Object.keys(body).length === 0) return;
  await rest(`brsr_requests?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

// ─── Bulk import: a synthetic per-campaign "Imported documents" contact ──────
// When an imported figure has no matching request item, we attach it to a single
// placeholder contact (one per campaign) so the value still lands in the campaign,
// the dashboard, the emissions calc and the draft. Created once and reused.
const IMPORT_EMAIL = "imported@saaksh.local";

// Returns the campaign's "Imported documents" contact, creating it if absent.
export async function getOrCreateImportContact(campaignId: string): Promise<string> {
  const existing = await rest(
    `brsr_contacts?request_id=eq.${encodeURIComponent(campaignId)}&email=eq.${encodeURIComponent(IMPORT_EMAIL)}&select=id`
  );
  const rows = (await existing.json()) as { id: string }[];
  if (rows[0]) return rows[0].id;

  const res = await rest("brsr_contacts", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      request_id: campaignId, name: "Imported documents", email: IMPORT_EMAIL,
      token: randomToken(), status: "received",
    }),
  });
  const [contact] = (await res.json()) as ContactRow[];
  return contact.id;
}

// Inserts a single already-valued item under a contact (used by bulk import).
// Writes the value + status 'received' + the field's BRSR coordinates.
export async function addItemWithValue(
  contactId: string, field: RequestField, value: string, source?: ValueSource
): Promise<void> {
  const row: Record<string, unknown> = {
    contact_id: contactId,
    field_id: field.id, field_label: field.label, field_unit: field.unit ?? null,
    field_kind: field.kind, field_category: field.category ?? null,
    field_section: field.section, field_principle: field.principle, field_indicator_type: field.indicatorType,
    value, status: "received",
  };
  if (source) {
    try {
      await rest("brsr_request_items", {
        method: "POST",
        body: JSON.stringify([{ ...row, value_source: source }]),
      });
      return;
    } catch { /* column missing → fall through to the column-free insert */ }
  }
  await rest("brsr_request_items", { method: "POST", body: JSON.stringify([row]) });
}

// A reasonably-unguessable token for a synthetic contact (the link is never sent,
// but the column is non-null). Crypto-free so db.ts keeps no extra imports.
function randomToken(): string {
  return `import-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Company contacts, the per-client saved roster (brsr_company_contacts) ──
// A reusable directory of people, scoped to a campaign. Created by the user's SQL
// migration; everything here is best-effort so Collect keeps working before then.
interface CompanyContactRow {
  id: string; name: string | null; email: string; role: string | null; created_at: string;
}
function mapCompanyContact(r: CompanyContactRow): CompanyContact {
  return { id: r.id, name: r.name, email: r.email, role: r.role ?? null, createdAt: r.created_at };
}

// Returns [] if the table doesn't exist yet (pre-migration) or on any error, so a
// missing directory never 500s the campaign page.
export async function listCompanyContacts(campaignId: string): Promise<CompanyContact[]> {
  try {
    const res = await rest(`brsr_company_contacts?request_id=eq.${encodeURIComponent(campaignId)}&select=*&order=created_at.asc`);
    return ((await res.json()) as CompanyContactRow[]).map(mapCompanyContact);
  } catch {
    return [];
  }
}

// Upsert (de-dupes on (request_id, email) via the unique index). Caller wraps best-effort.
export async function upsertCompanyContacts(
  campaignId: string, rows: { name: string | null; email: string; role: string | null }[]
): Promise<void> {
  if (!rows.length) return;
  const body = rows.map((r) => ({ request_id: campaignId, name: r.name, email: r.email, role: r.role }));
  await rest("brsr_company_contacts?on_conflict=request_id,email", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: JSON.stringify(body),
  });
}

export async function deleteCompanyContact(id: string): Promise<void> {
  await rest(`brsr_company_contacts?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ─── Marketing capture: newsletter subscribers + Pro-access requests ─────────
// Both tables are created by the user's SQL migration; every caller wraps these
// best-effort so the public forms keep working (and fall back to an email) before
// the migration is run. RLS-locked; only the server's service_role writes.

// Adds a newsletter subscriber. Idempotent: a re-subscribe of the same email is
// ignored (the email column is UNIQUE) rather than erroring.
export async function addSubscriber(email: string, source: string): Promise<void> {
  await rest("brsr_subscribers?on_conflict=email", {
    method: "POST",
    prefer: "resolution=ignore-duplicates",
    body: JSON.stringify({ email: email.toLowerCase(), source: source || null }),
  });
}

// Records a "Request Pro access" lead from the on-site form.
export async function addAccessRequest(req: {
  name: string; organisation: string; email: string; clients: string; message: string;
}): Promise<void> {
  await rest("brsr_access_requests", {
    method: "POST",
    body: JSON.stringify({
      name: req.name || null,
      organisation: req.organisation || null,
      email: req.email.toLowerCase(),
      clients: req.clients || null,
      message: req.message || null,
    }),
  });
}

// True if a Pro-access request from this email was recorded since `sinceIso`.
// Lets the public action dedupe repeat submissions (and suppress the founder
// email) without a schema change. Values are encodeURIComponent'd like every
// other filter in this file.
export async function recentAccessRequestExists(email: string, sinceIso: string): Promise<boolean> {
  const res = await rest(
    `brsr_access_requests?email=eq.${encodeURIComponent(email.toLowerCase())}` +
    `&created_at=gt.${encodeURIComponent(sinceIso)}&select=id&limit=1`
  );
  const rows = (await res.json()) as unknown[];
  return Array.isArray(rows) && rows.length > 0;
}

// ─── Delete an entire campaign + all its children ───────────────────────────
// Done in FK-safe order with explicit DELETEs (so it works whether or not the
// child FKs are ON DELETE CASCADE, no migration required): the items under the
// campaign's contacts → the contacts → the saved-contacts directory → the
// campaign row. The directory delete is best-effort (the table may not exist yet).
export async function deleteCampaign(id: string, orgId: string | null = null): Promise<void> {
  // 0. Refuse outright if this campaign isn't this firm's.
  await assertOwned(id, orgId);

  // 1. Collect the campaign's contact ids so their items can be cleared first.
  const cres = await rest(`brsr_contacts?request_id=eq.${encodeURIComponent(id)}&select=id`);
  const contactIds = ((await cres.json()) as { id: string }[]).map((r) => r.id);

  // 2. Delete the items belonging to those contacts.
  if (contactIds.length) {
    const inList = contactIds.map((c) => encodeURIComponent(c)).join(",");
    await rest(`brsr_request_items?contact_id=in.(${inList})`, { method: "DELETE" });
  }

  // 3. Delete the contacts (data owners + any synthetic "Imported documents" contact).
  await rest(`brsr_contacts?request_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });

  // 4. Delete the saved-contacts directory (best-effort, table optional pre-migration).
  try {
    await rest(`brsr_company_contacts?request_id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
  } catch { /* directory table absent, ignore */ }

  // 5. Delete the campaign row itself.
  await rest(`brsr_requests?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" });
}
