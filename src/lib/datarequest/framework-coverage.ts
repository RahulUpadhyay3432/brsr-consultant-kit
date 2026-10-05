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
// Scope is whatever the bridge file reconciles — today environment (P6) and
// people (P3 plus the Section A employee rows, because BRSR puts headcount and
// turnover in Section A, not Principle 3). Those are the three things the
// outbound email named: energy, water, people. Callers must surface `scopeNote`
// so a partial view is never read as full coverage.

export const COVERAGE_SCOPE_NOTE =
  "Covers environment (Principle 6 — energy, water, emissions, waste, biodiversity) and people (Principle 3 plus the Section A employee rows, because BRSR asks for headcount and turnover in Section A). The remaining principles — ethics, products, stakeholders, human rights, advocacy, community and consumers — are not yet carried across: their crosswalk exists as reference, but a collected value does not flow into it.";

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

// The crosswalk marks "this framework has no counterpart" with a dash rather
// than an empty string, in 71 fields. Those are absences, not references: a
// people row rendered them as a badge reading "TCFD \u2014", which to anyone who
// knows the frameworks asserts that headcount maps into a climate-risk
// framework. An absent mapping must render as nothing at all.
const PLACEHOLDERS = new Set(["\u2014", "\u2013", "-", "", "n/a", "N/A", "\u2014\u2014"]);
function present(v: string | undefined): string | null {
  const t = (v ?? "").trim();
  return t && !PLACEHOLDERS.has(t) ? t : null;
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
      const gri = present(row.gri_standard);
      if (gri) {
        push({ framework: "GRI", reference: gri, detail: present(row.gri_label) ?? undefined });
      }
      const tcfd = present(row.tcfd_pillar);
      if (tcfd) {
        push({ framework: "TCFD", reference: tcfd, detail: present(row.tcfd_detail) ?? undefined });
      }
      const ifrs = present(row.ifrs_reference);
      if (ifrs) {
        push({ framework: "IFRS S1/S2", reference: ifrs });
      }
    }
    const ce = cdpEco[id];
    const cdpArea = present(ce?.cdp_area);
    if (cdpArea) {
      push({ framework: "CDP", reference: cdpArea, detail: present(ce?.cdp_detail) ?? undefined });
    }
    const ecoCriterion = present(ce?.ecovadis_criterion);
    if (ecoCriterion) {
      const theme = present(ce?.ecovadis_theme);
      push({
        framework: "EcoVadis",
        reference: `${theme ? `${theme} — ` : ""}${ecoCriterion}`,
        detail: present(ce?.ecovadis_detail) ?? undefined,
      });
    }
    const g = gresb[id];
    if (g) {
      // The two GRESB Assessments use different aspect vocabularies, so each is
      // named rather than merged — merging them would read as a contradiction.
      const parts: string[] = [];
      const re = present(g.gresb_re);
      const infra = present(g.gresb_infra);
      if (re) parts.push(`Real Estate: ${re}`);
      if (infra) parts.push(`Infrastructure: ${infra}`);
      if (parts.length) {
        push({ framework: "GRESB", reference: parts.join(" · "), detail: present(g.gresb_detail) ?? undefined });
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
    // In scope if the bridge either maps it or explicitly explains why it does
    // not. Anything else belongs to a principle that has not been reconciled.
    if (!bridge[baseId] && !unmapped[baseId]) continue;

    const hasValue = Boolean(item.value && item.value.trim());
    if (!hasValue) {
      awaiting.push({ fieldId: item.fieldId, label: item.label, ownerName });
      continue;
    }

    const entry = bridge[baseId];
    if (!entry) {
      collectedButUnmapped.push({ fieldId: item.fieldId, label: item.label, reason: unmapped[baseId] });
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
