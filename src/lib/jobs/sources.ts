// Source pages the jobs crawler scrapes each run. Each is a listing/careers page
// that renders current ESG/sustainability openings; Firecrawl turns it into markdown
// and a grounded LLM pass extracts the individual roles + their apply links.
//
// LOW-RISK by design: company career pages + climate-specific boards + India job
// boards that don't aggressively litigate scraping. LinkedIn is deliberately left
// OUT of the default set (it's the litigious outlier); add it only if you accept
// that trade-off for a public board.

export interface JobSource {
  url: string;
  sourceName: string; // shown on the card as "via <sourceName>"
}

export const JOB_SOURCES: JobSource[] = [
  // ── Phase 1: durable, low-risk sources (start here) ──────────────────────────
  // A climate-specific board + boutique/consulting career pages. Cheap to scrape,
  // reliable markdown, unlikely to bot-wall Firecrawl. Confirm extraction quality
  // on these before enabling the heavier boards below.
  { url: "https://climatebase.org/jobs?l=India", sourceName: "Climatebase" },
  { url: "https://www.ey.com/en_in/careers/climate-change-sustainability-services", sourceName: "EY careers" },
  { url: "https://www.breatheesg.com/careers", sourceName: "Breathe ESG" },
  { url: "https://www.karbonwise.com/careers", sourceName: "Karbonwise" },

  // ── Phase 2: India job boards (enable once Phase 1 looks good) ────────────────
  // Heavier pages, higher Firecrawl credit cost, and occasionally bot-walled even
  // for Firecrawl. Uncomment after you've seen a clean first run.
  // { url: "https://www.naukri.com/esg-sustainability-jobs", sourceName: "Naukri" },
  // { url: "https://www.foundit.in/search/esg-sustainability-jobs", sourceName: "foundit" },
  // { url: "https://www.foundit.in/search/brsr-jobs", sourceName: "foundit" },
  // { url: "https://www.foundit.in/search/carbon-accounting-jobs", sourceName: "foundit" },

  // LinkedIn (OFF — high scraping-risk; uncomment only if you accept it)
  // { url: "https://www.linkedin.com/jobs/search/?keywords=ESG%20sustainability&location=India", sourceName: "LinkedIn" },
];
