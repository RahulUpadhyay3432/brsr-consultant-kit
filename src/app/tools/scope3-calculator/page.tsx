"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import Scope3Calculator from "@/components/checklist/Scope3Calculator";
import { DEFAULT_SCOPE3_INPUTS, type Scope3Inputs } from "@/lib/scope3-calculator";

export default function Scope3CalculatorPage() {
  const [inputs, setInputs] = useState<Scope3Inputs>(DEFAULT_SCOPE3_INPUTS);
  const [turnover, setTurnover] = useState("");

  const onChange = (key: string, value: string) =>
    setInputs((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />
      <main className="flex-1">
        {/* Dark navy hero */}
        <div className="bg-[#0F1E33]">
          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
              Free tool · on-device
            </p>
            <h1 className="font-display font-bold text-[2rem] sm:text-[2.5rem] text-white leading-[1.1] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              Scope 3 screening calculator
            </h1>
            <p className="text-[15.5px] text-ondark-muted leading-relaxed mt-3 max-w-[600px]">
              Activity-based Scope 3 estimate across business travel, commuting, transport and waste. GHG Protocol Scope 3 Standard; DEFRA/DESNZ 2024 factors, cited per line. Runs entirely in your browser.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="anim-up-sm max-w-[860px] mx-auto px-5 sm:px-8 py-10">
          {/* Turnover for intensity */}
          <div className="mb-6 rounded-xl border border-[#CDE2F6] bg-[#EAF4FE] p-4 max-w-[360px]">
            <label className="block text-[11px] font-semibold text-brand-700 uppercase tracking-[0.08em] mb-1.5">
              Annual turnover <span className="text-ink-faint normal-case tracking-normal font-normal">, optional, for intensity</span>
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number" min="0" step="any" value={turnover} placeholder="0"
                onChange={(e) => setTurnover(e.target.value)}
                className="flex-1 min-w-0 h-10 px-3 text-[14px] font-mono border border-[#CDE2F6] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 transition-[border-color,box-shadow] placeholder:text-ink-faint"
              />
              <span className="text-[11.5px] text-ink-muted font-mono whitespace-nowrap">₹ crore</span>
            </div>
          </div>

          <Scope3Calculator inputs={inputs} turnoverCrore={turnover} onChange={onChange} />

          <p className="text-[13px] text-ink-body leading-relaxed mt-6">
            A screening estimate. Scope 3 is a voluntary BRSR Leadership indicator, not assurance-grade. For Scope 1 & 2, see the{" "}
            <Link href="/tools/ghg-calculator" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">GHG calculator</Link>, or run the full{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">readiness report</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
