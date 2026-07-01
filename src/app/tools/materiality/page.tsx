"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import MaterialityMatrix from "@/components/MaterialityMatrix";
import { materialityTopicsForIndustry } from "@/lib/report-generator";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";

export default function MaterialityToolPage() {
  const [industry, setIndustry] = useState<IndustryType>("textile_and_apparel");
  const topics = useMemo(() => materialityTopicsForIndustry(industry), [industry]);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />
      <main className="flex-1">
        {/* Dark navy hero */}
        <div className="bg-[#0F1E33]">
          <div className="max-w-[1100px] mx-auto px-5 sm:px-8 py-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
              Free tool · on-device
            </p>
            <h1 className="font-display font-bold text-[2rem] sm:text-[2.5rem] text-white leading-[1.1] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              Materiality matrix builder
            </h1>
            <p className="text-[15px] text-[#9FB0C4] leading-relaxed mt-3 max-w-[600px]">
              Start from the ESG topics that typically matter most in your client&apos;s industry, shortlist them, and export as a CSV to carry into a stakeholder process. A starting format, not a finished assessment.
            </p>
          </div>
        </div>

        <div className="anim-up-sm max-w-[1100px] mx-auto px-5 sm:px-8 py-10">
          {/* Industry selector */}
          <div className="mb-6">
            <p className="text-[13px] font-semibold text-ink mb-2">Industry</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.entries(INDUSTRY_LABELS) as [IndustryType, string][]).map(([key, label]) => (
                <button key={key} onClick={() => setIndustry(key)}
                  className={`text-[12.5px] font-medium px-3 py-1.5 rounded-full border transition-colors ${industry === key ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <MaterialityMatrix key={industry} topics={topics} />

          <p className="text-[12.5px] text-ink-faint leading-relaxed mt-6">
            Suggested topics by industry. Your client&apos;s actual material topics must come from their own stakeholder engagement. Run the{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>{" "}
            to see materiality alongside the full BRSR gap analysis.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
