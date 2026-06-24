// Deterministic, on-device company avatar — a colored rounded square with the
// company's initials. No external logo fetch, so "client data never leaves your
// browser" stays true. The colour is derived from the name (stable across
// sessions) so each company reads as visually distinct.

// Deep Evergreen & Ember tones — all dark enough for white initials to stay legible.
const AVATAR_COLORS = [
  "#0E4A36", // forest
  "#0B6B4F", // label green
  "#11655C", // teal
  "#3F4A44", // slate
  "#A6571C", // ember / rust
  "#8A6112", // bronze / gold
  "#5A4636", // taupe
];

function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export default function CompanyAvatar({
  name,
  size = 28,
  rounded = "rounded-md",
  className = "",
}: {
  name: string;
  size?: number;
  rounded?: string;
  className?: string;
}) {
  const label = (name && name.trim()) || "Client";
  const text = initialsOf(label);
  const fontSize = Math.round(size * (text.length > 1 ? 0.38 : 0.46));
  return (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center flex-shrink-0 ${rounded} ${className}`}
      style={{ width: size, height: size, backgroundColor: colorFor(label) }}
    >
      <span className="font-semibold text-white leading-none tracking-tight" style={{ fontSize }}>
        {text}
      </span>
    </span>
  );
}
