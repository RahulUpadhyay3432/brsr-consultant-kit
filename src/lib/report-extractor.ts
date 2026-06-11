// Heuristic detection of which BRSR disclosures appear to already be documented
// in an uploaded previous report. This runs entirely on text extracted in the
// browser — no network, no AI. It is intentionally conservative and always
// surfaces the matched keywords + a snippet so the consultant can confirm; it
// never auto-marks anything as final.

export interface DisclosureMatch {
  keywords: string[];
  snippet: string;
}

export interface DetectionResult {
  detectedIds: string[];
  matches: Record<string, DisclosureMatch>;
}

// Distinctive phrases per BRSR indicator. A field is flagged if ANY phrase is
// found. Phrases are chosen to be specific enough to avoid obvious false
// positives, and weighted toward "sticky" disclosures (policies, narratives,
// management systems) that rarely change year to year.
const SIGNALS: Record<string, string[]> = {
  // ── P1 Ethics ──────────────────────────────────────────────────────────
  "P1-E1": ["training and awareness programme", "awareness programmes on"],
  "P1-E4": ["anti-corruption", "anti-bribery", "anti corruption", "anti bribery"],
  "P1-E6": ["conflict of interest"],
  "P1-L2": ["conflict of interests involving members of the board"],

  // ── P2 Products & Services ──────────────────────────────────────────────
  "P2-E1": ["r&d and capital expenditure", "r&d and capex"],
  "P2-E2": ["sustainable sourcing", "sourced sustainably"],
  "P2-E3": ["safely reclaim", "reclaim your products", "end of life"],
  "P2-E4": ["extended producer responsibility"],
  "P2-L1": ["life cycle assessment", "life cycle perspective", "lca"],

  // ── P3 Employee Wellbeing ──────────────────────────────────────────────
  "P3-E2": ["retirement benefits", "provident fund", "gratuity"],
  "P3-E4": ["equal opportunity policy", "persons with disabilities act"],
  "P3-E6": ["grievance redressal", "mechanism to receive and redress grievances"],
  "P3-E7": ["recognised by the listed entity", "association(s) or unions", "trade union"],
  "P3-E10": ["occupational health and safety management system", "health and safety management system", "iso 45001"],
  "P3-E11": ["lost time injury", "ltifr", "safety related incidents", "high consequence work-related injury"],

  // ── P4 Stakeholder Engagement ──────────────────────────────────────────
  "P4-E1": ["identifying key stakeholder", "key stakeholder groups"],
  "P4-E2": ["frequency of engagement"],
  "P4-L3": ["vulnerable / marginalized stakeholder", "marginalized stakeholder groups"],

  // ── P5 Human Rights ────────────────────────────────────────────────────
  "P5-E1": ["training on human rights"],
  "P5-E2": ["minimum wages"],
  "P5-E5": ["redress grievances related to human rights"],
  "P5-E7": ["sexual harassment of women at workplace", "posh act", "posh"],
  "P5-E9": ["human rights requirements form part", "human rights requirements"],
  "P5-L2": ["human rights due diligence"],

  // ── P6 Environment ─────────────────────────────────────────────────────
  "P6-E1": ["total energy consumption", "energy intensity"],
  "P6-E2": ["perform, achieve and trade", "pat scheme", "designated consumers"],
  "P6-E3": ["water withdrawal", "water consumption", "water intensity"],
  "P6-E4": ["water discharged", "water discharge"],
  "P6-E5": ["zero liquid discharge"],
  "P6-E6": ["air emissions", "nox", "sox", "particulate matter"],
  "P6-E7": ["scope 1", "scope 2", "greenhouse gas emissions", "tco2e"],
  "P6-E8": ["reducing green house gas", "ghg emission reduction"],
  "P6-E9": ["waste generated", "hazardous waste", "plastic waste", "waste management"],
  "P6-E11": ["ecologically sensitive areas", "wildlife sanctuaries", "biodiversity hotspots"],
  "P6-E12": ["environmental impact assessment"],
  "P6-E13": ["water (prevention and control of pollution) act", "air (prevention and control of pollution) act", "environment protection act"],
  "P6-L2": ["scope 3 emissions", "total scope 3"],

  // ── P7 Policy Advocacy ─────────────────────────────────────────────────
  "P7-E1": ["trade and industry chambers", "industry chambers / associations", "affiliations with trade"],
  "P7-L1": ["public policy positions"],

  // ── P8 Inclusive Growth ────────────────────────────────────────────────
  "P8-E1": ["social impact assessment"],
  "P8-E2": ["rehabilitation and resettlement"],
  "P8-E3": ["grievances of the community", "community grievance"],
  "P8-L2": ["aspirational district"],
  "P8-L3": ["preferential procurement"],

  // ── P9 Consumer Responsibility ─────────────────────────────────────────
  "P9-E1": ["consumer complaints and feedback", "receive and respond to consumer complaints"],
  "P9-E5": ["cyber security", "data privacy", "information security"],
  "P9-E7": ["data breaches", "personally identifiable information"],

  // ── Section B · Management & process (policies/governance) ──────────────
  // Policies and governance architecture rarely change year to year, so this
  // is the strongest case for "found in last year's report" detection.
  "SB-1":  ["core elements of the ngrbc", "core elements of ngrbc", "policies cover each principle"],
  "SB-2":  ["translated the policy into procedures", "translated into procedures"],
  "SB-3":  ["extend to your value chain partners", "extend to value chain partners"],
  "SB-4":  ["national and international codes", "certifications/labels/standards"],
  "SB-5":  ["specific commitments, goals", "goals and targets set by the entity"],
  "SB-6":  ["performance against the specific commitments", "reasons for non-achievement"],
  "SB-7":  ["statement by director responsible", "statement of the director responsible"],
  "SB-8":  ["highest authority responsible for implementation"],
  "SB-9":  ["specified committee of the board", "decision making on sustainability"],
  "SB-10": ["review of ngrbcs by the company", "review of ngrbc"],
  "SB-11": ["independent assessment", "evaluation of its policies"],
};

const SNIPPET_RADIUS = 90;

export function detectDisclosures(rawText: string): DetectionResult {
  // Normalise: lowercase, collapse all whitespace runs to single spaces.
  const text = rawText.toLowerCase().replace(/\s+/g, " ");

  const detectedIds: string[] = [];
  const matches: Record<string, DisclosureMatch> = {};

  for (const [id, phrases] of Object.entries(SIGNALS)) {
    const hitKeywords: string[] = [];
    let firstIndex = -1;

    for (const phrase of phrases) {
      const idx = text.indexOf(phrase);
      if (idx !== -1) {
        hitKeywords.push(phrase);
        if (firstIndex === -1 || idx < firstIndex) firstIndex = idx;
      }
    }

    if (hitKeywords.length > 0) {
      const start = Math.max(0, firstIndex - SNIPPET_RADIUS);
      const end = Math.min(text.length, firstIndex + SNIPPET_RADIUS);
      let snippet = text.slice(start, end).trim();
      if (start > 0) snippet = "…" + snippet;
      if (end < text.length) snippet = snippet + "…";

      detectedIds.push(id);
      matches[id] = { keywords: hitKeywords, snippet };
    }
  }

  return { detectedIds, matches };
}
