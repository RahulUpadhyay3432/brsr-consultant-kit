// Domain types for the data-request feature.
// Model: a Campaign (one client) → many Contacts (data owners) → many Items
// (the data points each owner was asked for). Each contact has its own token/link.

// "value"    → the recipient enters the final reportable number directly.
// "activity" → raw activity data (diesel litres, kWh, …) that feeds the emission
//              calculators (CEA/IPCC) to produce the BRSR figure (see emissions.ts).
export type FieldKind = "value" | "activity";
export type FieldCategory = "Environment" | "Social" | "Governance";

export interface RequestField {
  id: string;            // e.g. "P6-E1-elec"
  label: string;
  unit?: string;
  category: FieldCategory;
  kind: FieldKind;
  hint?: string;         // who typically owns it
}

export interface Item {
  id: string;
  fieldId: string;
  label: string;
  unit: string | null;
  kind: FieldKind;
  category: string | null;
  value: string | null;
  status: "pending" | "received";
  // Supporting document the owner attached (the bill / invoice / register that
  // backs the figure) — for assurance-readiness. Null when none uploaded.
  evidencePath: string | null;   // private Storage object path (bucket-relative)
  evidenceName: string | null;   // original filename, shown to the consultant
}

export type ContactStatus = "pending" | "partial" | "received";

export interface Contact {
  id: string;
  name: string | null;
  email: string;
  token: string;         // unguessable; used in the recipient link
  status: ContactStatus;
  lastEmailedAt: string | null; // ISO; last email (initial or reminder) sent
  remindersSent: number;        // reminder emails sent (excludes the initial)
  items: Item[];
}

export interface Campaign {
  id: string;
  clientName: string;
  reportingPeriod: string | null; // the BRSR reporting year, e.g. "FY 2025-26"
  deadline: string | null; // ISO date (YYYY-MM-DD)
  createdAt: string;
  contacts: Contact[];
}
