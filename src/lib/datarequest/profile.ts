// On-device consultant profile (localStorage). Auth is a single shared passcode
// (no per-user accounts yet), so the consultant's identity + default rate card live
// in the browser, reusing the free-tool storage helpers. It seeds the proposal &
// fee builder and brands the client-facing proposal PDF, so nothing is re-typed.
// When real per-consultant accounts arrive, this moves server-side.
import { loadJSON, saveJSON } from "@/lib/storage";
import { DEFAULT_FEE_INPUTS } from "@/lib/proposal";

const KEY = "collect.profile";

export interface ConsultantProfile {
  name: string;
  firm: string;
  email: string;
  phone: string;
  website: string;
  // Default rate card (INR), seeds the proposal builder's editable rates.
  baseFee: number;
  perFramework: number;
  scope3Fee: number;
  valueChainFee: number;
  assuranceFee: number;
}

export const EMPTY_PROFILE: ConsultantProfile = {
  name: "",
  firm: "",
  email: "",
  phone: "",
  website: "",
  baseFee: DEFAULT_FEE_INPUTS.baseFee,
  perFramework: DEFAULT_FEE_INPUTS.perFramework,
  scope3Fee: DEFAULT_FEE_INPUTS.scope3Fee,
  valueChainFee: DEFAULT_FEE_INPUTS.valueChainFee,
  assuranceFee: DEFAULT_FEE_INPUTS.assuranceFee,
};

// Merge over EMPTY_PROFILE so a profile saved before a field existed still loads.
export function loadProfile(): ConsultantProfile {
  return { ...EMPTY_PROFILE, ...loadJSON<Partial<ConsultantProfile>>(KEY, {}) };
}

export function saveProfile(p: ConsultantProfile): void {
  saveJSON(KEY, p);
}

// Identity is "set" once any of name/firm/email is filled, drives PDF branding.
export function hasProfileIdentity(p: ConsultantProfile): boolean {
  return !!(p.name || p.firm || p.email);
}
