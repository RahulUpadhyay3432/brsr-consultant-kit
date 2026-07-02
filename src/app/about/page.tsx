import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GlowOrb, Contours, Blob } from "@/components/brand/Decor";
import { SaakshMark } from "@/components/SaakshMark";

export const metadata: Metadata = {
  title: "About Saaksh: who built it and why",
  description:
    "Saaksh is a compliance tool for independent Indian ESG consultants, built by Rahul Upadhyay. Evidence-first, cited to SEBI & ICAI, and private by design.",
};

const PRINCIPLES: { title: string; body: string; icon: "shield" | "quote" | "lock" | "seed" }[] = [
  {
    title: "Evidence, not vibes",
    icon: "shield",
    body: "The name Saaksh comes from the Sanskrit sākṣya, meaning evidence. Every number the tool surfaces is either something your client can point to in a filing, or something it computes from a cited factor. Nothing is invented.",
  },
  {
    title: "Cited to the source",
    icon: "quote",
    body: "Guidance is tied to the SEBI BRSR format and the ICAI Background Material, and every emission factor names its publication, table and vintage. You can check our work, and so can your client's assurer.",
  },
  {
    title: "Private by design",
    icon: "lock",
    body: "The free readiness tool runs entirely in your browser. Your client's answers and any documents you upload never leave your device. That's a deliberate choice, not a limitation.",
  },
  {
    title: "Built for the long tail",
    icon: "seed",
    body: "Enterprise ESG software is priced for large listed companies. The independent consultant preparing BRSR for a handful of clients has been left out. Saaksh is built for them.",
  },
];

const JOURNEY: { tag: string; title: string; body: string; live: boolean }[] = [
  {
    tag: "Now",
    live: true,
    title: "BRSR, gap-analysed and cited",
    body: "The free readiness tool turns a blank 108-field format into a gap-analysed, cited action plan in seconds. Collect (Pro) chases the data from each team, auto-computes emissions, and drafts the response.",
  },
  {
    tag: "Next",
    live: false,
    title: "CBAM & CCTS readiness, deeper",
    body: "The same evidence-first treatment for the EU carbon border tax and India's carbon market, so you prepare a client for what's coming, not only what's already filed.",
  },
  {
    tag: "The horizon",
    live: false,
    title: "One platform for the whole ESG stack",
    body: "Collect a client's data once and report it to every framework, with every figure traced back to its source. BRSR is where it starts, not where it ends.",
  },
];

function PrincipleIcon({ name }: { name: "shield" | "quote" | "lock" | "seed" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" {...common}>
      {name === "shield" && <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3zM9 12l2 2 4-4" />}
      {name === "quote" && <path d="M9 7H6a2 2 0 00-2 2v3a2 2 0 002 2h1v3M18 7h-3a2 2 0 00-2 2v3a2 2 0 002 2h1v3" />}
      {name === "lock" && (<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3M12 15v2" /></>)}
      {name === "seed" && <path d="M12 21v-7M12 14c0-3 2-5 6-5 0 4-3 6-6 6zM12 14c0-2.5-1.6-4.2-5-4.2C7 13 9.6 14 12 14z" />}
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col">
      <ScrollReveal />
      <SiteHeader active="about" />

      {/* ── Hero (full-bleed navy, lit + organic) ─────────────────────────────── */}
      <header className="relative overflow-hidden bg-forest glow-dark">
        <GlowOrb tone="brand" className="w-[560px] h-[560px] -top-52 left-1/2 -translate-x-1/2" />
        <Contours className="w-[440px] h-[440px] -right-24 -top-16 text-brand-400" stroke="#4D97F0" opacity={0.14} />
        <Blob className="w-[300px] h-[300px] -left-24 bottom-[-90px]" from="#1E9DF2" to="#0B5FB0" opacity={0.16} />
        <div className="relative mx-auto w-full max-w-[900px] px-5 sm:px-8 pt-20 pb-20 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1.5 text-[12.5px] font-medium text-ondark-muted">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400" /> About Saaksh
          </span>
          <h1 className="font-editorial font-semibold text-white mt-6 text-[2.6rem] sm:text-[3.5rem] lg:text-[3.9rem] leading-[1.04] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Built for the consultants who <span className="text-brand-400">actually file BRSR.</span>
          </h1>
          <p className="text-[17px] sm:text-[18px] text-ondark-muted leading-relaxed mt-6 max-w-[640px] mx-auto">
            Saaksh is a compliance tool for independent ESG consultants in India. It starts with BRSR: the
            reporting SEBI now requires of the country&apos;s largest listed companies, and the work that lands
            on a consultant&apos;s desk as a blank 108-field format and a pile of scattered filings.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/start" className="group cta-glow inline-flex items-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-5 py-3 hover:bg-white">
              Start a free report
              <svg className="arrow-nudge w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="/pricing" className="pressable inline-flex items-center gap-2 rounded-xl border border-white/20 text-white text-[15px] font-semibold px-5 py-3 hover:bg-white/[0.08] transition-colors">
              See pricing
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Vision & mission (two-column, with the "vision" visual) ──────────── */}
        <section className="relative overflow-hidden glow-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Vision &amp; mission</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                Put big-firm tooling in every consultant&apos;s hands.
              </h2>
              <div className="mt-7 space-y-6">
                <div className="relative rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-2">Mission</p>
                  <p className="text-[16px] text-ink-body leading-[1.65]">
                    Put the tooling that only big consultancies can afford into the hands of every independent ESG
                    consultant in India, so a solo practice can prepare a BRSR report that is as fast, as complete,
                    and as defensible as a large firm&apos;s.
                  </p>
                </div>
                <div className="relative rounded-2xl border border-line bg-white p-6 shadow-elev-1">
                  <p className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-700 mb-2">Vision</p>
                  <p className="text-[16px] text-ink-body leading-[1.65]">
                    One compliance platform for Indian sustainability reporting that starts with BRSR and grows into
                    CBAM, CCTS and the wider ESG stack, where a consultant collects a client&apos;s data once and
                    reports it to every framework, and every figure traces back to its source.
                  </p>
                </div>
              </div>
            </div>

            {/* The "vision" visual — an on-brand navy card (swap in a photo later) */}
            <div className="lg:col-span-5" data-reveal style={{ transitionDelay: "90ms" }}>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-forest glow-dark shadow-elev-3 border border-white/10">
                <GlowOrb tone="brand" className="w-[380px] h-[380px] -bottom-32 -right-24" />
                <Contours className="w-[520px] h-[520px] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-400" stroke="#4D97F0" opacity={0.16} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
                  <SaakshMark size={64} />
                  <p className="font-editorial text-white text-[1.5rem] leading-snug mt-6 tracking-[-0.01em]">
                    Evidence, by name and by design.
                  </p>
                  <p className="text-[13.5px] text-ondark-muted leading-relaxed mt-3 max-w-[240px]">
                    Sākṣya: the witness, the cited proof behind every number.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Journey / where this is going (vertical timeline) ─────────────────── */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20">
            <div className="max-w-[640px]" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Where this is going</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                BRSR is where it starts, not where it ends.
              </h2>
            </div>
            <ol className="relative mt-12 pl-2">
              <span aria-hidden className="absolute left-[10px] top-2 bottom-6 w-px bg-gradient-to-b from-brand-300 via-line to-transparent" />
              {JOURNEY.map((s, i) => (
                <li key={s.tag} className="relative pl-12 pb-11 last:pb-0" data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <span className={`absolute left-0 top-0.5 flex items-center justify-center w-[22px] h-[22px] rounded-full border-2 ${s.live ? "border-brand-500 bg-brand-500" : "border-brand-300 bg-page"}`}>
                    {s.live && <span className="w-2 h-2 rounded-full bg-white" />}
                  </span>
                  <p className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] ${s.live ? "text-brand-700" : "text-ink-faint"}`}>{s.tag}</p>
                  <h3 className="font-editorial font-semibold text-ink text-[1.4rem] leading-tight tracking-[-0.01em] mt-1.5">{s.title}</h3>
                  <p className="text-[15.5px] text-ink-body leading-[1.65] mt-2 max-w-[620px]">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── The problem (two-column: heading left, narrative right) ───────────── */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10 lg:gap-16">
            <div className="lg:col-span-5" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">The problem</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                The time-sink isn&apos;t analysis. It&apos;s collecting the data.
              </h2>
            </div>
            <div className="lg:col-span-7 space-y-5 text-[16px] text-ink-body leading-[1.75]" data-reveal style={{ transitionDelay: "80ms" }}>
              <p>
                Talk to anyone who prepares BRSR reports and the same complaint comes up: the single biggest
                time-sink isn&apos;t analysis, it&apos;s <span className="font-semibold text-ink">collecting the data</span>.
                Emissions figures live with the plant manager, headcount with HR, board policies with the company
                secretary, and none of them answer emails quickly.
              </p>
              <p>
                On top of that, a first-time filer stares at 108 disclosures with no quick read on which ones their
                client already covers in existing filings, which need fresh data, and where the numbers even come
                from. The existing ESG software is enterprise-priced and enterprise-shaped, no help to a consultant
                serving a handful of clients.
              </p>
            </div>
          </div>
        </section>

        {/* ── The approach (two feature cards: Free / Pro) ──────────────────────── */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20">
            <div className="max-w-[640px]" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">The approach</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                Free prepares the report. Pro does the job.
              </h2>
            </div>
            <div className="mt-10 grid md:grid-cols-2 gap-5">
              <div className="card-lift rounded-2xl border border-line bg-white p-7 shadow-elev-1" data-reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 text-brand-700 text-[11px] font-semibold px-2.5 py-1">Free · no login</span>
                <h3 className="font-editorial font-semibold text-ink text-[1.35rem] mt-4 tracking-[-0.01em]">The readiness tool</h3>
                <p className="text-[15px] text-ink-body leading-[1.65] mt-2.5">
                  Turns a short intake into a gap-analysed, cited action plan in seconds, entirely on your device.
                  It answers &ldquo;what&apos;s covered, what&apos;s missing, and how do I collect it&rdquo; before
                  you&apos;ve sent a single email.
                </p>
                <Link href="/start" className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-700 hover:text-brand-800 mt-5">
                  Start a free report
                  <svg className="arrow-nudge w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
              <div className="card-lift rounded-2xl border border-brand-200 bg-tint p-7 shadow-elev-1" data-reveal style={{ transitionDelay: "80ms" }}>
                <span className="inline-flex items-center gap-2 rounded-full bg-forest text-white text-[11px] font-semibold px-2.5 py-1">Pro · Collect</span>
                <h3 className="font-editorial font-semibold text-ink text-[1.35rem] mt-4 tracking-[-0.01em]">The workspace</h3>
                <p className="text-[15px] text-ink-body leading-[1.65] mt-2.5">
                  Runs the rest of the engagement: chasing the data from each team with branded emails and reminders,
                  auto-computing and attributing emissions, keeping an assurance-ready trail, and drafting the response.
                </p>
                <Link href="/pricing" className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-brand-700 hover:text-brand-800 mt-5">
                  See what Pro adds
                  <svg className="arrow-nudge w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── What we hold to (principles) ──────────────────────────────────────── */}
        <section>
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20">
            <div className="max-w-[640px]" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">What we hold to</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                Four things we won&apos;t trade away.
              </h2>
            </div>
            <div className="mt-10 grid sm:grid-cols-2 gap-5">
              {PRINCIPLES.map((p, i) => (
                <div key={p.title} className="card-lift rounded-2xl border border-line bg-white p-7 shadow-elev-1" data-reveal style={{ transitionDelay: `${(i % 2) * 80}ms` }}>
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                    <PrincipleIcon name={p.icon} />
                  </div>
                  <h3 className="text-[16.5px] font-semibold text-ink mt-4">{p.title}</h3>
                  <p className="text-[14.5px] text-ink-body leading-[1.65] mt-2">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Who built it ──────────────────────────────────────────────────────── */}
        <section className="bg-band border-y border-line-soft">
          <div className="mx-auto w-full max-w-[1120px] px-5 sm:px-8 py-20 grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
            <div className="lg:col-span-5" data-reveal>
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-700">Who built it</p>
              <h2 className="font-editorial font-semibold text-ink text-[2rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.015em] mt-3">
                Built with the people who file.
              </h2>
            </div>
            <div className="lg:col-span-7" data-reveal style={{ transitionDelay: "80ms" }}>
              <div className="space-y-4 text-[16px] text-ink-body leading-[1.75]">
                <p>
                  Saaksh is built by <span className="font-semibold text-ink">Rahul Upadhyay</span>, working in the
                  climate and compliance space. The tool is shaped directly by feedback from practising BRSR
                  consultants, who validated that data collection, not analysis, is where the real pain sits, and who
                  continue to steer what gets built next.
                </p>
                <p>
                  If you prepare BRSR reports and something here would be more useful done differently, that feedback
                  shapes the roadmap. Reach out any time.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/" target="_blank" rel="noopener noreferrer"
                  className="pressable inline-flex items-center gap-2 rounded-xl border border-line bg-white text-ink text-[14px] font-semibold px-4 py-2.5 hover:bg-band transition-colors">
                  Connect on LinkedIn
                </a>
                <a href="mailto:rahulu626@gmail.com"
                  className="pressable inline-flex items-center gap-2 rounded-xl border border-line bg-white text-ink text-[14px] font-semibold px-4 py-2.5 hover:bg-band transition-colors">
                  rahulu626@gmail.com
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Closing CTA (gradient band) ───────────────────────────────────────── */}
        <section className="px-5 sm:px-8 py-16">
          <div className="relative overflow-hidden mx-auto w-full max-w-[1120px] rounded-3xl bg-gradient-to-br from-forest via-[#123a6b] to-brand-800 shadow-elev-3">
            <GlowOrb tone="brand" className="w-[440px] h-[440px] -top-24 -right-16" />
            <Contours className="w-[420px] h-[420px] -left-20 -bottom-24 text-brand-400" stroke="#4D97F0" opacity={0.14} />
            <div className="relative px-8 sm:px-12 py-14 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <h2 className="font-editorial font-semibold text-white text-[1.9rem] sm:text-[2.2rem] leading-tight tracking-[-0.015em]">
                  See it on your next client.
                </h2>
                <p className="text-[15.5px] text-ondark-muted leading-relaxed mt-3 max-w-[460px]">
                  A gap-analysed, cited BRSR action plan in under a minute. No login, nothing stored.
                </p>
              </div>
              <Link href="/start" className="group cta-glow shrink-0 inline-flex items-center justify-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-6 py-3.5 hover:bg-white">
                Start a free report
                <svg className="arrow-nudge w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <BlogFooter />
    </div>
  );
}
