import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";

export const metadata: Metadata = {
  title: "About Saaksh: who built it and why",
  description:
    "Saaksh is a BRSR compliance tool for independent Indian ESG consultants, built by Rahul Upadhyay. Evidence-first, cited to SEBI & ICAI, and private by design.",
};

const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: "Evidence, not vibes",
    body: "The name Saaksh comes from the Sanskrit sākṣya, meaning evidence. Every number the tool surfaces is either something your client can point to in a filing, or something it computes from a cited factor. Nothing is invented.",
  },
  {
    title: "Cited to the source",
    body: "Guidance is tied to the SEBI BRSR format and the ICAI Background Material, and every emission factor names its publication, table and vintage. You can check our work, and so can your client's assurer.",
  },
  {
    title: "Private by design",
    body: "The free readiness tool runs entirely in your browser. Your client's answers and any documents you upload never leave your device. That's a deliberate choice, not a limitation.",
  },
  {
    title: "Built for the long tail",
    body: "Enterprise ESG software is priced for large listed companies. The independent consultant preparing BRSR for a handful of clients has been left out. Saaksh is built for them.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <SiteHeader active="about" />

      {/* Navy hero */}
      <div className="bg-[#0F1E33]">
        <div className="mx-auto w-full max-w-[880px] px-5 sm:px-8 pt-14 pb-12">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
            About
          </p>
          <h1 className="font-display font-bold text-[2.2rem] sm:text-[2.9rem] text-white leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Built for the consultants who actually file BRSR.
          </h1>
          <p className="text-[16px] text-[#C4D0E0] leading-relaxed mt-4 max-w-[620px]">
            Saaksh is a compliance tool for independent ESG consultants in India. It starts with BRSR: the
            reporting that SEBI now requires of the country&apos;s largest listed companies, and the work that
            lands on a consultant&apos;s desk as a blank 108-field format and a pile of scattered filings.
          </p>
        </div>
      </div>

      <main className="flex-1">
        <div className="mx-auto w-full max-w-[720px] px-5 sm:px-8 py-16">

          {/* The problem */}
          <section className="mb-14">
            <h2 className="font-display font-bold text-[1.7rem] text-ink leading-tight tracking-[-0.015em] mb-4">
              The problem
            </h2>
            <div className="space-y-4 text-[15.5px] text-ink-body leading-[1.75]">
              <p>
                Talk to anyone who prepares BRSR reports and the same complaint comes up: the single biggest
                time-sink isn&apos;t analysis, it&apos;s <span className="font-semibold text-ink">collecting the data</span>.
                Emissions figures live with the plant manager, headcount with HR, board policies with the company
                secretary, and none of them answer emails quickly.
              </p>
              <p>
                On top of that, a first-time filer stares at 108 disclosures with no quick read on which ones
                their client already covers in existing filings, which need fresh data, and where the numbers
                even come from. The existing ESG software is enterprise-priced and enterprise-shaped, no help to
                a consultant serving a handful of clients.
              </p>
            </div>
          </section>

          {/* The approach */}
          <section className="mb-14">
            <h2 className="font-display font-bold text-[1.7rem] text-ink leading-tight tracking-[-0.015em] mb-4">
              The approach
            </h2>
            <div className="space-y-4 text-[15.5px] text-ink-body leading-[1.75]">
              <p>
                Saaksh has two halves. The <Link href="/start" className="font-semibold text-brand-700 hover:underline">free readiness tool</Link>{" "}
                turns a short intake into a gap-analysed, cited action plan in seconds, entirely on your device.
                It answers &ldquo;what&apos;s covered, what&apos;s missing, and how do I collect it&rdquo; before you&apos;ve
                sent a single email.
              </p>
              <p>
                <Link href="/pricing" className="font-semibold text-brand-700 hover:underline">Pro</Link> is the
                workspace that runs the rest of the engagement: chasing the data from each team with branded
                emails and reminders, auto-computing and attributing emissions, keeping an assurance-ready trail,
                and drafting the response. Free prepares the report; Pro does the job.
              </p>
            </div>
          </section>

          {/* Principles */}
          <section className="mb-14">
            <h2 className="font-display font-bold text-[1.7rem] text-ink leading-tight tracking-[-0.015em] mb-6">
              What we hold to
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {PRINCIPLES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <h3 className="text-[15px] font-semibold text-ink mb-2">{p.title}</h3>
                  <p className="text-[13.5px] text-ink-body leading-relaxed">{p.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Who built it */}
          <section className="mb-14">
            <h2 className="font-display font-bold text-[1.7rem] text-ink leading-tight tracking-[-0.015em] mb-4">
              Who built it
            </h2>
            <div className="space-y-4 text-[15.5px] text-ink-body leading-[1.75]">
              <p>
                Saaksh is built by <span className="font-semibold text-ink">Rahul Upadhyay</span>, working in the
                climate and compliance space. The tool is shaped directly by feedback from practising BRSR
                consultants, who validated that data collection, not analysis, is where the real pain sits, and
                who continue to steer what gets built next.
              </p>
              <p>
                If you prepare BRSR reports and something here would be more useful done differently, that
                feedback shapes the roadmap. Reach out any time.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/"
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex items-center gap-2 rounded-xl border border-line bg-white text-ink text-[14px] font-semibold px-4 py-2.5 hover:bg-band transition-colors"
              >
                Connect on LinkedIn
              </a>
              <a
                href="mailto:rahulu626@gmail.com"
                className="pressable inline-flex items-center gap-2 rounded-xl border border-line bg-white text-ink text-[14px] font-semibold px-4 py-2.5 hover:bg-band transition-colors"
              >
                rahulu626@gmail.com
              </a>
            </div>
          </section>

          {/* CTA */}
          <div className="rounded-2xl bg-forest text-white p-8 flex flex-col sm:flex-row sm:items-center gap-5 shadow-elev-2">
            <div className="flex-1">
              <p className="font-display font-bold text-[1.4rem] leading-tight tracking-[-0.015em]">
                See it on your next client.
              </p>
              <p className="text-[14px] text-ondark-muted leading-relaxed mt-2 max-w-[430px]">
                A gap-analysed BRSR action plan in under a minute. No login, nothing stored.
              </p>
            </div>
            <Link href="/start" className="pressable shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-forest text-[14.5px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors">
              Start a free report
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
