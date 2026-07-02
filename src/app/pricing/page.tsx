import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { TierCards } from "@/components/PricingTable";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlowOrb, Contours } from "@/components/brand/Decor";
import { REQUEST_ACCESS_URL } from "@/lib/links";

export const metadata: Metadata = {
  title: "Pricing: the free BRSR tool and the Pro Collect tier",
  description:
    "The Saaksh readiness tool is free forever, no login, nothing stored. Pro adds the Collect workspace that chases data, auto-computes emissions, and drafts the report. Priced per engagement.",
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "Is the free tool really free?",
    a: "Yes. The readiness tool, all the calculators, the framework mappings, the templates and the field guidance are free forever, with no login and no account. Everything runs in your browser, so none of your client's data is ever sent to us or stored anywhere.",
  },
  {
    q: "What does Pro cost?",
    a: "Pro (the Collect workspace) is priced per engagement rather than as a fixed subscription, because consultants work on very different client volumes. We onboard the first users manually so we can set a price that fits your practice. Request access and we'll talk it through.",
  },
  {
    q: "Why is Pro not self-serve yet?",
    a: "Collect stores client data securely on a backend (that's the point: it chases numbers from a client's team and keeps an assurance-ready trail). We're onboarding consultants one at a time while we validate pricing, so access is by request for now.",
  },
  {
    q: "What's the difference between Free and Pro in one line?",
    a: "Free prepares and understands the report on your device. Pro runs the actual job: collecting the data from the client's team, auto-computing and attributing emissions, keeping the assurance trail, and drafting the response.",
  },
  {
    q: "Do you store my client's data on the free tool?",
    a: "No. The free readiness tool is 100% on-device. Your answers and any uploaded documents are processed in your browser and never leave it. You can back up your work to a file you keep yourself.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <ScrollReveal />
      <SiteHeader active="pricing" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-forest glow-dark">
        <GlowOrb tone="brand" className="w-[520px] h-[520px] -top-48 left-1/3" />
        <Contours className="w-[420px] h-[420px] -right-20 -top-12 text-brand-400" stroke="#4D97F0" opacity={0.13} />
        <div className="relative mx-auto w-full max-w-[1120px] px-5 sm:px-8 pt-16 pb-16">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">Pricing</p>
          <h1 className="font-editorial font-semibold text-white mt-4 text-[2.4rem] sm:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[18ch]" style={{ textWrap: "balance" }}>
            Free prepares the report. Pro runs the whole job.
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[640px]">
            The readiness tool is genuinely free and stays on your device. Pro is the workspace that does the work:
            collecting the data from the client&apos;s team, computing and attributing emissions, the assurance trail,
            and the tools to win and price the engagement.
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 pb-6">
          {/* The Free vs Pro cards, no onStart → the Free CTA links to /start */}
          <TierCards />

          <p className="text-center text-[13px] text-ink-muted mt-8">
            Not sure which fits your practice?{" "}
            <a href={REQUEST_ACCESS_URL} className="font-semibold text-brand-700 hover:underline">
              Talk to us
            </a>{" "}
            and we&apos;ll point you the right way.
          </p>
        </div>

        {/* FAQ */}
        <section className="bg-band border-t border-line mt-14">
          <div className="mx-auto w-full max-w-[820px] px-5 sm:px-8 py-16">
            <h2 className="font-editorial font-semibold text-[1.9rem] sm:text-[2.3rem] text-ink leading-[1.1] tracking-[-0.015em] mb-8" style={{ textWrap: "balance" }} data-reveal>
              Common questions
            </h2>
            <div className="space-y-3">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
                  <summary className="cursor-pointer list-none flex items-center justify-between gap-4 px-6 py-4 select-none">
                    <span className="text-[15.5px] font-semibold text-ink leading-snug">{q}</span>
                    <svg className="w-4 h-4 text-ink-muted shrink-0 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </summary>
                  <p className="px-6 pb-5 -mt-1 text-[14px] text-ink-body leading-relaxed">{a}</p>
                </details>
              ))}
            </div>

            {/* Closing CTA */}
            <div className="relative overflow-hidden mt-12 rounded-3xl bg-gradient-to-br from-forest via-[#123a6b] to-brand-800 text-white p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center gap-6 shadow-elev-3">
              <GlowOrb tone="brand" className="w-[400px] h-[400px] -top-24 -right-16" />
              <Contours className="w-[380px] h-[380px] -left-16 -bottom-20 text-brand-400" stroke="#4D97F0" opacity={0.13} />
              <div className="relative flex-1">
                <p className="font-editorial font-semibold text-[1.7rem] leading-tight tracking-[-0.015em]">
                  Start free, upgrade when you&apos;re collecting.
                </p>
                <p className="text-[14.5px] text-ondark-muted leading-relaxed mt-2.5 max-w-[440px]">
                  Run a gap analysis on your next client in under a minute. When you&apos;re ready to chase the data,
                  request Pro access.
                </p>
              </div>
              <div className="relative flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/start" className="cta-glow inline-flex items-center justify-center gap-2 rounded-xl bg-white text-forest text-[14.5px] font-semibold px-5 py-3 hover:bg-white">
                  Start free
                </Link>
                <a href={REQUEST_ACCESS_URL} className="pressable inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 text-white text-[14.5px] font-semibold px-5 py-3 hover:bg-white/10 transition-colors">
                  Request Pro access
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter />
    </div>
  );
}
