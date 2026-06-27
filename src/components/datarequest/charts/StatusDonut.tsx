// A status donut, pure inline SVG, no dependency. Each segment is an arc whose
// length is proportional to its value; a center label shows the headline figure.
// Reduced-motion safe (static stroke, no animation). Colors are passed in by the
// caller (so it stays presentational + matches the Clean Forest status palette).

export interface DonutSegment {
  value: number;
  color: string;
  label: string;
}

export default function StatusDonut({
  segments,
  centerLabel,
  centerSub,
  size = 132,
}: {
  segments: DonutSegment[];
  centerLabel?: string;
  centerSub?: string;
  size?: number;
}) {
  const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
  const stroke = Math.round(size * 0.12);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const cx = size / 2;
  const cy = size / 2;

  // Build the arcs as stroke-dash offsets around the ring.
  let acc = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((seg, i) => {
      const frac = total > 0 ? seg.value / total : 0;
      const dash = frac * c;
      const offset = c * (1 - acc);
      acc += frac;
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${c - dash}`}
          strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      );
    });

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E9F0" strokeWidth={stroke} />
          {total > 0 && arcs}
        </svg>
        {(centerLabel || centerSub) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            {centerLabel && <span className="text-[24px] font-bold text-ink leading-none tabular-nums">{centerLabel}</span>}
            {centerSub && <span className="text-[11.5px] text-ink-muted mt-1 uppercase tracking-[0.08em]">{centerSub}</span>}
          </div>
        )}
      </div>
      <ul className="space-y-1.5 min-w-0">
        {segments.map((seg, i) => (
          <li key={i} className="flex items-center gap-2 text-[13.5px]">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-ink-body truncate">{seg.label}</span>
            <span className="text-ink-body tabular-nums ml-auto pl-2">{seg.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
