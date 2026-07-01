// The Saaksh brand mark, "Ledger S": three descending rows of cited evidence
// with a blue "verified" pin. Renders the whole tile + glyph as one SVG so every
// call site is identical. `forest` = navy tile with white bars (default);
// `subtle` = translucent tile for dark rails (still white bars).
export function SaakshMark({
  size = 28,
  variant = "forest",
  className,
}: {
  size?: number;
  variant?: "forest" | "subtle";
  className?: string;
}) {
  const tile = variant === "subtle" ? "rgba(255,255,255,0.16)" : "#0F1E33";
  const bars = "#FBFCFE";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Saaksh"
    >
      <rect width="64" height="64" rx="16" fill={tile} />
      <g transform="translate(9.6 9.6) scale(0.7)">
        <rect x="14" y="11" width="36" height="7" rx="3.5" fill={bars} />
        <rect x="20" y="28.5" width="30" height="7" rx="3.5" fill={bars} />
        <rect x="14" y="46" width="30" height="7" rx="3.5" fill={bars} />
        <rect x="47" y="46" width="7" height="7" rx="3.5" fill="#1E9DF2" />
      </g>
    </svg>
  );
}
