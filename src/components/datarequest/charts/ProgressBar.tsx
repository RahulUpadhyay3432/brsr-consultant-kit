// A mint horizontal progress bar on a track. Pure inline SVG-free (CSS width),
// reduced-motion safe (the width transition is short + respects the global rule).
// value/total drive the fill; an optional label sits above with the count.
export default function ProgressBar({
  value,
  total,
  label,
}: {
  value: number;
  total: number;
  label?: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="text-[13px] font-medium text-ink-body">{label}</span>
          <span className="text-[13px] text-ink-body tabular-nums whitespace-nowrap">
            {value}/{total} · {pct}%
          </span>
        </div>
      )}
      <div
        className="h-2 rounded-full bg-line overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "collection progress"}
      >
        <div
          className="h-full rounded-full bg-brand-500 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
