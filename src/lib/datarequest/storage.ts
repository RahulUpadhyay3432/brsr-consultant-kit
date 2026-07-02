// Supabase Storage access for evidence files (the bills / invoices / registers
// owners attach to back their figures). Server-only, via the Storage REST API
// with the service_role key, the bucket is PRIVATE, so recipients upload
// through our server action and the consultant views via short-lived signed URLs.
// No SDK dependency, mirroring db.ts.
import "server-only";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// A private bucket the user creates once in the Supabase dashboard.
export const EVIDENCE_BUCKET = "brsr-evidence";

// Bounds on what an owner can attach (token-gated path, but capped anyway).
export const MAX_EVIDENCE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EVIDENCE_TYPES = new Set<string>([
  "application/pdf",
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv", "text/plain",
]);

function env(): { url: string; key: string } {
  if (!URL || !KEY) throw new Error("Supabase env not set");
  return { url: URL, key: KEY };
}

// Keep object keys filesystem-safe and bounded; preserve the extension.
function sanitize(name: string): string {
  const cleaned = name.replace(/[^a-zA-Z0-9._-]/g, "_");
  return cleaned.length > 80 ? cleaned.slice(-80) : cleaned;
}

export interface UploadedEvidence { path: string; name: string }

// Uploads a recipient's file to the private bucket. Best-effort: returns null on
// any failure so a flaky upload never blocks the owner's number from saving.
export async function uploadEvidence(itemId: string, file: File): Promise<UploadedEvidence | null> {
  try {
    // Reject oversize files and disallowed / attacker-supplied MIME types before
    // touching storage. Silently returns null (best-effort), the owner's number
    // still saves, only the unsupported attachment is dropped.
    if (file.size > MAX_EVIDENCE_BYTES) return null;
    if (file.type && !ALLOWED_EVIDENCE_TYPES.has(file.type)) return null;
    const contentType = ALLOWED_EVIDENCE_TYPES.has(file.type) ? file.type : "application/octet-stream";

    const { url, key } = env();
    const clean = sanitize(file.name || "evidence");
    const path = `${itemId}/${clean}`;
    const bytes = Buffer.from(await file.arrayBuffer());
    const res = await fetch(`${url}/storage/v1/object/${EVIDENCE_BUCKET}/${path}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": contentType,
        "x-upsert": "true", // overwrite if the owner re-submits the same field
      },
      body: bytes,
      cache: "no-store",
    });
    if (!res.ok) return null;
    return { path, name: file.name || clean };
  } catch {
    return null;
  }
}

// A short-lived signed URL so the consultant can open a private file. Null on
// failure, the caller renders a non-link fallback.
export async function signedEvidenceUrl(path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { url, key } = env();
    const res = await fetch(`${url}/storage/v1/object/sign/${EVIDENCE_BUCKET}/${path}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { signedURL?: string };
    return data.signedURL ? `${url}/storage/v1${data.signedURL}` : null;
  } catch {
    return null;
  }
}

// Signs every evidence-bearing item in one pass → { itemId: signedUrl }.
export async function signCampaignEvidence(
  items: { id: string; evidencePath: string | null }[]
): Promise<Map<string, string>> {
  const withEvidence = items.filter((i) => i.evidencePath);
  const out = new Map<string, string>();
  await Promise.all(
    withEvidence.map(async (i) => {
      const u = await signedEvidenceUrl(i.evidencePath!);
      if (u) out.set(i.id, u);
    })
  );
  return out;
}
