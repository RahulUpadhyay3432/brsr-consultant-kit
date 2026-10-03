"use client";

import { useMemo, useState } from "react";
import { downloadCsv, exportFilename } from "@/lib/export";
import {
  FACTOR_GROUPS, ALL_FACTORS, SCOPES, matchesQuery, factorCsvRows,
  type Scope, type FactorEntry,
} from "@/lib/emission-factor-index";

const SCOPE_TONE: Record<Scope, string> = {
  "Scope 1": "bg-[#FDECE6] text-[#9C3F20] border-[#F6CBBC]",
  "Scope 2": "bg-brand-50 text-brand-800 border-[#CDE2F6]",
  "Scope 3": "bg-[#F1EDFB] text-[#4F3B8C] border-[#DDD4F4]",
};

function Row({ f }: { f: FactorEntry }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="py-3.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full text-left flex items-baseline gap-3 group"
      >
        <span className="flex-1 min-w-0">
          <span className="text-[14.5px] text-ink font-medium leading-snug group-hover:text-brand-700 transition-colors">
            {f.label}
          </span>
          <span className="block text-[12.5px] text-ink-faint leading-relaxed mt-0.5">
            per {f.per} · {f.category}
          </span>
        </span>
        <span className="text-[14px] font-semibold text-ink tabular-nums whitespace-nowrap flex-shrink-0">
          {f.display}
        </span>
        <svg
          className={`w-4 h-4 flex-shrink-0 text-ink-faint transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="mt-3 ml-0 sm:ml-1 pl-3.5 border-l-2 border-[#CDE2F6] space-y-2.5">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-800 mb-1">Primary source</p>
            <p className="text-[13px] text-ink-body leading-relaxed">{f.source}</p>
          </div>
          {f.note && (
            <div>
              <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-800 mb-1">Also published</p>
              <p className="text-[13px] text-ink-body leading-relaxed">{f.note}</p>
            </div>
          )}
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-brand-800 mb-1">
              Where Saaksh computes with it
            </p>
            <p className="text-[13px] text-ink-body leading-relaxed">{f.usedBy.join(" · ")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function FactorTable() {
  const [q, setQ] = useState("");
  const [scope, setScope] = useState<Scope | "all">("all");

  const groups = useMemo(
    () =>
      FACTOR_GROUPS.map((g) => ({
        ...g,
        entries: g.entries.filter((f) => (scope === "all" || f.scope === scope) && matchesQuery(f, q)),
      })).filter((g) => g.entries.length > 0),
    [q, scope],
  );

  const shown = groups.reduce((n, g) => n + g.entries.length, 0);
  const visible = groups.flatMap((g) => g.entries);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search a fuel, a mode, a source — diesel, air, CEA, DEFRA…"
          aria-label="Search emission factors"
          className="flex-1 min-w-0 h-11 px-3.5 text-[15px] text-ink border border-[#CDE2F6] rounded-lg bg-white
            focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400
            transition-[border-color,box-shadow] placeholder:text-ink-faint"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          {(["all", ...SCOPES] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setScope(s)}
              aria-pressed={scope === s}
              className={`chip-spring h-9 px-3 rounded-lg text-[12.5px] font-semibold border transition-colors ${
                scope === s
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-ink-body border-[#CDE2F6] hover:border-brand-400"
              }`}
            >
              {s === "all" ? "All scopes" : s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <p className="text-[13px] text-ink-muted">
          Showing <span className="font-semibold text-ink tabular-nums">{shown}</span> of{" "}
          <span className="tabular-nums">{ALL_FACTORS.length}</span> factors
        </p>
        <button
          type="button"
          onClick={() => downloadCsv(exportFilename("saaksh-emission-factors"), factorCsvRows(visible))}
          disabled={shown === 0}
          className="pressable h-9 px-3.5 rounded-lg bg-forest text-white text-[12.5px] font-semibold
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Download {shown === ALL_FACTORS.length ? "all" : "these"} as CSV
        </button>
      </div>

      {shown === 0 ? (
        <div className="rounded-2xl border border-line bg-white p-8 text-center">
          <p className="text-[14.5px] text-ink-body">
            Nothing matches “{q}”. We publish the factors the product actually computes with, so the set is
            deliberately narrow — if a factor you need is missing, it is missing from our calculators too.
          </p>
        </div>
      ) : (
        <div className="space-y-9">
          {groups.map((g) => (
            <section key={g.title}>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <h3 className="font-editorial font-semibold text-ink text-[1.3rem] leading-tight tracking-[-0.01em]">
                  {g.title}
                </h3>
                <span className={`text-[10.5px] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded-full border ${SCOPE_TONE[g.scope]}`}>
                  {g.scope}
                </span>
              </div>
              <p className="text-[13.5px] text-ink-muted leading-relaxed mb-4 max-w-[640px]">{g.blurb}</p>
              <div className="rounded-2xl border border-line bg-white px-5 sm:px-6 py-1.5 shadow-elev-1 divide-y divide-line-soft">
                {g.entries.map((f) => (
                  <Row key={f.key} f={f} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
