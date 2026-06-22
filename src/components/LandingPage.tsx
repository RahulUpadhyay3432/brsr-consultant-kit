"use client";

// Marketing homepage. Shown to first-time visitors; "Start a free report" hands
// off to the intake form (onStart). Product panels are built in live HTML/CSS
// from the real design tokens — crisp at any size, responsive, no image assets.

import ResumeBanner from "@/components/ResumeBanner";

interface LandingPageProps {
  onStart: () => void;
  // Set when in-progress work is saved on this device — shows a "Continue where
  // you left off" banner under the header so the consultant's work isn't stranded.
  resume?: { companyName: string; onResume: () => void } | null;
}

const COMPLIANCE_CHAT = "https://huggingface.co/spaces/sherlockwatson221/climate-compliance";

export default function LandingPage({ onStart, resume }: LandingPageProps) {
  const scrollTo = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#F7F6F2] text-stone-900">
      <Header onStart={onStart} />

      {resume && (
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-4">
          <ResumeBanner companyName={resume.companyName} onResume={resume.onResume} />
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-grid">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-14 sm:pt-20 pb-16">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
            <div>
              <div className="anim-up-sm inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                <span className="text-[11px] font-semibold text-brand-800 tracking-[0.1em] uppercase">
                  For ESG consultants · India · Free
                </span>
              </div>

              <h1
                className="anim-up-hero font-display font-light text-[2.6rem] sm:text-[3.6rem] leading-[1.05] tracking-[-0.02em] text-stone-900 mt-6"
                style={{ textWrap: "balance", animationDelay: "60ms" }}
              >
                Prepare your client&apos;s{" "}
                <span className="italic text-brand-700">BRSR report</span> in a fraction of the time.
              </h1>

              <p
                className="anim-up-md text-[16.5px] sm:text-[18px] text-stone-600 leading-[1.65] mt-6 max-w-[520px]"
                style={{ animationDelay: "160ms" }}
              >
                A free, on-device readiness tool for independent ESG consultants in India. Fill a
                short intake and get a gap-analysed BRSR action plan, suggested materiality, and
                cross-framework mapping, ready for your client meeting in minutes.
              </p>

              <div className="anim-up-md flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: "240ms" }}>
                <button
                  onClick={onStart}
                  className="inline-flex items-center gap-2 bg-forest text-white text-[14.5px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable shadow-sm"
                >
                  Start a free report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <button
                  onClick={scrollTo("how-it-works")}
                  className="inline-flex items-center gap-2 bg-white text-stone-700 text-[14.5px] font-medium px-5 py-3 rounded-xl border border-stone-200 hover:border-stone-300 hover:bg-stone-50 transition-colors pressable"
                >
                  See how it works
                </button>
              </div>

              <p className="anim-up-md flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-stone-400 mt-5" style={{ animationDelay: "320ms" }}>
                <TrustDot /> No login
                <span className="text-stone-300">·</span>
                <TrustDot /> Client data never leaves your browser
                <span className="text-stone-300">·</span>
                <TrustDot /> Cited to SEBI &amp; ICAI
              </p>
            </div>

            {/* Live "readiness report" panel */}
            <div className="anim-card" style={{ animationDelay: "300ms" }}>
              <ReadinessPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── Built on primary sources ───────────────────────────────────────── */}
      <section className="border-y border-black/[0.06] bg-[#f3f1ea]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-7">
          <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-stone-400 mb-4">
            Built on primary sources
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {["SEBI BRSR Format", "ICAI Background Material 2024", "CEA emission factors", "IPCC 2006", "GRI · TCFD · IFRS S1/S2"].map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[12.5px] font-medium text-stone-600 shadow-[0_1px_2px_rgba(80,60,30,0.03)]">
                <svg className="w-3 h-3 text-brand-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how-it-works" className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="font-display font-light text-[2rem] sm:text-[2.6rem] leading-[1.1] tracking-[-0.02em] text-center text-stone-900 mt-3" style={{ textWrap: "balance" }}>
          From blank format to client-ready plan, in three steps.
        </h2>
        <div className="grid md:grid-cols-3 gap-4 mt-12">
          {[
            { n: 1, title: "Tell us about your client", body: "Industry, size, and existing compliance filings, the things you already know from the first call.", foot: "About a minute" },
            { n: 2, title: "Get a readiness report", body: "All 108 BRSR fields, gap-analysed: what's already covered by their filings, what to verify, and what to collect fresh.", foot: "Instant, generated in your browser" },
            { n: 3, title: "Walk in prepared", body: "Every field sourced to SEBI / ICAI, with best practices, suggested materiality, framework mapping, and built-in emission calculators.", foot: "Ready for the client meeting" },
          ].map((s) => (
            <div key={s.n} className="relative bg-white rounded-2xl border border-stone-200 p-6 shadow-[0_1px_3px_rgba(80,60,30,0.04)] overflow-hidden">
              <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-brand-500 to-brand-700" />
              <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-[13px] font-semibold tabular-nums">{s.n}</div>
              <h3 className="text-[15px] font-semibold text-stone-900 mt-4">{s.title}</h3>
              <p className="text-[13.5px] text-stone-500 leading-relaxed mt-1.5">{s.body}</p>
              <p className="text-[11.5px] text-stone-400 mt-4">{s.foot}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature 1 — Action plan ────────────────────────────────────────── */}
      <FeatureSection
        eyebrow="Gap-analysed action plan"
        title="See what's already covered."
        body="All 108 BRSR fields, colour-coded Ready / Verify / Collect, so you stop collecting what their existing filings already contain and focus on the client's time on the real gaps."
        panel={<ActionPlanPanel />}
      />

      {/* ── Feature 2 — Materiality ────────────────────────────────────────── */}
      <FeatureSection
        reverse
        tint
        eyebrow="Suggested materiality"
        title="Start the materiality conversation."
        body="A suggested shortlist of material ESG topics for your client's industry, a starting point for the stakeholder-driven process, with a downloadable assessment template. Honestly framed: a head start, not a finished assessment."
        panel={<MaterialityPanel />}
      />

      {/* ── Feature 3 — Frameworks ─────────────────────────────────────────── */}
      <FeatureSection
        eyebrow="Cross-framework mapping"
        title="Collect once, report across all."
        body="Every BRSR disclosure mapped to GRI, TCFD, IFRS S1/S2, and TNFD for nature, plus MSCI and DJSI rating criteria. One round of data collection serves every report your client needs."
        panel={<AlignmentPanel />}
      />

      {/* ── Trust ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.18em] text-white/40 mb-3">Why consultants trust it</p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.6rem] text-center tracking-[-0.02em]">Trust is the product.</h2>

          <div className="grid sm:grid-cols-3 gap-4 mt-12">
            {[
              { t: "Cited and versioned", b: "Every disclosure and emission factor traces to SEBI, ICAI, CEA or IPCC, so what you put in front of a client is defensible." },
              { t: "100% on-device", b: "Your client's data never leaves the browser. No upload, no account, nothing stored. Privacy by architecture, not by policy." },
              { t: "Free", b: "Built for independent consultants, free to use. No trial, no card, no catch. The paid tools layer on top when you need them." },
            ].map((c) => (
              <div key={c.t} className="rounded-2xl bg-white/[0.04] border border-white/10 p-6">
                <div className="w-8 h-8 rounded-lg bg-brand-500/15 border border-brand-400/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="text-[15px] font-semibold mt-4">{c.t}</h3>
                <p className="text-[13.5px] text-white/55 leading-relaxed mt-1.5">{c.b}</p>
              </div>
            ))}
          </div>

          {/* Founder's note (relabelled from a testimonial) */}
          <div className="mt-10 rounded-2xl bg-white/[0.04] border border-white/10 p-6 sm:p-8 max-w-[760px] mx-auto">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/35">Why I built this</p>
            <p className="font-display text-[18px] sm:text-[20px] leading-[1.55] text-white/90 mt-3 italic">
              &ldquo;I work in climate compliance, and the first week of every BRSR engagement was the
              same scramble: a blank format, scattered filings, and no quick way to see what was
              already covered. This is the tool I wished I had.&rdquo;
            </p>
            <p className="text-[13px] text-white/55 mt-4">Rahul Upadhyay · maker of BRSR Consultant Kit</p>
          </div>
        </div>
      </section>

      {/* ── Empathy + stats ────────────────────────────────────────────────── */}
      <section className="bg-grid">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_2px_20px_rgba(100,80,40,0.06)] p-7 sm:p-10 grid lg:grid-cols-2 gap-8 items-center">
            <h2 className="font-display font-light text-[1.9rem] sm:text-[2.3rem] leading-[1.12] tracking-[-0.02em] text-stone-900" style={{ textWrap: "balance" }}>
              Built for independent ESG &amp; BRSR consultants in India.
            </h2>
            <p className="text-[14.5px] sm:text-[15px] text-stone-600 leading-[1.7]">
              You know the moment: a new client, a blank 100+-field BRSR format, and no quick way to
              tell <strong className="text-stone-800">what&apos;s already covered</strong> by their annual report and existing filings,
              <strong className="text-stone-800"> what&apos;s irrelevant</strong> to their business, or <strong className="text-stone-800">where each number should come from</strong>.
              This kit turns that first week of orientation into a few minutes, so you walk into the
              client meeting with a defensible plan instead of a spreadsheet of questions.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-px mt-4 bg-stone-200/70 border border-stone-200/70 rounded-2xl overflow-hidden">
            {[
              { n: "108", l: "BRSR fields" },
              { n: "9", l: "NGRBC principles" },
              { n: "68", l: "framework mappings" },
              { n: "0", l: "data stored" },
            ].map((s) => (
              <div key={s.l} className="bg-brand-50/70 px-5 py-8 text-center">
                <p className="font-display text-[2.6rem] sm:text-[3rem] leading-none text-brand-800 tabular-nums">{s.n}</p>
                <p className="text-[12.5px] text-brand-700/70 mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-[#0f0f0f] text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.8rem] leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Start your client&apos;s BRSR readiness report.
          </h2>
          <button
            onClick={onStart}
            className="inline-flex items-center gap-2 bg-white text-stone-900 text-[15px] font-semibold px-6 py-3.5 rounded-xl hover:bg-stone-100 transition-colors pressable mt-8"
          >
            Start a free report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[12px] text-white/40 mt-6">
            No login <span className="text-white/20">·</span> Client data never leaves your browser <span className="text-white/20">·</span> Cited to SEBI &amp; ICAI
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────────────────────────── */
function Header({ onStart }: { onStart: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-[#F7F6F2]/85 backdrop-blur-md border-b border-black/[0.06]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[26px] h-[26px] rounded-md bg-[#111] flex items-center justify-center">
            <span className="text-[10px] font-bold text-white leading-none">BK</span>
          </div>
          <span className="text-[13.5px] font-semibold text-stone-900 tracking-[-0.01em]">BRSR Consultant Kit</span>
        </div>
        <div className="flex items-center gap-2.5">
          <a href={COMPLIANCE_CHAT} target="_blank" rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] font-medium text-stone-600 hover:text-stone-900 transition-colors">
            Compliance Chat
            <svg className="w-2.5 h-2.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
          <button onClick={onStart} className="inline-flex items-center bg-forest text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-forest-light transition-colors pressable">
            Start a free report
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#F7F6F2] border-t border-black/[0.07]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-[11px] text-stone-400">
          Built by{" "}
          <a href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/" target="_blank" rel="noopener noreferrer" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">Rahul Upadhyay</a>
          {" · "}
          <a href="mailto:rahulu626@gmail.com" className="text-stone-600 hover:text-stone-900 underline underline-offset-2">rahulu626@gmail.com</a>
        </p>
        <p className="text-[11px] text-stone-400">ICAI BRSR 2024 · SEBI Circulars · MoEFCC Rules</p>
      </div>
    </footer>
  );
}

/* ── Shared bits ────────────────────────────────────────────────────────────── */
function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-center text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-700">{children}</p>;
}
function TrustDot() {
  return <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />;
}

function FeatureSection({
  eyebrow, title, body, panel, reverse, tint,
}: {
  eyebrow: string; title: string; body: string; panel: React.ReactNode; reverse?: boolean; tint?: boolean;
}) {
  return (
    <section className={tint ? "bg-[#f3f1ea] border-y border-black/[0.05]" : ""}>
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <div className={`grid lg:grid-cols-2 gap-10 lg:gap-14 items-center ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
            <h2 className="font-display font-light text-[1.9rem] sm:text-[2.4rem] leading-[1.1] tracking-[-0.02em] text-stone-900 mt-3" style={{ textWrap: "balance" }}>{title}</h2>
            <p className="text-[14.5px] sm:text-[15px] text-stone-600 leading-[1.7] mt-4 max-w-[480px]">{body}</p>
          </div>
          <div>{panel}</div>
        </div>
      </div>
    </section>
  );
}

/* ── Live product panels ────────────────────────────────────────────────────── */
function PanelFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 shadow-[0_8px_40px_rgba(80,60,30,0.08)] overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-stone-100 bg-stone-50/60">
        <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
        <span className="w-2.5 h-2.5 rounded-full bg-stone-200" />
        <span className="ml-2 text-[11px] font-medium text-stone-400">{title}</span>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

function ReadinessPanel() {
  const principles = [
    { id: "P1", name: "Ethics & transparency", r: 6, v: 2, c: 3 },
    { id: "P3", name: "Employee wellbeing", r: 4, v: 5, c: 12 },
    { id: "P6", name: "Environment", r: 3, v: 4, c: 16 },
    { id: "P9", name: "Consumer responsibility", r: 5, v: 1, c: 5 },
  ];
  const R = 34, C = 2 * Math.PI * R, pct = 67;
  return (
    <PanelFrame title="Readiness · pull from filing">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative" style={{ width: 86, height: 86 }}>
          <svg width="86" height="86" viewBox="0 0 86 86" className="-rotate-90">
            <circle cx="43" cy="43" r={R} fill="none" className="stroke-stone-100" strokeWidth="8" />
            <circle cx="43" cy="43" r={R} fill="none" className="stroke-brand-600" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[20px] font-semibold tabular-nums text-stone-900 leading-none">{pct}<span className="text-[11px] text-stone-400">%</span></span>
            <span className="text-[8px] font-bold uppercase tracking-[0.14em] text-stone-400 mt-0.5">Ready</span>
          </div>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-2">
          {[{ n: 38, l: "Ready", c: "text-emerald-600" }, { n: 12, l: "Verify", c: "text-amber-600" }, { n: 58, l: "Collect", c: "text-stone-600" }].map((s) => (
            <div key={s.l} className="rounded-lg bg-stone-50 border border-stone-100 px-2 py-2">
              <p className={`text-[18px] font-semibold tabular-nums leading-none ${s.c}`}>{s.n}</p>
              <p className="text-[10px] text-stone-400 mt-1">{s.l}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 mb-2">Readiness by principle</p>
      <div className="space-y-1.5">
        {principles.map((p) => {
          const total = p.r + p.v + p.c;
          return (
            <div key={p.id} className="flex items-center gap-2.5">
              <span className="text-[10px] font-mono font-semibold text-stone-400 w-5">{p.id}</span>
              <span className="flex-1 text-[12px] text-stone-700 truncate">{p.name}</span>
              <span className="flex items-stretch gap-0.5 h-1.5 w-16">
                <span className="bg-emerald-500 rounded-full" style={{ flexGrow: p.r }} />
                <span className="bg-amber-400 rounded-full" style={{ flexGrow: p.v }} />
                <span className="bg-stone-300 rounded-full" style={{ flexGrow: p.c }} />
              </span>
              <span className="text-[10.5px] tabular-nums text-stone-400 w-9 text-right">{p.r + p.v}/{total}</span>
            </div>
          );
        })}
      </div>
    </PanelFrame>
  );
}

function StatusPill({ kind }: { kind: "ready" | "verify" | "collect" }) {
  const map = {
    ready: ["Ready", "text-emerald-700 bg-emerald-50 border-emerald-200"],
    verify: ["Verify", "text-amber-700 bg-amber-50 border-amber-200"],
    collect: ["Collect", "text-stone-600 bg-stone-100 border-stone-200"],
  } as const;
  const [label, cls] = map[kind];
  return <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${cls} whitespace-nowrap`}>{label}</span>;
}

function ActionPlanPanel() {
  const rows: { id: string; label: string; kind: "ready" | "verify" | "collect" }[] = [
    { id: "P1-E1", label: "Training & awareness on the principles", kind: "ready" },
    { id: "P3-E1", label: "Well-being measures for employees", kind: "verify" },
    { id: "P6-E1", label: "Total energy consumption & intensity", kind: "ready" },
    { id: "P6-E7", label: "Scope 1 & Scope 2 GHG emissions", kind: "verify" },
    { id: "P1-E4", label: "Anti-corruption / anti-bribery policy", kind: "collect" },
    { id: "P6-E3", label: "Water withdrawal by source", kind: "collect" },
  ];
  return (
    <PanelFrame title="Action Plan">
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-stone-50">
            <span className="text-[10px] font-mono font-semibold text-stone-400 w-12">{r.id}</span>
            <span className="flex-1 text-[12.5px] text-stone-700 truncate">{r.label}</span>
            <StatusPill kind={r.kind} />
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

function MaterialityPanel() {
  const topics = [
    { t: "GHG emissions & energy", p: "P6", tone: "emerald" },
    { t: "Occupational health & safety", p: "P3", tone: "blue" },
    { t: "Water stewardship", p: "P6", tone: "emerald" },
    { t: "Business ethics & anti-corruption", p: "P1", tone: "violet" },
  ] as const;
  const tones: Record<string, string> = {
    emerald: "text-emerald-700 bg-emerald-50 border-emerald-200",
    blue: "text-blue-700 bg-blue-50 border-blue-200",
    violet: "text-violet-700 bg-violet-50 border-violet-200",
  };
  return (
    <PanelFrame title="Suggested materiality">
      <div className="grid grid-cols-2 gap-2">
        {topics.map((t) => (
          <div key={t.t} className="rounded-xl border border-stone-200 p-3">
            <span className={`inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded border ${tones[t.tone]}`}>{t.p}</span>
            <p className="text-[12px] font-medium text-stone-700 leading-snug mt-2">{t.t}</p>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}

function AlignmentPanel() {
  const rows = [
    { id: "P6-E1", label: "Energy consumption & intensity", fw: ["GRI", "TCFD", "IFRS"] },
    { id: "P6-E7", label: "Scope 1 & 2 GHG emissions", fw: ["GRI", "TCFD", "IFRS", "TNFD"] },
    { id: "P1-G1", label: "Board ESG oversight", fw: ["GRI", "TCFD"] },
    { id: "P3-L1", label: "Employee headcount by gender", fw: ["GRI", "MSCI"] },
  ];
  const fwTone: Record<string, string> = {
    GRI: "text-blue-700 bg-blue-50 border-blue-100",
    TCFD: "text-violet-700 bg-violet-50 border-violet-100",
    IFRS: "text-emerald-700 bg-emerald-50 border-emerald-100",
    TNFD: "text-teal-700 bg-teal-50 border-teal-100",
    MSCI: "text-amber-700 bg-amber-50 border-amber-100",
  };
  return (
    <PanelFrame title="Alignment">
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-2.5 px-1 py-1.5">
            <span className="text-[10px] font-mono font-semibold text-stone-400 w-12">{r.id}</span>
            <span className="flex-1 text-[12px] text-stone-700 truncate">{r.label}</span>
            <span className="flex gap-1">
              {r.fw.map((f) => (
                <span key={f} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${fwTone[f]}`}>{f}</span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </PanelFrame>
  );
}
