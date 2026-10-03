import FACTORS from "@/data/emission_factors.json";
import SCOPE3 from "@/data/scope3_factors.json";
import PPP from "@/data/ppp_factor.json";

// A flat, searchable index over every emission factor the product computes with.
//
// The factors already lived in three JSON files and were already cited — but the
// only way to see one was to open a calculator that happened to use it. A
// consultant checking whether our basis matches theirs, or an assurer asking
// "which version of the grid factor is this", had nowhere to look. Competitors
// publish an "India emission factor database" as a free lead magnet; ours is the
// same data we actually calculate with, which is a stronger claim, so this index
// exists to render it as a page rather than to feed a new calculation.
//
// Nothing is restated or rounded here: `display` and `source` are carried
// verbatim from the data files so the page and the calculators can never
// disagree. Adding a factor to any source file adds a row here automatically.

export type Scope = "Scope 1" | "Scope 2" | "Scope 3";

export interface FactorEntry {
  /** Stable within a group; `${group}-${id}` is unique across the index. */
  id: string;
  key: string;
  label: string;
  /** The numeric factor, in the units given by `per`. */
  value: number;
  /** Pre-formatted figure, verbatim from the data file. */
  display: string;
  /** The denominator: what one unit of the factor is per. */
  per: string;
  scope: Scope;
  /** Display group, e.g. "Stationary & mobile fuels". */
  group: string;
  /** BRSR/GHG-Protocol framing, e.g. "Cat 6, Business travel". */
  category: string;
  /** Primary-source citation, verbatim. */
  source: string;
  /** Secondary line where the data file carries one (net calorific value). */
  note?: string;
  /** Which product surfaces compute with this factor. */
  usedBy: string[];
}

export interface FactorGroup {
  title: string;
  scope: Scope;
  blurb: string;
  entries: FactorEntry[];
}

const grid = FACTORS.scope2_grid as {
  factor_kg_co2_per_kwh: number; factor_display: string; version: string; fy: string; source: string;
};
const fuels = FACTORS.scope1_fuels as {
  id: string; label: string; unit: string; co2e_per_unit: number; co2e_display: string;
  ncv_display: string; source: string;
}[];
const fugitive = FACTORS.scope1_fugitive as {
  id: string; label: string; unit: string; co2e_per_unit: number; co2e_display: string; source: string;
}[];

type S3Group = { category: string; unit: string; note?: string; factors: { id: string; label: string; co2e: number; unit: string; display: string; source: string }[] };

// Insertion order is display order. Scope 3 groups are read from the file so a
// new category appears without touching this list.
const S3_ORDER: { key: keyof typeof SCOPE3; title: string; blurb: string }[] = [
  { key: "business_travel", title: "Business travel", blurb: "Air, rail and road travel per passenger-kilometre. Air factors include radiative forcing, the full climate effect of emitting at altitude." },
  { key: "commuting", title: "Employee commuting", blurb: "DEFRA publishes no separate commuting table, so these reuse the land-travel factors — the standard practice, and stated as such rather than presented as a commuting dataset." },
  { key: "freight", title: "Freight & transportation", blurb: "Per tonne-kilometre, combined: direct (tank-to-wheel) plus well-to-tank, which is the full value-chain basis Scope 3 expects." },
  { key: "waste", title: "Waste generated in operations", blurb: "Per tonne. Landfill is gate-to-grave; recycling, combustion and composting are transport-to-facility only, the convention DEFRA publishes." },
];

function s3Groups(): FactorGroup[] {
  const out: FactorGroup[] = [];
  for (const spec of S3_ORDER) {
    const g = SCOPE3[spec.key] as unknown as S3Group | undefined;
    if (!g || !Array.isArray(g.factors)) continue;
    out.push({
      title: spec.title,
      scope: "Scope 3",
      blurb: spec.blurb,
      entries: g.factors.map((f) => ({
        id: f.id,
        key: `s3-${f.id}`,
        label: f.label,
        value: f.co2e,
        display: f.display,
        per: f.unit,
        scope: "Scope 3" as Scope,
        group: spec.title,
        category: g.category,
        source: f.source,
        note: g.note,
        usedBy: ["/tools/scope3-calculator"],
      })),
    });
  }
  return out;
}

export const FACTOR_GROUPS: FactorGroup[] = [
  {
    title: "Grid electricity",
    scope: "Scope 2",
    blurb:
      "The national grid factor, location-based. A Scope 2 figure cannot be assured without naming the version it used, so the version and the financial year it applies to are part of the record, not a footnote.",
    entries: [
      {
        id: "grid",
        key: "s2-grid",
        label: "Purchased grid electricity (India, national average)",
        value: grid.factor_kg_co2_per_kwh,
        display: grid.factor_display,
        per: "kWh",
        scope: "Scope 2",
        group: "Grid electricity",
        category: "Scope 2, purchased electricity (location-based)",
        source: grid.source,
        note: `CEA Version ${grid.version} · applies to FY ${grid.fy}`,
        usedBy: ["/tools/ghg-calculator", "/tools/ppp-intensity", "Report · P6 calculators", "Collect · emissions"],
      },
    ],
  },
  {
    title: "Stationary & mobile fuels",
    scope: "Scope 1",
    blurb:
      "Fuels burned in owned or controlled sources — generators, boilers, furnaces, company vehicles. Each carries its net calorific value too, because BRSR asks for energy consumption in joules as well as emissions.",
    entries: fuels.map((f) => ({
      id: f.id,
      key: `s1-fuel-${f.id}`,
      label: f.label,
      value: f.co2e_per_unit,
      display: f.co2e_display,
      per: f.unit,
      scope: "Scope 1" as Scope,
      group: "Stationary & mobile fuels",
      category: "Scope 1, stationary & mobile combustion",
      source: f.source,
      note: `Net calorific value ${f.ncv_display}`,
      usedBy: ["/tools/ghg-calculator", "Report · P6 calculators", "Collect · emissions"],
    })),
  },
  {
    title: "Fugitive emissions (refrigerants & SF₆)",
    scope: "Scope 1",
    blurb:
      "Global warming potentials, not combustion factors: multiply the quantity leaked or topped up during the year. These are the Scope 1 lines most often left out entirely, and an assurer looks for them.",
    entries: fugitive.map((f) => ({
      id: f.id,
      key: `s1-fug-${f.id}`,
      label: f.label,
      value: f.co2e_per_unit,
      display: f.co2e_display,
      per: f.unit,
      scope: "Scope 1" as Scope,
      group: "Fugitive emissions (refrigerants & SF₆)",
      category: "Scope 1, fugitive emissions",
      source: f.source,
      usedBy: ["/tools/ghg-calculator"],
    })),
  },
  ...s3Groups(),
];

export const ALL_FACTORS: FactorEntry[] = FACTOR_GROUPS.flatMap((g) => g.entries);

export const FACTOR_COUNT = ALL_FACTORS.length;

export const SCOPES: Scope[] = ["Scope 1", "Scope 2", "Scope 3"];

export function countByScope(scope: Scope): number {
  return ALL_FACTORS.filter((f) => f.scope === scope).length;
}

/** Methodology statements, carried verbatim so the page cites what the maths uses. */
export const METHODOLOGY = {
  scope1: (FACTORS._meta as { scope1_methodology: string }).scope1_methodology,
  scope2: (FACTORS._meta as { scope2_methodology: string }).scope2_methodology,
  gwp: (FACTORS._meta as { note: string }).note,
  scope3: (SCOPE3._meta as { methodology: string }).methodology,
  scope3Source: (SCOPE3._meta as { factor_source: string }).factor_source,
  scope3SourceUrl: (SCOPE3._meta as { factor_source_url: string }).factor_source_url,
  scope3Status: (SCOPE3._meta as { status_note: string }).status_note,
  scope3Vintage: (SCOPE3._meta as { vintage_note: string }).vintage_note,
};

export const PPP_FACTOR = {
  value: (PPP as { value: number }).value,
  year: (PPP as { year: number }).year,
  unit: (PPP as { unit: string }).unit,
};

/** Free-text match across the fields a consultant would search by. */
export function matchesQuery(f: FactorEntry, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  return [f.label, f.per, f.group, f.category, f.source, f.display]
    .join(" ")
    .toLowerCase()
    .includes(needle);
}

/** Rows for the CSV export: header plus one line per factor, citation included. */
export function factorCsvRows(entries: FactorEntry[] = ALL_FACTORS): string[][] {
  return [
    ["Scope", "Group", "Factor", "Value", "Per unit", "As published", "GHG Protocol category", "Primary source", "Note"],
    ...entries.map((f) => [
      f.scope,
      f.group,
      f.label,
      String(f.value),
      f.per,
      f.display,
      f.category,
      f.source,
      f.note ?? "",
    ]),
  ];
}
