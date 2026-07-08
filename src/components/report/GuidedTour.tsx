"use client";
import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export interface TourStep { tab: string; title: string; blurb: string; }

// Steps for the report walkthrough. Each step highlights the view's sidebar item
// (a stable, always-visible target), switches the content to that view, and
// scrolls it to the top, driven by driver.js (spotlight + anchored popover +
// scroll-into-view + viewport-aware positioning, all handled by the library).
export const REPORT_TOUR_STEPS: TourStep[] = [
  { tab: "overview",    title: "Overview",     blurb: "Start here: your client's readiness at a glance, how many of the 108 fields are ready to pull, need checking, or must be collected fresh." },
  { tab: "checklist",   title: "Action Plan",  blurb: "The core of the report. Every BRSR field, grouped by principle. Open a row for the gap, the exact SEBI wording, and how to collect it. Emissions calculators live here." },
  { tab: "materiality", title: "Materiality",  blurb: "A suggested shortlist of the ESG topics that matter most for this sector, a starting point for the client's own stakeholder process." },
  { tab: "alignment",   title: "Alignment",    blurb: "How each BRSR disclosure maps to GRI, TCFD, IFRS S1/S2 and TNFD, exportable as a crosswalk for multi-framework reporting." },
  { tab: "beyond-brsr", title: "Beyond BRSR",  blurb: "A quick CBAM and CCTS in-scope readiness check, based on this client's sector and export markets." },
];

export default function GuidedTour({
  steps,
  onNavigate,
  onClose,
}: {
  steps: TourStep[];
  onNavigate: (tab: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    let done = false;
    const goto = (tab: string) => {
      onNavigate(tab);
      // Scroll the freshly-switched view to its header (the sidebar target the
      // spotlight lands on stays put, so driver won't scroll the page itself).
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    };
    goto(steps[0].tab);

    const d = driver({
      showProgress: true,
      progressText: "Step {{current}} of {{total}}",
      allowClose: true,
      overlayColor: "rgba(15,30,51,0.5)",
      stagePadding: 6,
      stageRadius: 12,
      popoverClass: "saaksh-tour",
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Done",
      steps: steps.map((s) => ({
        element: `[data-tour="tab-${s.tab}"]`,
        popover: { title: s.title, description: s.blurb, side: "right", align: "start" },
        onHighlightStarted: () => goto(s.tab),
      })),
      onDestroyed: () => { if (!done) { done = true; onClose(); } },
    });
    d.drive();

    return () => { if (!done) { done = true; d.destroy(); } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
