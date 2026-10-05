import BRIDGE from "@/data/collect_crosswalk_bridge.json";
import FRAMEWORKS from "@/data/framework_mappings.json";
import CDP_ECO from "@/data/cdp_ecovadis_mappings.json";
import GRESB from "@/data/gresb_mappings.json";
import type { Campaign, Item } from "./types";

// Turns values a client's team actually submitted into the other frameworks'
// answers. This is the thing the product promised and did not have: Collect
// produced a BRSR draft and nothing else, while the crosswalk sat in the free
// report as a generic reference table with no client data in it, ever.
//
// It is only possible because collect_crosswalk_bridge.json reconciles the two
// BRSR numbering conventions by hand. Joining them by id instead would put a
// client's GHG figure under a water heading — the ids collide, and the shared
// ones mean different disclosures.
//
// PRINCIPLE 6 ONLY, deliberately and visibly. P6 is where every framework asks
// the same questions, and the only principle where CDP and EcoVadis are mapped
// at field level. Callers must surface `scopeNote` so nobody reads a partial
// view as full coverage.

export const COVERAGE_SCOPE_NOTE =
  "Principle 6 only — energy, water, emissions, waste and biodiversity. These are the figures every framework asks for repeatedly. The other eight BRSR principles are not yet carried across; their crosswalk exists as reference, but a collected value does not flow into it.";

type BridgeEntry = { crosswalk_ids: string[]; note: string };
const bridge = (BRIDGE as { bridge: Record<string, BridgeEntry> }).bridge;
const unmapped = (BRIDGE as { unmapped: Record<string, string> }).unmapped;

interface CrosswalkRow {
  brsr_id: string;
  brsr_label: string;
  gri_standard?: string;
  gri_label?: string;
  tcfd_pillar?: string;
  tcfd_detail?: string;
  ifrs_reference?: string;
}
const rows = new Map<string, CrosswalkRow>(
  (FRAMEWORKS as { mappings: CrosswalkRow[] }).mappings.map((m) => [m.brsr_id, m]),
);

const cdpEco = (CDP_ECO as { mappings: Record<string, {
  cdp_area?: string; cdp_detail?: string;
  ecovadis_theme?: string; ecovadis_criterion?: string; ecovadis_detail?: string;
}> }).mappings;

const gresb = (GRESB as { mappings: Record<string, {
  gresb_re?: string; gresb_infra?: string; gresb_detail?: string;
}> }).mappings;

/** One framework's answer, derived from a value the client submitted. */
export interface FrameworkAnswer {
  framework: "GRI" | "TCFD" | "IFRS S1/S2" | "CDP" | "EcoVadis" | "GRESB";
  /** Where this figure goes in that framework — its question, criterion or aspect. */
  reference: string;
  /** Why, in a sentence. */
  detail?: string;
}

/** A collected value and everywhere it is already an answer. */
export interface CoveredValue {
  fieldId: string;
  label: string;
  value: string;
  unit: string | null;
  /** 'owner' = a named person submitted it; 'import' = read from a document. */
  valueSource: Item["valueSource"];
  ownerName: string | null;
  evidenceName: string | null;
  /** The crosswalk metrics this one answer feeds. */
  metrics: { id: string; label: string }[];
  answers: FrameworkAnswer[];
  bridgeNote: string;
}

export interface FrameworkCoverage {
  clientName: string;
  reportingPeriod: string | null;
  covered: CoveredValue[];
  /** Collected P6 values with no crosswalk counterpart, and why. */
  collectedButUnmapped: { fieldId: string; label: string; reason: string }[];
  /** P6 questions assigned to someone but not answered yet. */
  awaiting: { fieldId: string; label: string; ownerName: string | null }[];
  /** How many distinct frameworks this campaign's P6 data already answers into. */
  frameworksReached: string[];
  scopeNote: string;
}

function answersFor(crosswalkIds: string[]): FrameworkAnswer[] {
  const out: FrameworkAnswer[] = [];
  const seen = new Set<string>();

  const push = (a: FrameworkAnswer) => {
    const key = `${a.framework}|${a.reference}`;
    if (a.reference && !seen.has(key)) {
      seen.add(key);
      out.push(a);
    }
  };

  for (const id of crosswalkIds) {
    const row = rows.get(id);
    if (row) {
      if (row.gri_standard) {
        push({ framework: "GRI", reference: row.gri_standard, detail: row.gri_label });
      }
      if (row.tcfd_pillar) {
        push({ framework: "TCFD", reference: row.tcfd_pillar, detail: row.tcfd_detail });
      }
      if (row.ifrs_reference) {
        push({ framework: "IFRS S1/S2", reference: row.ifrs_reference });
      }
    }
    const ce = cdpEco[id];
    if (ce?.cdp_area) push({ framework: "CDP", reference: ce.cdp_area, detail: ce.cdp_detail });
    if (ce?.ecovadis_criterion) {
      push({
        framework: "EcoVadis",
        reference: `${ce.ecovadis_theme ? `${ce.ecovadis_theme} — ` : ""}${ce.ecovadis_criterion}`,
        detail: ce.ecovadis_detail,
      });
    }
    const g = gresb[id];
    if (g) {
      // The two GRESB Assessments use different aspect vocabularies, so each is
      // named rather than merged — merging them would read as a contradiction.
      const parts: string[] = [];
      if (g.gresb_re) parts.push(`Real Estate: ${g.gresb_re}`);
      if (g.gresb_infra) parts.push(`Infrastructure: ${g.gresb_infra}`);
      if (parts.length) {
        push({ framework: "GRESB", reference: parts.join(" · "), detail: g.gresb_detail });
      }
    }
  }
  return out;
}

/**
 * Reads a campaign's collected Principle 6 values and reports what each one
 * already answers across the other frameworks. Invents nothing: every reference
 * comes from a sourced crosswalk row, and a value with no bridge entry is
 * reported as unmapped rather than guessed at.
 */
export function frameworkCoverage(campaign: Campaign): FrameworkCoverage {
  const items: { item: Item; ownerName: string | null }[] = [];
  for (const contact of campaign.contacts ?? []) {
    for (const item of contact.items ?? []) {
      items.push({ item, ownerName: contact.name ?? null });
    }
  }

  const covered: CoveredValue[] = [];
  const collectedButUnmapped: FrameworkCoverage["collectedButUnmapped"] = [];
  const awaiting: FrameworkCoverage["awaiting"] = [];

  for (const { item, ownerName } of items) {
    // The GHG calculator's two activity inputs carry suffixed ids
    // (P6-E1-elec, P6-E1-diesel); strip the suffix to find the BRSR question.
    const baseId = item.fieldId.replace(/-(elec|diesel)$/, "");
    if (!baseId.startsWith("P6-")) continue;

    const hasValue = Boolean(item.value && item.value.trim());
    if (!hasValue) {
      awaiting.push({ fieldId: item.fieldId, label: item.label, ownerName });
      continue;
    }

    const entry = bridge[baseId];
    if (!entry) {
      const reason = unmapped[baseId];
      if (reason) collectedButUnmapped.push({ fieldId: item.fieldId, label: item.label, reason });
      continue;
    }

    const metrics = entry.crosswalk_ids
      .map((id) => rows.get(id))
      .filter((r): r is CrosswalkRow => Boolean(r))
      .map((r) => ({ id: r.brsr_id, label: r.brsr_label }));

    covered.push({
      fieldId: item.fieldId,
      label: item.label,
      value: item.value!.trim(),
      unit: item.unit,
      valueSource: item.valueSource,
      ownerName,
      evidenceName: item.evidenceName ?? null,
      metrics,
      answers: answersFor(entry.crosswalk_ids),
      bridgeNote: entry.note,
    });
  }

  // Array.from rather than spreading a Set: the build target predates
  // downlevelIteration.
  const frameworksReached = Array.from(
    new Set(covered.flatMap((c) => c.answers.map((a) => a.framework))),
  );

  return {
    clientName: campaign.clientName,
    reportingPeriod: campaign.reportingPeriod ?? null,
    covered,
    collectedButUnmapped,
    awaiting,
    frameworksReached,
    scopeNote: COVERAGE_SCOPE_NOTE,
  };
}
