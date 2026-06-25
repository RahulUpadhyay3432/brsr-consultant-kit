// A shimmer placeholder block for loading states. Pure CSS (.skeleton handles the
// sheen + reduced-motion via the global rule). Compose these into page-shaped
// skeletons so a load reads as "content arriving", not a blank spinner.
export default function Skeleton({ className = "", style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
}
