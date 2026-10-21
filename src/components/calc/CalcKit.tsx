"use client";
// Shared building blocks for every calculator (GHG/energy/water, Scope 3, PPP, XBRL).
// Frost surfaces from globals.css: panels are `.glass` on a `.calc-stage`, inputs are
// `.field-glass` with the unit inside. Values stay strings so persisted inputs keep
// their shape.
import type { ReactNode } from "react";

// Digits and a single decimal point. Typing "1,00,000" yields 100000; "e", "-" and a
// second "." are dropped (the old type="number" accepted "e" and changed the value on
// mouse-wheel scroll).
export function sanitizeDecimal(v: string): string {
  const cleaned = v.replace(/[^0-9.]/g, "");
  const dot = cleaned.indexOf(".");
  return dot === -1 ? cleaned : cleaned.slice(0, dot + 1) + cleaned.slice(dot + 1).replace(/\./g, "");
}

// The factor JSON spells units out ("litres", "passenger-km"); the field shows them short.
export function shortUnit(u: string): string {
  if (u === "litres" || u === "litre") return "L";
  if (u === "passenger-km") return "p·km";
  if (u === "tonne-km") return "t·km";
  if (u === "tonne") return "t";
  return u;
}

export function CalcPanel({
  title, eyebrow, aside, level = 3, compact = false, className = "", children,
}: {
  title?: ReactNode;
  eyebrow?: string;
  aside?: ReactNode;
  level?: 2 | 3;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const H = level === 2 ? "h2" : "h3";
  return (
    <section className={`glass rounded-3xl ${compact ? "p-5" : "p-5 sm:p-7"} ${className}`}>
      {(title || aside) && (
        <div className={`flex items-start justify-between gap-4 ${compact ? "mb-4" : "mb-5"}`}>
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700 mb-1">{eyebrow}</p>
            )}
            {title && (
              <H className={`font-serif-display text-ink leading-snug ${compact ? "text-[18px]" : "text-[19px] sm:text-[21px]"}`}>
                {title}
              </H>
            )}
          </div>
          {aside}
        </div>
      )}
      {children}
    </section>
  );
}

export function NumberField({
  label, unit, value, onChange, hint, placeholder = "0",
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  hint?: ReactNode;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13.5px] font-medium text-ink leading-snug">{label}</span>
      <span className="field-glass mt-1.5 flex h-11 items-center gap-2 rounded-xl px-3.5">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(sanitizeDecimal(e.target.value))}
          className="w-full min-w-0 bg-transparent text-[15.5px] tabular-nums text-ink outline-none placeholder:text-ink-faint/50"
        />
        <span className="shrink-0 text-[12px] font-semibold text-ink-muted whitespace-nowrap">{shortUnit(unit)}</span>
      </span>
      {hint && <span className="mt-1 block text-[12px] text-ink-muted leading-snug">{hint}</span>}
    </label>
  );
}

// Rows of a result panel; wrap them in <ResultList> so dividers sit between rows.
export function ResultList({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-[#D6E6F7]">{children}</div>;
}

export function ResultRow({
  label, value, unit, sub, note, strong = false, muted = false, indent = false,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  note?: ReactNode;
  strong?: boolean;
  muted?: boolean;
  indent?: boolean;
}) {
  return (
    <div className={`${strong ? "py-4" : "py-2.5"} ${indent ? "pl-4" : ""}`}>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className={strong ? "text-[14.5px] font-semibold text-ink" : muted ? "text-[13px] text-ink-muted" : "text-[13.5px] text-ink-body"}>
            {label}
          </p>
          {sub && <p className="mt-0.5 text-[12px] text-ink-muted leading-snug">{sub}</p>}
        </div>
        <p className={`shrink-0 text-right tabular-nums whitespace-nowrap ${
          strong ? "font-serif-display text-[28px] leading-none text-ink"
            : muted ? "text-[13px] text-ink-muted"
            : "text-[14px] font-medium text-ink"}`}>
          {value}
          {unit && value !== "—" && <span className="font-sans ml-1.5 text-[11.5px] font-normal text-ink-muted">{unit}</span>}
        </p>
      </div>
      {note && <p className="mt-1 text-[11.5px] text-ink-muted leading-snug">{note}</p>}
    </div>
  );
}

export function Citation({ source }: { source: ReactNode }) {
  return (
    <p className="text-[12px] leading-relaxed text-ink-muted">
      <span className="font-semibold text-brand-700">Source:</span> {source}
    </p>
  );
}

export function FactorLogItem({ label, value, source }: { label: string; value: string; source: ReactNode }) {
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] text-ink">{label}</span>
        <span className="shrink-0 text-[13px] font-semibold tabular-nums text-brand-700 text-right">{value}</span>
      </div>
      <div className="mt-1"><Citation source={source} /></div>
    </div>
  );
}

// Factor log: every factor in play with its published source. `collapsible` keeps it
// one line tall inside a report row until opened.
export function FactorLog({
  items, footer, collapsible = false, compact = false,
}: {
  items: Array<{ key: string; label: string; value: string; source: ReactNode }>;
  footer?: ReactNode;
  collapsible?: boolean;
  compact?: boolean;
}) {
  const body = (
    <>
      <div className="divide-y divide-[#D6E6F7]">
        {items.map((it) => <FactorLogItem key={it.key} label={it.label} value={it.value} source={it.source} />)}
      </div>
      {footer && <div className="mt-3 border-t border-[#D6E6F7] pt-3 text-[12px] text-ink-muted leading-relaxed">{footer}</div>}
    </>
  );
  if (!collapsible) return <CalcPanel title="Factor log" compact={compact}>{body}</CalcPanel>;
  return (
    <details className="glass group/log rounded-3xl p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="font-serif-display text-[18px] text-ink">
          Factor log <span className="font-sans text-[12.5px] text-ink-muted ml-1">{items.length} factors, each with its source</span>
        </span>
        <svg className="h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 group-open/log:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="mt-2">{body}</div>
    </details>
  );
}

// Pill toggle on frost; the active pill is raised with a specular sheen.
export function SegmentedTabs<T extends string>({
  options, value, onChange, ariaLabel, full = false,
}: {
  options: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  full?: boolean;
}) {
  return (
    <div role="group" aria-label={ariaLabel} className={`glass-soft gap-1 rounded-2xl p-1 ${full ? "flex w-full" : "inline-flex max-w-full overflow-x-auto"}`}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.id)}
            className={`pressable whitespace-nowrap rounded-xl px-4 py-2 text-[13.5px] font-semibold ${full ? "flex-1" : ""} ${
              on ? "bg-white glass-sheen text-brand-700" : "text-ink-muted hover:text-ink"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
