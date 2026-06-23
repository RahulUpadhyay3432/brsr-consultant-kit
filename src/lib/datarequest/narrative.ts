// AI narrative draft (server-only). Turns COLLECTED principle-wise data into a
// short qualitative paragraph per BRSR Section-C principle. Strictly grounded:
// the model is told to use only the provided facts and never invent or alter a
// number. The deterministic figures still live in the draft (draft.ts); this only
// adds prose AROUND them. Paid tier.
import "server-only";
import type { Campaign } from "./types";
import { PRINCIPLE_LABELS, PRINCIPLE_ORDER } from "./brsr-meta";
import { groqComplete } from "./groq";

export interface NarrativeResult {
  [principle: string]: string;
}

const SYSTEM =
  "You are an ESG reporting assistant drafting the qualitative narrative of an Indian BRSR " +
  "(Business Responsibility and Sustainability Report). Rules you MUST follow without exception: " +
  "(1) Use ONLY the facts provided. Do not invent or estimate any number, name, date, ratio, or judgement. " +
  "(2) Never change, round, or restate a figure differently from how it is given, and do not characterise " +
  "performance (e.g. 'significant', 'strong', 'reliant', 'moderate') beyond what the facts literally state. " +
  "(3) Where information needed for a complete sentence is missing, write '[to be completed]' instead of guessing. " +
  "(4) Write clear, professional, third-person prose for a sustainability report: no headings, no bullet lists, " +
  "no preamble, no closing commentary. " +
  "(5) Keep it concise: 2 to 4 sentences.";

interface Group {
  principle: string;
  facts: string[];
}

// One group per Section-C principle that actually has submitted values.
function groupCollected(campaign: Campaign): Group[] {
  const items = campaign.contacts
    .flatMap((c) => c.items)
    .filter((i) => i.status === "received" && i.value && i.section === "C" && i.principle);
  const byP = new Map<string, Group>();
  const seen = new Set<string>();
  for (const it of items) {
    const k = `${it.fieldId}|${it.label}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const p = it.principle as string;
    if (!byP.has(p)) byP.set(p, { principle: p, facts: [] });
    byP.get(p)!.facts.push(`- ${it.label}: ${it.value}${it.unit ? " " + it.unit : ""}`);
  }
  return PRINCIPLE_ORDER.filter((p) => byP.has(p)).map((p) => byP.get(p)!);
}

function userPrompt(client: string, g: Group): string {
  const name = PRINCIPLE_LABELS[g.principle] ?? "Principle";
  return (
    `Company: ${client}\n` +
    `BRSR ${g.principle} - ${name}\n\n` +
    `Collected facts for this principle:\n${g.facts.join("\n")}\n\n` +
    `Write the qualitative narrative paragraph for this principle using only these facts.`
  );
}

// Generate one grounded paragraph per principle that has collected data. Sequential
// (gentle on free-tier limits) and rotating keys per call via `salt`, so token spend
// scales only with what was actually collected.
export async function generateNarrative(campaign: Campaign): Promise<NarrativeResult> {
  const groups = groupCollected(campaign);
  const out: NarrativeResult = {};
  for (let i = 0; i < groups.length; i++) {
    const text = await groqComplete(SYSTEM, userPrompt(campaign.clientName, groups[i]), { maxTokens: 320, salt: i });
    if (text) out[groups[i].principle] = text;
  }
  return out;
}
