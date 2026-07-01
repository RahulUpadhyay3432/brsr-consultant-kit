"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import EmissionsCalculator from "@/components/checklist/EmissionsCalculator";
import { DEFAULT_CALC_INPUTS, type CalcInputs } from "@/lib/emissions-calculator";

const MODES = [
  { id: "ghg" as const, label: "Scope 1 & 2 GHG", hint: "Direct + purchased electricity, tCO₂e" },
  { id: "energy" as const, label: "Energy", hint: "Total consumption + intensity, GJ" },
  { id: "water" as const, label: "Water", hint: "Withdrawal + intensity, kL" },
];

export default function GhgCalculatorPage() {
  const [inputs, setInputs] = useState<CalcInputs>(DEFAULT_CALC_INPUTS);
  const [mode, setMode] = useState<"ghg" | "energy" | "water">("ghg");

  const onChange = (key: keyof CalcInputs, value: string) =>
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
              GHG, energy & water calculator
            </h1>
            <p className="text-[15.5px] text-ondark-muted leading-relaxed mt-3 max-w-[600px]">
              Scope 1 & 2 emissions, total energy, and water withdrawal, from activity data. CEA grid factor v21.0, IPCC 2006 fuel factors, every figure cited. Nothing leaves your browser.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="anim-up-sm max-w-[860px] mx-auto px-5 sm:px-8 py-10">
          {/* Mode tabs */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {MODES.map((m) => (
              <button key={m.id} onClick={() => setMode(m.id)}
                className={`text-left px-3.5 py-2 rounded-xl border transition-colors ${mode === m.id ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-muted border-line hover:border-brand-300"}`}>
                <span className="block text-[13.5px] font-semibold">{m.label}</span>
                <span className={`block text-[11px] ${mode === m.id ? "text-white/80" : "text-ink-faint"}`}>{m.hint}</span>
              </button>
            ))}
          </div>

          <EmissionsCalculator mode={mode} inputs={inputs} onChange={onChange} />

          <p className="text-[12.5px] text-ink-faint leading-relaxed mt-6">
            A screening calculation from the figures you enter. For all 108 BRSR fields gap-analysed for your client, run the{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
