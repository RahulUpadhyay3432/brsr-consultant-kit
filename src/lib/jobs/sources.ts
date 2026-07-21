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
  // Climate-specific boards (India-filtered)
  { url: "https://climatebase.org/jobs?l=India", sourceName: "Climatebase" },
  // India job boards — ESG/sustainability searches
  { url: "https://www.naukri.com/esg-sustainability-jobs", sourceName: "Naukri" },
  { url: "https://www.foundit.in/search/esg-sustainability-jobs", sourceName: "foundit" },
  { url: "https://www.foundit.in/search/brsr-jobs", sourceName: "foundit" },
  { url: "https://www.foundit.in/search/carbon-accounting-jobs", sourceName: "foundit" },
  // Big-4 / consulting ESG careers
  { url: "https://www.ey.com/en_in/careers/climate-change-sustainability-services", sourceName: "EY careers" },
  // Climate-tech / boutique career pages (durable per-employer)
  { url: "https://www.breatheesg.com/careers", sourceName: "Breathe ESG" },
  { url: "https://www.karbonwise.com/careers", sourceName: "Karbonwise" },
  // LinkedIn (OFF by default — high scraping-risk; uncomment only if you accept it)
  // { url: "https://www.linkedin.com/jobs/search/?keywords=ESG%20sustainability&location=India", sourceName: "LinkedIn" },
];
