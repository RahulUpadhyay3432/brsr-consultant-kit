// Collect campaign summary band — a row of stat tiles surfacing the same figures
// the detail page already computes (collection progress, owners, evidence,
// emissions). Presentational only; every number is passed in, nothing fabricated.
// The progress ring is a lightweight inline SVG (no library) and is purely a visual
// echo of the same percentage shown as text, so it's reduced-motion safe by default.
import AnimatedNumber from "@/components/AnimatedNumber";

function ProgressRing({ pct }: { pct: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c * (1 - clamped / 100);
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" className="flex-shrink-0 -rotate-90" aria-hidden="true">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#E5E9F0" strokeWidth="4" />
      <circle
        cx="20" cy="20" r={r} fill="none" stroke="#1E9DF2" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={offset}
      />
    </svg>
  );
}

function Tile({
  label, children, ring,
}: { label: string; children: React.ReactNode; ring?: React.ReactNode }) {
  return (
    <div className="bg-white border border-line rounded-xl px-4 py-3.5 shadow-[0_1px_2px_rgba(16,33,26,0.05)] flex items-center gap-3">
      {ring}
      <div className="min-w-0">
        <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export default function CollectionSummary({
  received, total, owners, withEvidence, emissions,
}: {
  received: number;
  total: number;
  owners: number;
  withEvidence: number;
  emissions?: number;
}) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0;
  return (
    <div className={`mt-5 grid gap-3 ${emissions != null ? "sm:grid-cols-4" : "sm:grid-cols-3"} grid-cols-2`}>
      <Tile label="Collected" ring={<ProgressRing pct={pct} />}>
        <p className="text-[24px] font-bold leading-none text-ink tabular-nums">
          <AnimatedNumber value={pct} />%
        </p>
        <p className="text-[13px] text-ink-body mt-1 tabular-nums">{received}/{total} data points</p>
      </Tile>

      <Tile label="Data owners">
        <p className="text-[24px] font-bold leading-none text-ink tabular-nums">
          <AnimatedNumber value={owners} />
        </p>
        <p className="text-[13px] text-ink-body mt-1">{owners === 1 ? "person" : "people"}</p>
      </Tile>

      <Tile label="Evidence">
        <p className="text-[24px] font-bold leading-none text-ink tabular-nums">
          <AnimatedNumber value={withEvidence} />
        </p>
        <p className="text-[13px] text-ink-body mt-1">{withEvidence === 1 ? "document" : "documents"} attached</p>
      </Tile>

      {emissions != null && (
        <Tile label="Emissions">
          <p className="text-[24px] font-bold leading-none text-ink tabular-nums">
            <AnimatedNumber value={emissions} decimals={1} />
          </p>
          <p className="text-[13px] text-ink-body mt-1">tCO₂e total</p>
        </Tile>
      )}
    </div>
  );
}
