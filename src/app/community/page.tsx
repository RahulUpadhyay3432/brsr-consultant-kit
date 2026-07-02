import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { CommunityJoin } from "@/components/CommunityJoin";

export const metadata: Metadata = {
  title: "Community: the group for ESG consultants",
  description:
    "Join the Saaksh community of independent Indian ESG consultants. Cited regulatory updates that matter, practical answers from people who do the work, and first look at new tools.",
};

const BENEFITS: { title: string; body: string }[] = [
  {
    title: "Updates that matter, cited",
    body: "SEBI amendments, BRSR Core timelines, CBAM and CCTS moves, distilled to what actually changes your work, with the source linked. Signal, not noise.",
  },
  {
    title: "Answers from people who do the work",
    body: "Ask the questions the frameworks don't answer and get replies from consultants who do this daily, not a support bot reading a script.",
  },
  {
    title: "First look at new tools",
    body: "Early access to new Saaksh calculators, templates and features, and a direct line to shape what gets built next.",
  },
];

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="community" />

      {/* Navy hero */}
      <div className="bg-[#0F1E33]">
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8 pt-14 pb-12">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
            Community
          </p>
          <h1 className="font-display font-bold text-[2.2rem] sm:text-[2.9rem] text-white leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            The Saaksh community for ESG consultants.
          </h1>
          <p className="text-[16px] text-[#C4D0E0] leading-relaxed mt-4 max-w-[620px]">
            Where India&apos;s independent ESG consultants get the regulatory moves that matter first, and
            trade what actually works in the field. This is where we share the updates and know-how that
            don&apos;t fit in a report.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[720px] px-5 sm:px-8 py-16">

          {/* What you get */}
          <section className="mb-14">
            <h2 className="font-display font-bold text-[1.7rem] text-ink leading-tight tracking-[-0.015em] mb-6">
              What you get
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {BENEFITS.map((b) => (
                <div key={b.title} className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                  <h3 className="text-[14.5px] font-semibold text-ink mb-2">{b.title}</h3>
                  <p className="text-[13px] text-ink-body leading-relaxed">{b.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Join card */}
          <section className="rounded-2xl border border-line bg-white p-8 shadow-elev-1 text-center">
            <h2 className="font-display font-bold text-[1.5rem] text-ink leading-tight tracking-[-0.015em]">
              Join on WhatsApp
            </h2>
            <p className="text-[14.5px] text-ink-body leading-relaxed mt-2 max-w-[440px] mx-auto">
              A focused group, updates and practical discussion for practising ESG consultants. No spam,
              nothing that doesn&apos;t earn your attention, and you can leave any time.
            </p>
            <div className="mt-6 flex justify-center">
              <CommunityJoin />
            </div>
            <p className="text-[12.5px] text-ink-muted mt-4">
              A LinkedIn group is coming soon, so you can follow along there too.
            </p>
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
