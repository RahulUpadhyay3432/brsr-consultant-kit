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
}
interface ContactRow {
  id: string; name: string | null; email: string; token: string; status: string;
  brsr_request_items?: ItemRow[];
}
interface CampaignRow {
  id: string; client_name: string; deadline: string | null; created_at: string;
  brsr_contacts?: ContactRow[];
}

function mapItem(r: ItemRow): Item {
  return {
    id: r.id, fieldId: r.field_id, label: r.field_label, unit: r.field_unit,
    kind: (r.field_kind === "activity" ? "activity" : "value"),
    category: r.field_category, value: r.value,
    status: (r.status === "received" ? "received" : "pending"),
  };
}
function mapContact(r: ContactRow): Contact {
  return {
    id: r.id, name: r.name, email: r.email, token: r.token,
    status: (["partial", "received"].includes(r.status) ? (r.status as Contact["status"]) : "pending"),
    items: (r.brsr_request_items ?? []).map(mapItem),
  };
}
function mapCampaign(r: CampaignRow): Campaign {
  return {
    id: r.id, clientName: r.client_name, deadline: r.deadline, createdAt: r.created_at,
    contacts: (r.brsr_contacts ?? []).map(mapContact),
  };
}

const SELECT = "*,brsr_contacts(*,brsr_request_items(*))";

// ─── Queries ────────────────────────────────────────────────────────────────
export async function createCampaign(clientName: string, deadline: string | null): Promise<string> {
  const res = await rest("brsr_requests", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({ client_name: clientName, deadline }),
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
    body: JSON.stringify({ request_id: campaignId, name: name || null, email, token, status: "pending" }),
  });
  const [contact] = (await res.json()) as ContactRow[];

  const items = fields.map((f) => ({
    contact_id: contact.id,
    field_id: f.id, field_label: f.label, field_unit: f.unit ?? null,
    field_kind: f.kind, field_category: f.category, status: "pending",
  }));
  if (items.length) {
    await rest("brsr_request_items", { method: "POST", body: JSON.stringify(items) });
  }
}

// For the recipient page — contact + items + the parent client name/deadline.
export async function getContactByToken(
  token: string
): Promise<{ contact: Contact; clientName: string; deadline: string | null } | null> {
  const res = await rest(
    `brsr_contacts?token=eq.${encodeURIComponent(token)}&select=*,brsr_request_items(*),brsr_requests(client_name,deadline)`
  );
  const rows = (await res.json()) as (ContactRow & { brsr_requests: { client_name: string; deadline: string | null } })[];
  if (!rows[0]) return null;
  return {
    contact: mapContact(rows[0]),
    clientName: rows[0].brsr_requests?.client_name ?? "",
    deadline: rows[0].brsr_requests?.deadline ?? null,
  };
}

export async function updateItem(itemId: string, value: string): Promise<void> {
  await rest(`brsr_request_items?id=eq.${encodeURIComponent(itemId)}`, {
    method: "PATCH",
    body: JSON.stringify({ value, status: "received" }),
  });
}

export async function setContactStatus(contactId: string, status: Contact["status"]): Promise<void> {
  await rest(`brsr_contacts?id=eq.${encodeURIComponent(contactId)}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
