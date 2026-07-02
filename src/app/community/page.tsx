import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { CommunityJoin } from "@/components/CommunityJoin";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlowOrb, Contours, Blob } from "@/components/brand/Decor";

export const metadata: Metadata = {
  title: "Community: the group for ESG consultants",
  description:
    "Join the Saaksh community of independent Indian ESG consultants. Cited regulatory updates that matter, practical answers from people who do the work, and first look at new tools.",
};

const BENEFITS: { title: string; body: string; icon: "signal" | "chat" | "spark" }[] = [
  {
    title: "Updates that matter, cited",
    icon: "signal",
    body: "SEBI amendments, BRSR Core timelines, CBAM and CCTS moves, distilled to what actually changes your work, with the source linked. Signal, not noise.",
  },
  {
    title: "Answers from people who do the work",
    icon: "chat",
    body: "Ask the questions the frameworks don't answer and get replies from consultants who do this daily, not a support bot reading a script.",
  },
  {
    title: "First look at new tools",
    icon: "spark",
    body: "Early access to new Saaksh calculators, templates and features, and a direct line to shape what gets built next.",
  },
];

function BenefitIcon({ name }: { name: "signal" | "chat" | "spark" }) {
  const c = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...c}>
      {name === "signal" && <path d="M4 18a10 10 0 0116 0M7 18a6 6 0 0110 0M11 18a2 2 0 012 0" />}
      {name === "chat" && <path d="M4 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H9l-4 3v-3H6a2 2 0 01-2-2z" />}
      {name === "spark" && <path d="M12 3l1.8 4.6L18 9.4l-4.2 1.8L12 16l-1.8-4.8L6 9.4l4.2-1.8zM19 15l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z" />}
    </svg>
  );
}

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <ScrollReveal />
      <SiteHeader active="community" />

      {/* Hero */}
      <header className="relative overflow-hidden bg-forest glow-dark">
        <GlowOrb tone="brand" className="w-[520px] h-[520px] -top-48 left-1/3" />
        <Contours className="w-[420px] h-[420px] -right-20 -top-12 text-brand-400" stroke="#4D97F0" opacity={0.13} />
        <Blob className="w-[280px] h-[280px] -left-20 bottom-[-80px]" from="#1E9DF2" to="#0B5FB0" opacity={0.15} />
        <div className="relative mx-auto w-full max-w-[1120px] px-5 sm:px-8 pt-16 pb-16">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400">Community</p>
          <h1 className="font-editorial font-semibold text-white mt-4 text-[2.4rem] sm:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[18ch]" style={{ textWrap: "balance" }}>
            The Saaksh community for ESG consultants.
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[640px]">
            Where India&apos;s independent ESG consultants get the regulatory moves that matter first, and trade what
            actually works in the field. This is where we share the updates and know-how that don&apos;t fit in a report.
          </p>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-16">

          {/* What you get */}
          <section className="mb-14">
            <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.3rem] leading-tight tracking-[-0.015em] mb-8" data-reveal>
              What you get
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {BENEFITS.map((b, i) => (
                <div key={b.title} className="card-lift rounded-2xl border border-line bg-white p-6 shadow-elev-1" data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                    <BenefitIcon name={b.icon} />
                  </div>
                  <h3 className="text-[15.5px] font-semibold text-ink mt-4 mb-1.5">{b.title}</h3>
                  <p className="text-[13.5px] text-ink-body leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Join card */}
          <section className="relative overflow-hidden rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center shadow-elev-1" data-reveal>
            <GlowOrb tone="brand" className="w-[360px] h-[360px] -top-40 left-1/2 -translate-x-1/2" style={{ opacity: 0.5 }} />
            <div className="relative">
              <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">
                Join on WhatsApp
              </h2>
              <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[460px] mx-auto">
                A focused group, updates and practical discussion for practising ESG consultants. No spam, nothing that
                doesn&apos;t earn your attention, and you can leave any time.
              </p>
              <div className="mt-7 flex justify-center">
                <CommunityJoin />
              </div>
              <p className="text-[12.5px] text-ink-muted mt-4">
                A LinkedIn group is coming soon, so you can follow along there too.
              </p>
            </div>
          </section>

          {/* Secondary CTA */}
          <p className="text-center text-[14px] text-ink-muted mt-10">
            New to Saaksh?{" "}
            <Link href="/start" className="font-semibold text-brand-700 hover:underline">
              Start a free BRSR readiness report
            </Link>{" "}
            in under a minute.
          </p>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
