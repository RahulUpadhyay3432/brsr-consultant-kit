// Bundled logos for known clients (premium feel + demo). Drop a transparent PNG into
// public/logos/ and add a normalized-substring entry below. Matched leniently so
// "Tata Motors" and "Tata Motors Ltd" both resolve to the same file. Build-time/local
// only (no runtime logo fetch), so the on-device privacy promise stays intact.
const LOGOS: { match: string; file: string }[] = [
  { match: "tata motors", file: "tata-motors.png" },
];

// Returns "/logos/<file>" for a known company name, or null for the monogram fallback.
export function logoFor(name: string): string | null {
  const n = (name || "").toLowerCase();
  for (const l of LOGOS) if (n.includes(l.match)) return `/logos/${l.file}`;
  return null;
}
