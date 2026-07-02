"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { ToolLearn } from "@/components/tools/ToolLearn";
import preflight from "@/data/xbrl_preflight.json";
import {
  parseAmount, toAbsoluteInr, formatInr,
  SCALE_LABEL, type Scale,
} from "@/lib/xbrl-units";

const SCALES: Scale[] = ["crore", "lakh", "absolute"];

function Converter() {
  const [raw, setRaw] = useState("");
  const [scale, setScale] = useState<Scale>("crore");
  const amount = parseAmount(raw);
  const absolute = toAbsoluteInr(amount, scale);
  const show = raw.trim() !== "" && amount > 0;

  return (
    <div className="border border-[#CDE2F6] rounded-2xl shadow-[0_1px_6px_rgba(15,30,51,0.08)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-[#EAF4FE] border-b border-[#CDE2F6]">
        <div className="w-7 h-7 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-3.5 h-3.5 text-brand-600" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 5h11M2 10h11M6 2l-1 11M10 2l-1 11" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-semibold text-ink leading-snug">Rupee-scale converter</p>
          <p className="text-[13px] text-ink-muted leading-snug hidden sm:block">
            The XBRL taxonomy wants absolute rupees. Convert Lakhs / Crores before you type.
          </p>
        </div>
      </div>

      <div className="px-5 py-5">
        <label className="block text-[11px] font-bold text-brand-800 uppercase tracking-[0.05em] mb-1.5">
          Amount as entered in the accounts
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="e.g. 500"
          className="w-full h-11 px-3 text-[16px] font-mono text-ink border border-[#CDE2F6] rounded-lg
            bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
            transition-[border-color,box-shadow] placeholder:text-ink-faint"
        />
        <div className="flex gap-1 bg-band rounded-lg p-0.5 mt-2.5">
          {SCALES.map((s) => (
            <button key={s} onClick={() => setScale(s)}
              className={`flex-1 text-[13px] font-medium px-2.5 py-2 rounded-md transition-colors ${scale === s ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}>
              {SCALE_LABEL[s]}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#CDE2F6] bg-[#EAF4FE] px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700 mb-1.5">
            Enter this in the numeric XBRL cell
          </p>
          {show ? (
            <p className="text-[27px] font-bold text-ink tabular-nums leading-none font-mono">
              {formatInr(absolute)}
              <span className="text-[13px] font-sans font-normal text-ink-muted ml-2">₹ (absolute)</span>
            </p>
          ) : (
            <p className="text-[14px] text-ink-muted">Type an amount to see the absolute-rupee value.</p>
          )}
          {show && (
            <p className="text-[13px] text-ink-muted mt-2.5 leading-relaxed">
              {formatInr(amount)} {SCALE_LABEL[scale].replace("₹ ", "").replace("Absolute ₹", "rupees")} = {formatInr(absolute)} rupees. Never enter the value in Lakhs or Crores directly.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckItem({ n, title, why, fix, source }: {
  n: number; title: string; why: string; fix: string; source: string;
}) {
  const [open, setOpen] = useState(n === 1);
  return (
    <div className="border border-line rounded-xl bg-white overflow-hidden">
      <button onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-band transition-colors">
        <span className="w-6 h-6 rounded-full bg-brand-50 border border-[#CDE2F6] text-brand-700 text-[12px] font-mono font-semibold flex items-center justify-center flex-shrink-0">
          {n}
        </span>
        <span className="flex-1 text-[14.5px] font-semibold text-ink leading-snug">{title}</span>
        <svg className={`w-4 h-4 text-ink-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0">
          <div className="px-4 pb-4 pl-[52px] space-y-2.5">
            <p className="text-[14px] text-ink-body leading-relaxed">
              <span className="font-semibold text-ink">Why it fails: </span>{why}
            </p>
            <p className="text-[14px] text-ink-body leading-relaxed">
              <span className="font-semibold text-[#0E7A56]">Fix: </span>{fix}
            </p>
            <p className="text-[13px] text-ink-body leading-relaxed pt-2 border-t border-line-soft">
              Source: {source}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function XbrlPreflightPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          eyebrow="Filing & audit tools · on-device"
          title="Get your BRSR XBRL accepted the first time"
          subtitle="A rupee-scale converter plus the recurring data-entry mistakes that get a BRSR XBRL filing bounced by the exchange utility. Fix them before you upload."
          benefits={[
            "Convert Lakhs or Crores to the absolute rupees the taxonomy expects",
            "Clear the 7 errors that most often fail validation, each cited",
            "No taxonomy software needed, nothing leaves your browser",
          ]}
          whoFor="For the consultant preparing the instance document, right before the BSE / NSE upload. Not a full taxonomy validator; it catches the common human errors."
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1120 }}>
          <div className="grid lg:grid-cols-[minmax(0,400px)_1fr] gap-8 lg:gap-10 items-start">
            {/* Converter, sticky on desktop */}
            <div className="lg:sticky lg:top-24">
              <Converter />
            </div>

            {/* Checklist */}
            <div>
              <h2 className="font-display font-bold text-[1.4rem] text-ink mb-1.5">The 7 checks before you upload</h2>
              <p className="text-[14px] text-ink-muted leading-relaxed mb-4 max-w-[640px]">
                Clear each of these before generating the instance document. They are the mistakes that most often trip the validation, ordered by how frequently they appear.
              </p>
              <div className="space-y-2.5">
                {preflight.checks.map((c, i) => (
                  <CheckItem key={c.id} n={i + 1} title={c.title} why={c.why} fix={c.fix} source={c.source} />
                ))}
              </div>

              <div className="rounded-xl border border-line bg-band px-4 py-4 mt-6">
                <p className="text-[13px] text-ink-muted leading-relaxed">
                  {preflight._meta.note}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
                  {preflight._meta.sources.map((s) => (
                    <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                      className="text-[13px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                      {s.label} ↗
                    </a>
                  ))}
                </div>
              </div>

              <p className="text-[13px] text-ink-muted leading-relaxed mt-5">
                For the full 108-field gap analysis on your client, run the{" "}
                <Link href="/start" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">free readiness report</Link>.
              </p>
            </div>
          </div>
        </div>

        <ToolLearn
          title="What XBRL is, and why the exchange cares"
          intro="Most rejections aren't about the ESG content, they're about the format. A quick grasp of what XBRL is and the one convention it enforces prevents almost all of them."
          items={[
            { icon: "tag", title: "A machine-readable filing", body: "XBRL tags every number in your BRSR with a taxonomy label, so software reads 'total energy consumed' the same way across every company. The exchange stores structured data, not a PDF a human has to retype." },
            { icon: "compare", title: "Why SEBI mandates it", body: "Structured filings let SEBI, investors and rating agencies compare thousands of companies automatically and screen for outliers. That's only possible if everyone tags to the same taxonomy, which is why validation is strict." },
            { icon: "ruler", title: "The units convention", body: "Company accounts are kept in Lakhs or Crores, but the numeric XBRL cells expect absolute rupees. Entering 500 where 5,00,00,000 was meant is the single most common bounce. Convert first, every time." },
          ]}
          maxWidth={1120}
        />
      </main>
      <BlogFooter />
    </div>
  );
}
