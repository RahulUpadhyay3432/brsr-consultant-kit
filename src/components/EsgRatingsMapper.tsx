"use client";

import ratingsData from "@/data/esg_ratings_mapping.json";

interface RatingMapping {
  brsr_principle: string;
  principle_name: string;
  msci_pillar: string;
  msci_key_issues: string[];
  djsi_dimension: string;
  djsi_criteria: string[];
  note: string;
}

const DATA = ratingsData as {
  ratings: { msci: { name: string; what: string }; djsi: { name: string; what: string } };
  mappings: RatingMapping[];
};

export default function EsgRatingsMapper() {
  const { mappings, ratings } = DATA;
  const msciIssues = mappings.reduce((n, m) => n + m.msci_key_issues.length, 0);
  const djsiCriteria = mappings.reduce((n, m) => n + m.djsi_criteria.length, 0);

  return (
    <div className="space-y-5">

      {/* ── What is this? ─────────────────────────────────────────────────── */}
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-white rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-700" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 1.5l1.6 3.4 3.7.5-2.7 2.6.7 3.7-3.3-1.8-3.3 1.8.7-3.7L2 5.4l3.7-.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-800">What is this? — ESG Ratings Alignment</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              If your client is rated by <strong className="text-stone-700">MSCI</strong> or submits to the{" "}
              <strong className="text-stone-700">S&P Global CSA / DJSI</strong> (common for large listed companies and
              global investors), the BRSR data they're already collecting feeds those ratings too. This shows{" "}
              <strong className="text-stone-700">which BRSR principle supports which rating dimension</strong> — so the
              same data collection effort strengthens their rating submission.
            </p>
            <p className="text-[11px] text-stone-500 mt-2">
              Mapped at the principle level — the granularity at which MSCI and DJSI actually assess companies (by issue
              and criterion, not by individual disclosure line).
            </p>
          </div>
        </div>
      </div>

      {/* ── Rating definition cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white border border-violet-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              MSCI
            </span>
            <span className="text-sm font-semibold text-stone-800">{ratings.msci.name}</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">{ratings.msci.what}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              DJSI
            </span>
            <span className="text-sm font-semibold text-stone-800">{ratings.djsi.name}</span>
          </div>
          <p className="text-xs text-stone-500 leading-relaxed">{ratings.djsi.what}</p>
        </div>
      </div>

      {/* ── Crosswalk count chips ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap text-[11px]">
        <span className="text-stone-400">Across all 9 BRSR principles:</span>
        <span className="font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
          {msciIssues} MSCI Key Issues
        </span>
        <span className="font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
          {djsiCriteria} DJSI / CSA Criteria
        </span>
      </div>

      {/* ── Principle-by-principle crosswalk ──────────────────────────────── */}
      <div className="space-y-2.5">
        {mappings.map((m) => (
          <div key={m.brsr_principle} className="border border-stone-200 rounded-xl bg-white overflow-hidden">
            {/* Principle header */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border-b border-stone-100">
              <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-white border border-stone-200 text-stone-600">
                {m.brsr_principle}
              </span>
              <span className="text-sm font-semibold text-stone-700">{m.principle_name}</span>
            </div>

            <div className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
              {/* MSCI column */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-violet-700 mb-1.5">
                  MSCI Key Issues
                  <span className="font-normal text-stone-400 normal-case tracking-normal"> · {m.msci_pillar} pillar</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {m.msci_key_issues.map((k, i) => (
                    <span key={i} className="text-[11px] font-medium text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded">
                      {k}
                    </span>
                  ))}
                </div>
              </div>

              {/* DJSI column */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-amber-700 mb-1.5">
                  DJSI / S&P CSA Criteria
                  <span className="font-normal text-stone-400 normal-case tracking-normal"> · {m.djsi_dimension}</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {m.djsi_criteria.map((c, i) => (
                    <span key={i} className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Note */}
            <p className="px-4 pb-3 text-xs text-stone-500 leading-relaxed">{m.note}</p>
          </div>
        ))}
      </div>

      {/* ── Disclaimer ────────────────────────────────────────────────────── */}
      <p className="text-[11px] text-stone-400 leading-relaxed">
        MSCI Key Issues are scored 7–15 per sub-industry, so not every issue applies to every client. Criterion names
        follow the latest published MSCI ESG Ratings and S&P Global CSA methodologies; both providers update these
        annually. Use this as a directional guide for which BRSR data supports each rating, not as the rating itself.
      </p>
    </div>
  );
}
