// The consultant directory: the supply side of the gigs board.
//
// The pattern that repeats endlessly in ESG consultant groups is someone asking
// "anyone who can do an ash-dyke audit?", "any ISO 13485 lead auditor in
// Bengaluru?", "know a reliable LCA consultant for petrochemicals?" and the only
// answer ever given being "DM me". Every one of those questions is a search that
// has no index. This is the index.
//
// Deliberately no email or phone on a profile. Listings are public and would be
// scraped within a week; a profile links to where the consultant already presents
// themselves professionally instead, and they decide what to expose there.
import consultantsData from "@/data/consultants.json";

export interface Consultant {
  id: string;
  name: string;
  headline: string;          // "Independent BRSR & assurance-readiness consultant"
  location: string;          // "Bengaluru" · "Remote (India)"
  expertise: string[];       // ["BRSR", "GHG accounting", "LCA"]
  experience?: string;       // free text, e.g. "8 years"
  about?: string;            // 2 to 4 sentences, in their own words
  link?: string;             // LinkedIn or their own site. No email, no phone.
  availability?: string;     // "Open to short assignments"
  addedDate: string;         // ISO, when the listing went up
  featured?: boolean;
}

export function getConsultants(): Consultant[] {
  return [...((consultantsData.consultants || []) as Consultant[])].sort(
    (a, b) =>
      (b.featured ? 1 : 0) - (a.featured ? 1 : 0) ||
      (b.addedDate || "").localeCompare(a.addedDate || "")
  );
}

// Every expertise tag actually present, most common first, so the filter row only
// ever offers something that returns a result.
export function expertiseTags(list: Consultant[]): string[] {
  const counts = new Map<string, number>();
  for (const c of list) {
    for (const tag of c.expertise || []) counts.set(tag, (counts.get(tag) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([tag]) => tag);
}

export function matchesConsultant(c: Consultant, query: string, tag: string): boolean {
  if (tag !== "all" && !(c.expertise || []).includes(tag)) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${c.name} ${c.headline} ${c.location} ${(c.expertise || []).join(" ")}`
    .toLowerCase()
    .includes(q);
}
