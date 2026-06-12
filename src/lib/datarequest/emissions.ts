// Turns collected "activity" data points (grid electricity, diesel) into a GHG
// figure using the existing, cited calculator (CEA grid factor + IPCC fuel
// factors). This is the "emission / calculation" half Priya described: the
// recipients submit raw activity; the consultant sees Scope 1 & 2 computed.
import { calcGhg, DEFAULT_CALC_INPUTS, type CalcInputs, type GhgResult } from "@/lib/emissions-calculator";
import type { Campaign } from "./types";

// Map our request field ids → the calculator's input keys.
const FIELD_TO_INPUT: Partial<Record<string, keyof CalcInputs>> = {
  "P6-E1-elec": "grid_kwh",
  "P6-E1-diesel": "diesel_l",
};

// Returns a GHG result if any activity data has been collected, else null.
export function campaignEmissions(campaign: Campaign): GhgResult | null {
  const inputs: CalcInputs = { ...DEFAULT_CALC_INPUTS };
  let any = false;

  for (const contact of campaign.contacts) {
    for (const item of contact.items) {
      const key = FIELD_TO_INPUT[item.fieldId];
      if (key && item.status === "received" && item.value && parseFloat(item.value) > 0) {
        inputs[key] = item.value;
        any = true;
      }
    }
  }

  return any ? calcGhg(inputs) : null;
}
