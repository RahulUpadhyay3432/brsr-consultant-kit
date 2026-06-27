// Builds a draft of BRSR responses from COLLECTED data only, deterministic,
// no fabrication. Every line is a value an owner actually submitted (or a figure
// computed from those values via the cited calculators). Pure function so it's
// easy to reason about / test.
import type { Campaign, Item } from "./types";
import { campaignEmissions, emissionInputs, type EmissionInput } from "./emissions";
import { SECTION_LABELS, PRINCIPLE_LABELS, PRINCIPLE_ORDER } from "./brsr-meta";
import { fmtNum } from "@/lib/emissions-calculator";

export interface DraftLine { code?: string; label: string; value: string; prior?: string }
export interface DraftSection { title: string; lines: DraftLine[] }

// Place each collected item in its BRSR home: Section A, Section B, then Section
// C grouped by principle (P1..P9). Pre-Layer-2 items (no section) fall to "Other".
function groupFor(it: Item): { order: number; title: string } {
  if (it.section === "A") return { order: 0, title: SECTION_LABELS.A };
  if (it.section === "B") return { order: 1, title: SECTION_LABELS.B };
  if (it.section === "C" && it.principle) {
    const idx = PRINCIPLE_ORDER.indexOf(it.principle);
    return { order: 2 + (idx < 0 ? 99 : idx), title: `${it.principle} · ${PRINCIPLE_LABELS[it.principle] ?? "Principle-wise"}` };
  }
  return { order: 999, title: "Other collected data" };
}

export interface Draft {
  clientName: string;
  reportingPeriod: string | null;
  generatedAt: string;
  collectedCount: number;
  totalCount: number;
  sections: DraftSection[];
  emissions: { scope1: string; scope2: string; total: string } | null;
  emissionInputs: EmissionInput[];
  evidence: { label: string; fileName: string }[]; // supporting docs, for assurance
  pending: string[];
}

export function buildDraft(campaign: Campaign): Draft {
  const allItems = campaign.contacts.flatMap((c) => c.items);
  const received = allItems.filter((i) => i.status === "received" && i.value);
  const pending = allItems.filter((i) => i.status !== "received").map((i) => i.label);

  // Group submitted values into their BRSR sections/principles, de-duping
  // repeated fields. Each group keeps its sort order so the draft reads in
  // Section A → B → C (P1..P9) order, the shape of the report itself.
  const byGroup = new Map<string, { order: number; lines: DraftLine[] }>();
  const seen = new Set<string>();
  for (const it of received) {
    const key = `${it.fieldId}|${it.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const { order, title } = groupFor(it);
    if (!byGroup.has(title)) byGroup.set(title, { order, lines: [] });
    const unit = it.unit ? ` ${it.unit}` : "";
    byGroup.get(title)!.lines.push({
      code: it.fieldId,
      label: it.label,
      value: `${it.value}${unit}`,
      prior: it.priorValue ? `${it.priorValue}${unit}` : undefined,
    });
  }

  const sections = Array.from(byGroup.entries())
    .sort((a, b) => a[1].order - b[1].order)
    .map(([title, g]) => ({ title, lines: g.lines }));

  const ghg = campaignEmissions(campaign);
  const emissions = ghg
    ? { scope1: fmtNum(ghg.scope1_tco2e), scope2: fmtNum(ghg.scope2_tco2e), total: fmtNum(ghg.total_tco2e) }
    : null;

  // Supporting documents the owners attached, the assurance trail.
  const evidence = allItems
    .filter((i) => i.evidenceName)
    .map((i) => ({ label: i.label, fileName: i.evidenceName! }));

  return {
    clientName: campaign.clientName,
    reportingPeriod: campaign.reportingPeriod,
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
