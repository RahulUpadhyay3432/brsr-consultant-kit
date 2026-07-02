// On-brand decorative art for heroes and section bands — soft glows, organic
// "water" blobs, and a faint concentric contour motif (a nature/evidence nod).
// Every layer is aria-hidden + pointer-events-none. The PARENT must be
// `relative overflow-hidden`; position each layer with className (inset/size).
// Subtle by design — depth, not decoration (balanced & premium).
import type { CSSProperties } from "react";

type Tone = "brand" | "navy" | "coral" | "white";

const GLOW: Record<Tone, string> = {
  brand: "rgba(30,157,242,0.22)",
  navy: "rgba(11,111,212,0.18)",
  coral: "rgba(242,103,74,0.18)",
  white: "rgba(255,255,255,0.10)",
};

// A blurred radial bloom of light. Size/position via className (e.g. "w-[520px] h-[520px] -top-40 -right-32").
export function GlowOrb({ className = "", tone = "brand", style }: { className?: string; tone?: Tone; style?: CSSProperties }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: `radial-gradient(circle at center, ${GLOW[tone]} 0%, transparent 70%)`, ...style }}
    />
  );
}

// Faint concentric contour rings — a topographic / evidence motif. Position + size via className.
export function Contours({ className = "", stroke = "#1E9DF2", opacity = 0.12 }: { className?: string; stroke?: string; opacity?: number }) {
  return (
    <svg aria-hidden viewBox="0 0 400 400" fill="none" className={`pointer-events-none absolute ${className}`} style={{ opacity }}>
      {[188, 150, 112, 74, 40].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} stroke={stroke} strokeWidth={i === 0 ? 1.25 : 1} />
      ))}
    </svg>
  );
}

// A soft organic "water" blob bleeding off an edge. Fill is a low-opacity brand gradient.
export function Blob({ className = "", from = "#1E9DF2", to = "#0B6FD4", opacity = 0.14 }: { className?: string; from?: string; to?: string; opacity?: number }) {
  const id = `blob-${from.replace("#", "")}-${to.replace("#", "")}`;
  return (
    <svg aria-hidden viewBox="0 0 320 320" className={`pointer-events-none absolute ${className}`} style={{ opacity }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M287,70 C324,120 316,205 268,252 C223,296 138,312 82,278 C30,246 8,168 34,108 C60,49 128,14 190,20 C233,24 262,37 287,70 Z"
      />
    </svg>
  );
}
