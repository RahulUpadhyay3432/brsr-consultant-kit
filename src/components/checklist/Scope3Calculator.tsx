"use client";
// Scope 3 screening calculator for the BRSR P6-L2 row and /tools/scope3-calculator.
// Activity/distance-based per the GHG Protocol Scope 3 Standard; DEFRA 2024 v1.1
// factors (cited per line). On device, nothing leaves the browser. Screening-level:
// Scope 3 is a BRSR Leadership (voluntary) indicator. Category 1 (purchased goods) is a
// supplier-data pass-through (enter supplier-reported tCO₂e directly, no factor) since
// no India spend-factor exists.
// Layouts mirror EmissionsCalculator: "embedded" stacks inside its own tinted stage;
// "page" keeps the result in a sticky right column (the page supplies the stage and
// the turnover field, via `turnoverField`).
import type { ReactNode } from "react";
import {
  calcScope3, SCOPE3_GROUPS, PURCHASED_GOODS_KEY,
  type Scope3Inputs, type Scope3GroupKey,
} from "@/lib/scope3-calculator";
import { fmtNum, fmtIntensity, perInrStr } from "@/lib/emissions-calculator";
import { CalcPanel, NumberField, ResultList, ResultRow } from "@/components/calc/CalcKit";

interface Props {
  inputs: Scope3Inputs;
  turnoverCrore: string;
  onChange: (key: string, value: string) => void;
  layout?: "page" | "embedded";
  /** Turnover input rendered inside the result panel (the tool page owns that state). */
  turnoverField?: ReactNode;
}

// One practical line per category, written for the consultant filling it in.
const GROUP_NOTES: Record<Scope3GroupKey, string> = {
  business_travel: "Passenger-km is trips × distance per traveller. Air factors include radiative forcing; car is per vehicle-km.",
  commuting: "DEFRA publishes no separate commuting table; standard practice reuses the land-travel factors. Car and two-wheeler are per vehicle-km.",
  freight: "Tonne-km is tonnes shipped × km travelled. Freight the client pays for is Cat 4; downstream freight it doesn't pay for is Cat 9.",
  waste: "Landfill is gate-to-grave; recycling, combustion and composting count transport to the facility, per the Scope 3 standard.",
};

// "Cat 6, Business travel" → { cat: "Cat 6", name: "Business travel" }
function splitCategory(category: string) {
  const i = category.indexOf(", ");
  return i === -1 ? { cat: "", name: category } : { cat: category.slice(0, i), name: category.slice(i + 2) };
}

export default function Scope3Calculator({ inputs, turnoverCrore, onChange, layout = "embedded", turnoverField }: Props) {
  const result = calcScope3(inputs, turnoverCrore);
  const page = layout === "page";
  const level = page ? 2 : 3;
  const compact = !page;

  const inputPanels = (
    <>
      {SCOPE3_GROUPS.map((g) => {
        const { cat, name } = splitCategory(g.category);
        return (
          <CalcPanel key={g.key} level={level} compact={compact} eyebrow={cat} title={name}>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.factors.map((f) => (
                <NumberField key={f.id} label={f.label} unit={f.unit} value={inputs[f.id] ?? ""}
                  onChange={(v) => onChange(f.id, v)} hint={f.display} />
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-ink-muted leading-relaxed">{GROUP_NOTES[g.key]}</p>
          </CalcPanel>
        );
      })}

      {/* Category 1: supplier-data pass-through (primary data, no factor applied) */}
      <CalcPanel level={level} compact={compact} eyebrow="Cat 1" title="Purchased goods & services">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField label="Supplier-reported emissions" unit="tCO₂e" value={inputs[PURCHASED_GOODS_KEY] ?? ""}
            onChange={(v) => onChange(PURCHASED_GOODS_KEY, v)} hint="Added unchanged, no factor applied" />
        </div>
        <p className="mt-4 text-[12.5px] text-ink-muted leading-relaxed">
          Enter Category 1 emissions <span className="font-semibold text-ink-body">as reported by your suppliers</span>, already in tonnes CO₂e. There is no authoritative India spend-based factor set, so this records real supplier data rather than estimating it.
        </p>
      </CalcPanel>
    </>
  );

  const any = result.anyInput;
  const resultPanel = (
    <CalcPanel level={level} compact={compact} title="Disclosure figure">
      {!any && (
        <p className="-mt-3 mb-2 text-[12.5px] text-ink-muted leading-relaxed">Fills in as you enter activity data.</p>
      )}
      <ResultList>
        {result.categories.filter((c) => c.lines.length > 0 || !any).map((c) => (
          <div key={c.key}>
            <ResultRow label={c.category} value={any ? fmtNum(c.subtotal_tco2e, 2) : "—"} unit="tCO₂e" />
            {c.lines.length > 1 && c.lines.map((ln) => (
              <ResultRow key={ln.label} label={ln.label} value={fmtNum(ln.tco2e, 2)} unit="tCO₂e" muted indent />
            ))}
          </div>
        ))}
        <ResultRow label="Total Scope 3 (screening)" sub="tCO₂e · BRSR P6-L2" value={any ? fmtNum(result.total_tco2e, 2) : "—"} strong />
      </ResultList>

      {turnoverField && <div className="mt-2 border-t border-[#D6E6F7] pt-4">{turnoverField}</div>}

      {result.intensity_per_crore !== null && (
        <div className="mt-1">
          <ResultList>
            <ResultRow label="Scope 3 intensity" value={fmtIntensity(result.intensity_per_crore, 4)} unit="tCO₂e / ₹ crore"
              note={`BRSR table asks "per rupee of turnover": ${perInrStr(result.intensity_per_crore)} tCO₂e/INR`} />
          </ResultList>
        </div>
      )}

      <div className="mt-4 space-y-2 border-t border-[#D6E6F7] pt-3 text-[12px] text-ink-muted leading-relaxed">
        <p>
          <span className="font-semibold text-brand-700">Method:</span>{" "}
          GHG Protocol Corporate Value Chain (Scope 3) Standard, activity/distance-based.{" "}
          <span className="font-semibold text-brand-700">Factors:</span>{" "}
          DEFRA/DESNZ 2024 GHG Conversion Factors v1.1. Air includes radiative forcing; freight is direct + well-to-tank.
        </p>
        <p>
          Scope 3 is a BRSR P6 Leadership indicator, voluntary and not under reasonable assurance. This is a screening estimate; a certified GHG auditor should sign off on final disclosures.
        </p>
      </div>
    </CalcPanel>
  );

  if (page) {
    return (
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">{inputPanels}</div>
        <div className="lg:sticky lg:top-24">{resultPanel}</div>
      </div>
    );
  }

  return (
    <div className="calc-stage rounded-3xl p-3 sm:p-4 space-y-3">
      <div className="px-2 pt-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">Scope 3 screening · runs on this device</p>
        <p className="text-[12.5px] text-ink-body leading-snug mt-0.5">
          Value-chain emissions in tCO₂e for BRSR P6-L2, from activity data and DEFRA 2024 factors. Intensity reuses the turnover entered in the P6 calculators.
        </p>
      </div>
      {inputPanels}
      {resultPanel}
    </div>
  );
}
