// Supabase data access for the data-request feature, via the PostgREST REST API
// using the service_role key (server-only; bypasses RLS). No SDK dependency.
//
// Tables: brsr_requests (campaign) → brsr_contacts (owner) → brsr_request_items.
import "server-only";
import type { Campaign, Contact, Item } from "./types";
import type { RequestField } from "./types";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function assertEnv(): { url: string; key: string } {
  if (!URL || !KEY) {
    throw new Error("Supabase env not set — add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local");
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
  field_section?: string | null; field_principle?: string | null; field_indicator_type?: string | null;
  evidence_path?: string | null; evidence_name?: string | null;
}
interface ContactRow {
  id: string; name: string | null; email: string; token: string; status: string;
  last_emailed_at?: string | null; reminders_sent?: number | null;
  brsr_request_items?: ItemRow[];
}
interface CampaignRow {
  id: string; client_name: string; reporting_period: string | null; deadline: string | null; created_at: string;
  brsr_contacts?: ContactRow[];
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
    status: (r.status === "received" ? "received" : "pending"),
    evidencePath: r.evidence_path ?? null,
    evidenceName: r.evidence_name ?? null,
  };
}
function mapContact(r: ContactRow): Contact {
  return {
    id: r.id, name: r.name, email: r.email, token: r.token,
    status: (["partial", "received"].includes(r.status) ? (r.status as Contact["status"]) : "pending"),
    lastEmailedAt: r.last_emailed_at ?? null,
    remindersSent: r.reminders_sent ?? 0,
    items: (r.brsr_request_items ?? []).map(mapItem),
  };
}
function mapCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id, clientName: r.client_name, reportingPeriod: r.reporting_period ?? null,
    deadline: r.deadline, createdAt: r.created_at,
    contacts: (r.brsr_contacts ?? []).map(mapContact),
  };
}

const SELECT = "*,brsr_contacts(*,brsr_request_items(*))";

// ─── Queries ────────────────────────────────────────────────────────────────
export async function createCampaign(
  clientName: string, deadline: string | null, reportingPeriod: string | null
): Promise<string> {
  const res = await rest("brsr_requests", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ client_name: clientName, deadline, reporting_period: reportingPeriod }),
  });
  const [row] = (await res.json()) as CampaignRow[];
  return row.id;
}

export async function listCampaigns(): Promise<Campaign[]> {
  const res = await rest(`brsr_requests?select=${SELECT}&order=created_at.desc`);
  return ((await res.json()) as CampaignRow[]).map(mapCampaign);
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const res = await rest(`brsr_requests?id=eq.${encodeURIComponent(id)}&select=${SELECT}`);
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

// For the recipient page — contact + items + the parent client name/deadline.
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

export async function updateItem(itemId: string, value: string): Promise<void> {
  await rest(`brsr_request_items?id=eq.${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ value, status: "received" }),
  });
}

// Records the supporting document an owner attached. Independent of the value
// (status is untouched) — evidence can land with or without a number.
export async function setItemEvidence(itemId: string, path: string, name: string): Promise<void> {
  await rest(`brsr_request_items?id=eq.${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ evidence_path: path, evidence_name: name }),
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
