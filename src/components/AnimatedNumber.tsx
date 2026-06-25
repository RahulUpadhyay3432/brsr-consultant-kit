"use client";
// A restrained number ticker: counts from 0 up to `value` with an ease-out curve,
// for the report's "value moment" figures (readiness %, the gap counts). Purposeful,
// not decorative — it celebrates the computed result. Renders tabular-nums so digits
// don't shift. Respects prefers-reduced-motion: snaps straight to the final value.
import { useEffect, useRef, useState } from "react";

// ease-out cubic — fast then settling, matching the report's --ease-out feel.
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function AnimatedNumber({
  value,
  durationMs = 700,
  decimals = 0,
  className,
}: {
  value: number;
  durationMs?: number;
  decimals?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value); // SSR + reduced-motion: final value
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (prefersReducedMotion() || durationMs <= 0) {
      setDisplay(value);
      return;
    }
    const from = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / durationMs));
      setDisplay(from + (value - from) * easeOut(t));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    setDisplay(0);
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
  }, [value, durationMs]);

  const shown = decimals > 0
    ? display.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : Math.round(display).toLocaleString("en-IN");

  return <span className={`tabular-nums ${className ?? ""}`}>{shown}</span>;
}
