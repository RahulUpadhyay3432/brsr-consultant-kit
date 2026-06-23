// Shared constants, helpers and types for the Action Plan checklist.
import bestPracticesData from "@/data/best_practices.json";

// Principle-level best practices (India + International), looked up by principle.
export const BEST_PRACTICES = (bestPracticesData as {
  best_practices: Record<string, { name: string; india: string[]; international: string[] }>;
}).best_practices;

// ─── Principle metadata ────────────────────────────────────────────────────────
export const PRINCIPLES: Record<string, { name: string; color: string; bg: string; border: string }> = {
  P1: { name: "Ethics & Transparency",   color: "text-violet-700", bg: "bg-violet-50",  border: "border-violet-200" },
  P2: { name: "Products & Services",     color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200"   },
  P3: { name: "Employee Wellbeing",      color: "text-sky-700",    bg: "bg-sky-50",     border: "border-sky-200"    },
  P4: { name: "Stakeholder Engagement",  color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200"   },
  P5: { name: "Human Rights",            color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200"   },
  P6: { name: "Environment",             color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200"},
  P7: { name: "Policy & Advocacy",       color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200"  },
  P8: { name: "Inclusive Growth",        color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" },
  P9: { name: "Consumer Responsibility", color: "text-pink-700",   bg: "bg-pink-50",    border: "border-pink-200"   },
};

// ─── Status metadata ───────────────────────────────────────────────────────────
export const STATUS_META = {
  already_tracked: {
    dot:   "bg-emerald-500",
    text:  "text-emerald-700",
    bg:    "bg-emerald-50",
    label: "Ready to pull",
    short: "Ready",
  },
  partially_tracked: {
    dot:   "bg-amber-400",
    text:  "text-amber-700",
    bg:    "bg-amber-50",
    label: "Needs verification",
    short: "Verify",
  },
  new_data_needed: {
    dot:   "bg-orange-500",
    text:  "text-orange-700",
    bg:    "bg-orange-50",
    label: "Collect fresh",
    short: "Collect",
  },
  not_applicable: {
    dot:   "bg-slate-300",
    text:  "text-slate-400",
    bg:    "bg-slate-50",
    label: "Not applicable",
    short: "N/A",
  },
} as const;

export type StatusKey = keyof typeof STATUS_META;
export type TypeKey   = "all" | "essential" | "leadership";

// ─── SEBI source references ──────────────────────────────────────────────────
// SEBI does not publish per-field deep links — every Section-C principle
// disclosure is defined in one canonical document: the updated BRSR Format
// (Annexure II, Jul 2023). We link there and cite the ICAI Background Material
// page (already in the data) for true per-field granularity.
export const SEBI_BRSR_FORMAT_URL =
  "https://www.sebi.gov.in/sebi_data/commondocs/jul-2023/Annexure_II-Updated-BRSR_p.PDF";

// Map "P6" → "6" for a principle-specific link label.
export function principleNumber(principle: string): string {
  return principle.replace(/^P/i, "");
}

// Trim regulatory boilerplate so labels read naturally.
export function plain(label: string): string {
  const s = label
    .replace(/[\?.]?\s*[Ii]f yes[,.]?[\s\S]*/i, "")
    .replace(/\s*\(Yes\/No[^)]*\)/g, "")
    .replace(/^Does the entity have an?\s+/i, "")
    .replace(/^Whether the entity\s+/i, "")
    .replace(/^Provide details (of |related to |on )?/i, "")
    .replace(/^Details of /i, "")
    .replace(/^Describe the /i, "")
    .replace(/^Please provide details (of |on )?/i, "")
    .replace(/^Is the entity /i, "")
    // Strip leading sub-question marker e.g. "A. " "a. " "1. "
    .replace(/^[A-Za-z0-9]\.\s+/, "")
    // Split on em-dash, semicolon, or a new lettered sub-question "? b. "
    .split(/\s+[—–]\s+|\s*;\s+/)[0]
    .replace(/\?\s+[a-zA-Z]\.\s[\s\S]*/, "?")  // "...sourcing? b. Also..." → "...sourcing?"
    .trim()
    .replace(/\s+/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}
