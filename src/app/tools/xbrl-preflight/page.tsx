"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
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
          <p className="text-[13px] font-semibold text-ink leading-snug">Rupee-scale converter</p>
          <p className="text-[11.5px] text-ink-muted leading-snug hidden sm:block">
            The XBRL taxonomy wants absolute rupees. Convert Lakhs / Crores before you type.
          </p>
        </div>
        <span className="text-[10px] font-semibold text-brand-700 bg-white border border-[#CDE2F6] px-2 py-0.5 rounded-full flex-shrink-0">
          Free tool · on-device
        </span>
      </div>

      <div className="px-5 py-5">
        <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
          <div>
            <label className="block text-[11.5px] font-bold text-brand-800 uppercase tracking-[0.04em] mb-1.5">
              Amount as entered in the accounts
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="e.g. 500"
              className="w-full h-10 px-3 text-[15px] font-mono text-ink border border-[#CDE2F6] rounded-lg
                bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
                transition-[border-color,box-shadow] placeholder:text-ink-faint"
            />
          </div>
          <div className="flex gap-1 bg-band rounded-lg p-0.5">
            {SCALES.map((s) => (
              <button key={s} onClick={() => setScale(s)}
                className={`text-[12.5px] font-medium px-2.5 py-2 rounded-md transition-colors ${scale === s ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}>
                {SCALE_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#CDE2F6] bg-[#EAF4FE] px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-brand-700 mb-1">
            Enter this in the numeric XBRL cell
          </p>
          {show ? (
            <p className="text-[26px] font-bold text-ink tabular-nums leading-none font-mono">
              {formatInr(absolute)}
              <span className="text-[13px] font-sans font-normal text-ink-muted ml-2">₹ (absolute)</span>
            </p>
          ) : (
            <p className="text-[15px] text-ink-muted">Type an amount to see the absolute-rupee value.</p>
          )}
          {show && (
            <p className="text-[11.5px] text-ink-faint mt-2 leading-snug">
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
        <span className="flex-1 text-[14px] font-semibold text-ink leading-snug">{title}</span>
        <svg className={`w-4 h-4 text-ink-faint flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="min-h-0">
          <div className="px-4 pb-4 pl-[52px] space-y-2.5">
            <p className="text-[13.5px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-ink">Why it fails: </span>{why}
            </p>
            <p className="text-[13.5px] text-ink-muted leading-relaxed">
              <span className="font-semibold text-[#0E7A56]">Fix: </span>{fix}
            </p>
            <p className="text-[11.5px] text-ink-faint leading-snug pt-1 border-t border-line-soft">
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
      <SiteHeader active="tools" />
      <main className="flex-1">
        <div className="bg-[#0F1E33]">
          <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-10">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
              Filing &amp; audit tools · on-device
            </p>
            <h1 className="font-display font-bold text-[2rem] sm:text-[2.5rem] text-white leading-[1.1] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
              Get your BRSR XBRL accepted the first time
            </h1>
            <p className="text-[15px] text-[#9FB0C4] leading-relaxed mt-3 max-w-[620px]">
              A rupee-scale converter plus the recurring data-entry mistakes that get a BRSR XBRL filing bounced by the exchange utility. Not a full taxonomy validator: this catches the common human errors, so you fix them before you upload.
            </p>
          </div>
        </div>

        <div className="anim-up-sm max-w-[860px] mx-auto px-5 sm:px-8 py-10 space-y-8">
          <Converter />

          <div>
            <h2 className="font-display font-bold text-[1.35rem] text-ink mb-1.5">Pre-flight checklist</h2>
            <p className="text-[13.5px] text-ink-muted leading-relaxed mb-4 max-w-[640px]">
              Clear each of these before generating the instance document. They are the mistakes that most often trip the validation, ordered by how frequently they appear.
            </p>
            <div className="space-y-2.5">
              {preflight.checks.map((c, i) => (
                <CheckItem key={c.id} n={i + 1} title={c.title} why={c.why} fix={c.fix} source={c.source} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-band px-4 py-4">
            <p className="text-[12.5px] text-ink-muted leading-relaxed">
              {preflight._meta.note}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 pt-3 border-t border-line-soft">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">Sources</span>
              {preflight._meta.sources.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer"
                  className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-line hover:decoration-brand-500 transition-colors">
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>

          <p className="text-[12.5px] text-ink-faint leading-relaxed">
            For the full 108-field gap analysis on your client, run the{" "}
            <Link href="/start" className="text-brand-700 font-medium underline decoration-line hover:decoration-brand-500">free readiness report</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
