import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";

export const metadata: Metadata = {
  title: "BRSR materiality: suggested topics by industry | Saaksh",
  description:
    "Start a BRSR materiality assessment from the ESG topics that typically matter most in your client's industry. Shortlist, score and export, free and on-device.",
};

const STEPS = [
  { step: "01", title: "Start from industry topics", body: "Pick your client's industry and Saaksh suggests the ESG topics that usually matter most there, each mapped to the BRSR principles it touches." },
  { step: "02", title: "Shortlist and score", body: "Select the topics to carry forward and place them on an impact × stakeholder-concern grid. A working selection, not a verdict." },
  { step: "03", title: "Export the grid", body: "Download the shortlist as a CSV with scoring and decision columns, ready to use as the backbone of a real stakeholder process." },
];

export default function MaterialityFeaturePage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="tools" />

      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <div className="inline-flex items-center gap-2 mb-5">
            <span className="bg-brand-600 text-white text-xs font-semibold tracking-wide px-3 py-1 rounded-full uppercase">Free</span>
            <span className="text-brand-500 text-sm font-mono">Suggested topics by industry</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-5 leading-tight" style={{ textWrap: "balance" }}>
            A faster start to materiality
          </h1>
          <p className="text-lg text-white/70 max-w-[640px] leading-relaxed">
            Don&apos;t face a blank page. Saaksh suggests the material ESG topics for your client&apos;s industry, mapped to BRSR principles, so the stakeholder conversation starts from a structured shortlist instead of nothing.
          </p>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

          <section>
            <h2 className="font-display text-2xl text-ink mb-8">How it works</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {STEPS.map(({ step, title, body }) => (
                <div key={step} className="bg-surface border border-line rounded-2xl p-7 shadow-elev-1">
                  <span className="font-mono text-[13px] text-brand-600 font-semibold">{step}</span>
                  <h3 className="font-display text-[1.15rem] text-ink mt-2 mb-2">{title}</h3>
                  <p className="text-[13.5px] text-ink-muted leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Honesty callout */}
          <section className="rounded-2xl bg-tint border border-line p-8">
            <h2 className="font-display text-xl text-ink mb-2.5">A starting format, not a finished assessment</h2>
            <p className="text-ink-muted text-[15px] max-w-[640px] leading-relaxed">
              A BRSR-compliant materiality assessment requires genuine stakeholder engagement, the suggested topics and the grid are scaffolding to structure that process, not a substitute for it. Saaksh never claims to have determined what is material for your client.
            </p>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="font-display text-[1.8rem] text-ink mb-3">Build a materiality shortlist now</h2>
            <p className="text-ink-muted text-[15px] mb-6 max-w-[480px] mx-auto leading-relaxed">
              Open the free builder, pick an industry, and export the grid, or run a full readiness report to see materiality alongside the BRSR gap analysis.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/tools/materiality" className="inline-flex items-center gap-2 bg-forest text-white text-[14.5px] font-semibold px-6 py-3 rounded-xl hover:bg-forest-light transition-colors pressable">
                Open the materiality builder
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/start" className="inline-flex items-center gap-2 bg-white text-ink text-[14.5px] font-medium px-6 py-3 rounded-xl border border-line hover:bg-band transition-colors pressable">
                Run a readiness report
              </Link>
            </div>
          </section>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
