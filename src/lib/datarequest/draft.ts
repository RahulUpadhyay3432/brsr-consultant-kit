// Builds a draft of BRSR responses from COLLECTED data only — deterministic,
// no fabrication. Every line is a value an owner actually submitted (or a figure
// computed from those values via the cited calculators). Pure function so it's
// easy to reason about / test.
import type { Campaign } from "./types";
import { campaignEmissions, emissionInputs, type EmissionInput } from "./emissions";
import { fmtNum } from "@/lib/emissions-calculator";

export interface DraftLine { label: string; value: string }
export interface DraftSection { title: string; lines: DraftLine[] }

export interface Draft {
  clientName: string;
  generatedAt: string;
  collectedCount: number;
  totalCount: number;
  sections: DraftSection[];
  emissions: { scope1: string; scope2: string; total: string } | null;
  emissionInputs: EmissionInput[];
  evidence: { label: string; fileName: string }[]; // supporting docs, for assurance
  pending: string[];
}

const SECTION_ORDER = ["Environment", "Social", "Governance"];

export function buildDraft(campaign: Campaign): Draft {
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const received = allItems.filter((i) => i.status === "received" && i.value);
  const pending = allItems.filter((i) => i.status !== "received").map((i) => i.label);

  // Group submitted values by category, de-duping repeated field labels.
  const byCat = new Map<string, DraftLine[]>();
  const seen = new Set<string>();
  for (const it of received) {
    const key = `${it.category}|${it.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const cat = it.category || "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat)!.push({ label: it.label, value: `${it.value}${it.unit ? ` ${it.unit}` : ""}` });
  }

  const cats = [...SECTION_ORDER, ...Array.from(byCat.keys()).filter((c) => !SECTION_ORDER.includes(c))];
  const sections = cats.filter((c) => byCat.has(c)).map((c) => ({ title: c, lines: byCat.get(c)! }));

  const ghg = campaignEmissions(campaign);
  const emissions = ghg
    ? { scope1: fmtNum(ghg.scope1_tco2e), scope2: fmtNum(ghg.scope2_tco2e), total: fmtNum(ghg.total_tco2e) }
    : null;

  // Supporting documents the owners attached — the assurance trail.
  const evidence = allItems
    .filter((i) => i.evidenceName)
    .map((i) => ({ label: i.label, fileName: i.evidenceName! }));

  return {
    clientName: campaign.clientName,
    generatedAt: new Date().toISOString(),
    collectedCount: received.length,
    totalCount: allItems.length,
    sections,
    emissions,
    emissionInputs: emissionInputs(campaign),
    evidence,
    pending,
  };
}
