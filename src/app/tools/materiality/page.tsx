"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import MaterialityMatrix from "@/components/MaterialityMatrix";
import { materialityTopicsForIndustry } from "@/lib/report-generator";
import { INDUSTRY_LABELS, type IndustryType } from "@/lib/types";

export default function MaterialityToolPage() {
  const [industry, setIndustry] = useState<IndustryType>("textile_and_apparel");
  const topics = useMemo(() => materialityTopicsForIndustry(industry), [industry]);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="tools"
          eyebrow="Free tool · on-device"
          title="Materiality matrix builder"
          subtitle="Start from the ESG topics that typically matter most in your client's industry, shortlist them, and export a CSV to carry into a stakeholder process. A starting format, not a finished assessment."
          benefits={[
            "Industry-specific suggested topics, grouped E / S / G",
            "Shortlist and export to seed the stakeholder process",
            "Honest framing: a starting point, not a determination",
          ]}
          maxWidth={1100}
        />

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

        <ToolLearn
          title="What materiality actually means"
          intro="Materiality is how you decide which ESG issues are worth reporting and managing. It's the backbone of a credible BRSR narrative, and the one step consultants most often shortcut. Here's what it involves."
          items={[
            { icon: "layers", title: "Single vs double materiality", body: "Financial materiality asks what ESG issues affect the company's value. Impact materiality asks what the company does to people and the environment. BRSR and global frameworks increasingly expect both, the 'double' view." },
            { icon: "grid", title: "The two axes", body: "A matrix plots each topic on significance of impact against influence on stakeholder decisions or enterprise value. Topics in the top-right are where reporting and management effort should concentrate." },
            { icon: "users", title: "A shortlist isn't an assessment", body: "A real assessment needs stakeholder engagement, surveys, interviews, and management input. This tool gives a defensible starting shortlist by industry; the client's own process turns it into a determination." },
            { icon: "doc", title: "What BRSR asks", body: "BRSR doesn't mandate a matrix, but it expects you to identify material ESG issues and explain how they're managed. Each shortlisted topic maps to the BRSR principles it touches, so nothing gets missed." },
          ]}
          maxWidth={1100}
        />
      </main>
      <BlogFooter />
    </div>
  );
}
