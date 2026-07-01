// The third-party services Saaksh relies on. Surfaced publicly on /privacy and
// /security, a published sub-processor list is a table-stakes B2B trust signal.
// Keep this current whenever a service is added or removed.

export interface SubProcessor {
  name: string;
  purpose: string;
  data: string;
  region: string;
}

export const SUBPROCESSORS: SubProcessor[] = [
  {
    name: "Vercel",
    purpose: "Application hosting & delivery",
    data: "Request logs; no client report data (the free tool runs on-device)",
    region: "USA",
  },
  {
    name: "Supabase",
    purpose: "Database & file storage for the Collect (Pro) tier",
    data: "Data-owner names/emails, submitted BRSR values, uploaded evidence files",
    region: "USA",
  },
  {
    name: "Resend",
    purpose: "Transactional email (Collect requests, reminders, alerts)",
    data: "Recipient name & email, request content",
    region: "USA",
  },
  {
    name: "Groq",
    purpose: "AI inference for grounded narrative drafts & document extraction (Pro)",
    data: "Text extracted from documents you upload in the Pro tier (no client data from the free tool)",
    region: "USA",
  },
  {
    name: "Google (Gemini API)",
    purpose: "AI inference for document auto-fill (Pro)",
    data: "Text extracted from documents you upload in the Pro tier",
    region: "USA",
  },
  {
    name: "Mixpanel",
    purpose: "Product analytics, only with your consent",
    data: "Anonymous usage events (industry, sector, counts); no client values",
    region: "USA",
  },
  {
    name: "Google Analytics",
    purpose: "Web analytics, only with your consent",
    data: "Anonymous page-level usage",
    region: "USA",
  },
];
