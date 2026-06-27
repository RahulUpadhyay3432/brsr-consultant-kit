import { useEffect } from "react";

// Subtle scroll-reveal for marketing sections. Robust + accessible:
//  - reduced-motion or no IntersectionObserver → does nothing (content stays visible).
//  - elements already in view on load are left untouched (no hide → no flash, no gating).
//  - only BELOW-the-fold [data-reveal] elements get hidden, then revealed on scroll-in.
// Content is always visible by default (SSR / no-JS render it normally); this only
// adds an enhancement on top.
export function useScrollReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          // Reveal when it enters view, OR if it was leapfrogged (a fast flick /
          // anchor jump scrolled past it) so content is never left stuck hidden.
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            e.target.classList.add("reveal-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    for (const el of els) {
      const r = el.getBoundingClientRect();
      const inView = r.top < window.innerHeight * 0.92 && r.bottom > 0;
      if (inView) continue; // visible on load, never hide it
      el.classList.add("reveal-init");
      io.observe(el);
    }
    return () => io.disconnect();
  }, []);
}
