import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { TierCards } from "@/components/PricingTable";
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
      <SiteHeader active="pricing" />

      {/* Navy hero */}
      <div className="bg-[#0F1E33]">
        <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 pt-14 pb-12">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
            Pricing
          </p>
          <h1 className="font-display font-bold text-[2.2rem] sm:text-[3rem] text-white leading-[1.06] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Free prepares the report. Pro runs the whole job.
          </h1>
          <p className="text-[16px] text-[#C4D0E0] leading-relaxed mt-4 max-w-[640px]">
            The readiness tool is genuinely free and stays on your device. Pro is the workspace that does the
            work: collecting the data from the client&apos;s team, computing and attributing emissions, the
            assurance trail, and the tools to win and price the engagement.
          </p>
        </div>
      </div>

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
            <h2 className="font-display font-bold text-[1.9rem] sm:text-[2.3rem] text-ink leading-[1.1] tracking-[-0.02em] mb-8" style={{ textWrap: "balance" }}>
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
            <div className="mt-12 rounded-2xl bg-forest text-white p-8 flex flex-col sm:flex-row sm:items-center gap-5 shadow-elev-2">
              <div className="flex-1">
                <p className="font-display font-bold text-[1.4rem] leading-tight tracking-[-0.015em]">
                  Start free, upgrade when you&apos;re collecting.
                </p>
                <p className="text-[14px] text-ondark-muted leading-relaxed mt-2 max-w-[440px]">
                  Run a gap analysis on your next client in under a minute. When you&apos;re ready to chase the
                  data, request Pro access.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link href="/start" className="pressable inline-flex items-center justify-center gap-2 rounded-xl bg-white text-forest text-[14.5px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors">
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
