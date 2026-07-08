"use client";

import { SEBI_BRSR_FORMAT_URL } from "./checklist/constants";
import ViewHeader from "./report/ViewHeader";

// ─── Sources & methodology ────────────────────────────────────────────────────
// A curated, always-current reference: every number and disclosure in the kit
// traces to a primary source. We link to the live authoritative document, never
// a hosted copy, so the reference can't go stale and we don't redistribute
// restricted material (e.g. the ICAI Background Material).

type Source = {
  name: string;
  governs: string;       // what this document is the authority for
  builtAgainst: string;  // the version / edition the kit is calibrated to
  usedIn: string;        // where it surfaces in the workspace
  href?: string;         // official, live source
  restricted?: boolean;  // distribution-restricted, cited, deliberately not hosted/linked to a copy
};

type Group = { heading: string; blurb: string; items: Source[] };

const GROUPS: Group[] = [
  {
    heading: "Regulatory basis",
    blurb: "What BRSR actually requires, the disclosures themselves.",
    items: [
      {
        name: "SEBI BRSR Format (Annexure II)",
        governs: "Every Section A, B and C disclosure, the exact questions a listed entity must answer.",
        builtAgainst: "Annexure II, Jul 2023 + Mar 2025 amendment (adds P6 Green Credits)",
        usedIn: "Action Plan, every row, and the “SEBI source” link in each expanded panel",
        href: SEBI_BRSR_FORMAT_URL,
      },
      {
        name: "ICAI Background Material on BRSR",
        governs: "Measurement guidance and the page citations shown against each disclosure.",
        builtAgainst: "Revised Edition 2024 (SRSB, ICAI)",
        usedIn: "Page references in each Action Plan row's expanded panel",
        restricted: true,
      },
    ],
  },
  {
    heading: "Calculation factors",
    blurb: "The numbers behind the embedded GHG, energy and water calculators, GHG figures follow the GHG Protocol Corporate Standard (Scope 1 & 2, location-based, IPCC AR5 GWPs).",
    items: [
      {
        name: "CEA CO₂ Baseline Database",
        governs: "India's national grid emission factor, the basis for Scope 2 (purchased electricity).",
        builtAgainst: "Version 21.0, Nov 2025 (FY 2024-25), grid factor 0.710 kgCO₂/kWh",
        usedIn: "Scope 2 in the GHG calculators (P6-E1, P6-E7)",
        href: "https://cea.nic.in/wp-content/uploads/baseline/2025/12/User_Guide_V_21.0.pdf",
      },
      {
        name: "IPCC 2006 Guidelines, Vol. 2 (Energy)",
        governs: "Fuel CO₂ emission factors and net calorific values for Scope 1 and energy intensity.",
        builtAgainst: "2006 Guidelines, Tables 1.2 & 1.4 (with GHG Protocol Corporate Standard)",
        usedIn: "Scope 1 fuel inputs and energy-intensity in the GHG calculators",
        href: "https://www.ipcc-nggip.iges.or.jp/public/2006gl/",
      },
    ],
  },
  {
    heading: "International frameworks",
    blurb: "The crosswalk, how each BRSR disclosure maps outward. Collect once, report across all.",
    items: [
      {
        name: "GRI Standards",
        governs: "Global Reporting Initiative disclosures mapped to BRSR.",
        builtAgainst: "GRI Universal + Topic Standards",
        usedIn: "Alignment → Reporting frameworks",
        href: "https://www.globalreporting.org/standards/",
      },
      {
        name: "TCFD Recommendations",
        governs: "Climate-related financial disclosure pillars mapped to BRSR.",
        builtAgainst: "TCFD final recommendations (now under ISSB)",
        usedIn: "Alignment → Reporting frameworks",
        href: "https://www.fsb-tcfd.org/",
      },
      {
        name: "IFRS S1 & S2 (ISSB)",
        governs: "Sustainability and climate disclosure standards mapped to BRSR.",
        builtAgainst: "IFRS S1 General Requirements + IFRS S2 Climate",
        usedIn: "Alignment → Reporting frameworks",
        href: "https://www.ifrs.org/issued-standards/ifrs-sustainability-standards-navigator/",
      },
      {
        name: "MSCI ESG Ratings",
        governs: "MSCI ESG Key Issues crosswalked to BRSR principles.",
        builtAgainst: "MSCI ESG Ratings methodology (Key Issues)",
        usedIn: "Alignment → ESG ratings",
        href: "https://www.msci.com/our-solutions/esg-investing/esg-ratings",
      },
      {
        name: "S&P Global CSA / DJSI",
        governs: "S&P Global Corporate Sustainability Assessment criteria crosswalked to BRSR.",
        builtAgainst: "S&P Global CSA (DJSI) criteria",
        usedIn: "Alignment → ESG ratings",
        href: "https://www.spglobal.com/esg/csa/",
      },
    ],
  },
];

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function SourceCard({ s }: { s: Source }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)]
      hover:border-stone-300 transition-[border-color] duration-150">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold text-stone-900 leading-snug">{s.name}</p>
        {s.href ? (
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 flex-shrink-0 text-[11.5px] font-medium
              text-brand-700 hover:text-brand-800 pressable"
          >
            View source
            <ExternalIcon className="text-stone-400" />
          </a>
        ) : s.restricted ? (
          <span
            title="Distribution-restricted document, cited for traceability, deliberately not hosted or copied."
            className="inline-flex items-center flex-shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em]
              text-stone-500 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5"
          >
            Cited · not hosted
          </span>
        ) : null}
      </div>

      <p className="text-[13.5px] text-stone-600 mt-1.5 leading-relaxed">{s.governs}</p>

      <div className="mt-3 pt-3 border-t border-stone-100 space-y-1.5">
        <MetaRow label="Built against" value={s.builtAgainst} />
        <MetaRow label="Used in" value={s.usedIn} />
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="flex-shrink-0 w-[88px] text-[10px] font-bold uppercase tracking-[0.1em] text-stone-500">{label}</span>
      <span className="text-[13px] text-stone-600 leading-snug">{value}</span>
    </div>
  );
}

export default function SourcesPanel() {
  return (
    <div className="space-y-5">

      {/* Title */}
      <ViewHeader
        tabId="sources"
        title="Sources & methodology"
        subtitle="Every disclosure, factor and mapping in this kit traces to a primary source. Each links to the live authoritative document, never a hosted copy, so the reference stays current."
      />

      {/* Source groups */}
      {GROUPS.map((g) => (
        <section key={g.heading} className="space-y-3">
          <div>
            <h2 className="text-[17px] font-bold text-stone-900">{g.heading}</h2>
            <p className="text-[13px] text-stone-600 mt-0.5">{g.blurb}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {g.items.map((s) => <SourceCard key={s.name} s={s} />)}
          </div>
        </section>
      ))}

      {/* How we keep this honest */}
      <div className="bg-stone-50 border border-stone-200 rounded-xl p-5">
        <h3 className="text-[13.5px] font-semibold text-stone-800">How we keep this honest</h3>
        <ul className="mt-2.5 space-y-2 text-[12.5px] text-stone-600 leading-relaxed">
          <li className="flex gap-2.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span><strong className="font-semibold text-stone-700">Cited and versioned.</strong> The regulatory
              skeleton (108 Section-C fields + Sections A/B) is reconciled against the official SEBI format and ICAI
              Background Material, the counts match exactly.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
            <span><strong className="font-semibold text-stone-700">Refreshed annually.</strong> The CEA grid factor
              is the one number that drifts each year. We track the latest CEA release (next: Version 22.0, expected
              end-2026) and update it before it goes stale.</span>
          </li>
          <li className="flex gap-2.5">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-stone-400 flex-shrink-0" />
            <span><strong className="font-semibold text-stone-700">Interpretive where noted.</strong> The
              compliance-overlap logic and the framework / ratings crosswalks are our reasoned mapping, not an
              official one-to-one. For a high-stakes filing, confirm the specific mapping against the primary source.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
