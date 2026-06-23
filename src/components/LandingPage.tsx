"use client";

// Saaksh marketing homepage — Evergreen & Ember design system (Newsreader display,
// Hanken Grotesk body, IBM Plex Mono labels). Rebuilt from the Claude Design mockup.
// All product panels are live HTML/CSS/SVG (no image assets). "Start a free report"
// hands off to the intake form via onStart.

import { useState } from "react";
import ResumeBanner from "@/components/ResumeBanner";
import { REQUEST_ACCESS_URL } from "@/lib/links";

interface LandingPageProps {
  onStart: () => void;
  resume?: { companyName: string; onResume: () => void } | null;
}

const COMPLIANCE_CHAT = "https://huggingface.co/spaces/sherlockwatson221/climate-compliance";
const BODY = "text-[#3F4A44]";

export default function LandingPage({ onStart, resume }: LandingPageProps) {
  const scrollTo = (id: string) => () =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#14201B]">
      <Header onStart={onStart} scrollTo={scrollTo} />

      {resume && (
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-4">
          <ResumeBanner companyName={resume.companyName} onResume={resume.onResume} />
        </div>
      )}

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="bg-grid">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-16 lg:pb-24">
          <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-12 items-center">
            <div>
              <div className="anim-up-sm inline-flex items-center gap-2 rounded-full border border-[#E6E3DB] bg-white/70 pl-2 pr-3.5 py-1">
                <span className="font-display text-[13px] text-brand-700">साक्ष्य</span>
                <span className="text-[12px] text-[#5B6660]">Evidence, by name and by design</span>
              </div>

              <h1 className="anim-up-hero font-display font-normal text-[3rem] sm:text-[4.2rem] leading-[1.02] tracking-[-0.02em] mt-6" style={{ textWrap: "balance", animationDelay: "60ms" }}>
                Prepare a client&apos;s <span className="italic">BRSR report</span> in a fraction of the time.
              </h1>

              <p className={`anim-up-md text-[16.5px] sm:text-[18px] ${BODY} leading-[1.6] mt-6 max-w-[530px]`} style={{ animationDelay: "160ms" }}>
                The first week of a BRSR engagement is the same scramble every time: a blank 108-field
                format, filings scattered across teams, no quick read on what&apos;s already covered.
                Saaksh turns that into minutes, with a gap-analysed plan and a plain-English AI
                explanation on every field, cited and on your device.
              </p>

              <div className="anim-up-md flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: "240ms" }}>
                <button onClick={onStart} className="inline-flex items-center gap-2 bg-forest text-white text-[14.5px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable shadow-sm">
                  Start a free report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <button onClick={scrollTo("how")} className="inline-flex items-center gap-2 bg-white text-[#14201B] text-[14.5px] font-medium px-5 py-3 rounded-xl border border-[#E6E3DB] hover:bg-[#FCFBF7] transition-colors pressable">
                  See how it works
                </button>
              </div>

              <p className="anim-up-md flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11.5px] text-[#5B6660] mt-6" style={{ animationDelay: "320ms" }}>
                <Dot /> Client data never leaves your browser <span className="text-[#C9CFC9]">·</span>
                <Dot /> Plain-English AI <span className="text-[#C9CFC9]">·</span>
                <Dot /> Cited to SEBI &amp; ICAI
              </p>
            </div>

            <div className="anim-card" style={{ animationDelay: "280ms" }}>
              <ReadinessPanel />
            </div>
          </div>
        </div>
      </section>

      {/* ── Sources bar ────────────────────────────────────────────────────── */}
      <section className="border-y border-[#E6E3DB] bg-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-6 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#8A938D]">Built on primary sources</span>
          {["SEBI BRSR Format", "ICAI 2024", "CEA factors", "IPCC 2006", "GRI · TCFD · IFRS"].map((s) => (
            <span key={s} className="font-display text-[15px] text-[#14201B]">{s}</span>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how" className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.8rem] leading-[1.06] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
          Three steps from intake to engagement.
        </h2>
        <p className={`text-[15.5px] ${BODY} leading-relaxed mt-4 max-w-[560px]`}>
          No setup, no account. Open the tool, describe the client, and get a defensible plan you can take into the room.
        </p>
        <div className="grid md:grid-cols-3 gap-10 sm:gap-8 mt-12">
          {[
            { n: "01", t: "Tell us about the client", b: "A short intake: sector, listing category, what's already in their last filing. Two minutes, on your device." },
            { n: "02", t: "Get a gap-analysed report", b: "All 108 fields sorted into Ready, Verify and Collect, with suggested materiality and cross-framework mapping." },
            { n: "03", t: "Walk in prepared", b: "Export a clean client-ready PDF brief and a CSV of every data point you still need to collect." },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-display text-[2.4rem] text-brand-500 leading-none">{s.n}</p>
              <h3 className="text-[16px] font-semibold text-[#14201B] mt-4">{s.t}</h3>
              <p className={`text-[14px] ${BODY} leading-relaxed mt-2`}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature: Action plan ───────────────────────────────────────────── */}
      <FeatureRow eyebrow="The readiness report" title="A gap-analysed action plan, colour-coded." panel={<ActionPlanPanel />}>
        <p className={`text-[15.5px] ${BODY} leading-relaxed`}>
          Every disclosure is matched against the client&apos;s last filing and sorted: what&apos;s{" "}
          <span className="text-brand-700 font-medium">Ready</span>, what to{" "}
          <span className="text-[#8A6516] font-medium">Verify</span>, and what you still need to{" "}
          <span className="text-[#A8481B] font-medium">Collect</span>. Open any field for a plain-English explanation written from the public SEBI definition.
        </p>
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#E6E3DB] bg-[#FCFBF7] px-3.5 py-3 max-w-[440px]">
          <Spark />
          <p className="text-[12.5px] text-[#5B6660] leading-relaxed">
            <span className="font-semibold text-[#14201B]">In plain English</span> is AI-written, once, from public definitions. No client data is involved, and the text ships static.
          </p>
        </div>
      </FeatureRow>

      {/* ── Materiality + Alignment (two-up) ───────────────────────────────── */}
      <section className="bg-white border-y border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <Eyebrow>Suggested materiality</Eyebrow>
            <h2 className="font-display font-normal text-[2rem] sm:text-[2.4rem] leading-[1.08] tracking-[-0.02em] mt-3">Where to focus, by sector.</h2>
            <p className={`text-[15px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>A starting materiality view drawn from the client&apos;s sector, so the conversation begins with the topics that matter most.</p>
            <div className="mt-6"><MaterialityPanel /></div>
          </div>
          <div>
            <Eyebrow>Cross-framework alignment</Eyebrow>
            <h2 className="font-display font-normal text-[2rem] sm:text-[2.4rem] leading-[1.08] tracking-[-0.02em] mt-3">One disclosure, mapped everywhere.</h2>
            <p className={`text-[15px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>Each BRSR data point is linked to its equivalent in GRI, TCFD, IFRS S2 and TNFD, plus the ratings the client cares about.</p>
            <div className="mt-6"><AlignmentPanel /></div>
          </div>
        </div>
      </section>

      {/* ── Feature: Calculators ───────────────────────────────────────────── */}
      <FeatureRow eyebrow="Calculators & exports" title="The maths is done, and it's cited." panel={<GhgCalculatorPanel />}>
        <p className={`text-[15.5px] ${BODY} leading-relaxed`}>
          Built-in GHG, energy and water calculators convert raw activity data into BRSR-ready figures, using CEA and IPCC factors with the version noted on every line. Export a CSV for your working file and a clean PDF brief for the client.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#14201B] bg-white border border-[#E6E3DB] px-3.5 py-2 rounded-lg">Export CSV</span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-forest px-3.5 py-2 rounded-lg">Client-ready PDF brief</span>
        </div>
      </FeatureRow>

      {/* ── AI section (dark) ──────────────────────────────────────────────── */}
      <section className="bg-forest text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-400">On AI</p>
            <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.8rem] leading-[1.05] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>
              AI where it helps, never where it can mislead.
            </h2>
            <p className="text-[15.5px] text-[#BFD3CA] leading-relaxed mt-5 max-w-[460px]">
              What you put before a client has to be defensible. So AI does the explaining and the drafting, never the deciding, and never the inventing.
            </p>
          </div>
          <div className="space-y-6">
            {[
              { t: "Plain-English explanations", b: "Written once from public SEBI definitions and shipped as static text. Nothing about your client is ever sent anywhere." },
              { t: "The narrative draft is grounded", b: "Collect's draft turns the numbers you gathered into review-ready prose. It never invents a figure; every number traces to its source." },
              { t: "Everything stays cited", b: "Each disclosure links to SEBI, ICAI, CEA or IPCC, with the version noted. You can defend every line." },
            ].map((p, i) => (
              <div key={p.t} className={i > 0 ? "border-t border-white/10 pt-6" : ""}>
                <p className="flex items-center gap-2 text-[15px] font-semibold text-white"><span className="w-1.5 h-1.5 rounded-full bg-brand-400" />{p.t}</p>
                <p className="text-[13.5px] text-[#9FB6AC] leading-relaxed mt-1.5 pl-3.5">{p.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Collect (paid tier) ────────────────────────────────────────────── */}
      <section id="collect" className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#A8481B] bg-[#FBE7DC] border border-[#F2CDBA] rounded px-2 py-1">Collect · paid tier</span>
          <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.7rem] leading-[1.06] tracking-[-0.02em] mt-4">Chase the data without chasing people.</h2>
          <p className={`text-[15.5px] ${BODY} leading-relaxed mt-5 max-w-[470px]`}>
            When you move from preparing to collecting, Collect requests BRSR data from the client&apos;s team with branded emails and automatic reminders. They submit through a no-login form with evidence attached, emissions are calculated with cited factors, and an AI draft turns the result into review-ready narrative.
          </p>
          <ul className="mt-6 space-y-2.5">
            {["Branded request emails & auto-reminders", "No-login submission with evidence attachments", "Emissions calculated with attributed factors"].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#14201B]"><Check />{f}</li>
            ))}
          </ul>
          <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable mt-7">
            Request Pro access
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <p className="text-[12.5px] text-[#8A938D] mt-3 max-w-[440px]">The readiness tool stays free and needs no login. Collect is the paid tier; we onboard you on request.</p>
        </div>
        <CollectPanel />
      </section>

      {/* ── Free vs Pro ────────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <Eyebrow>Free and Pro</Eyebrow>
          <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.8rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>
            Everything you need to prepare is free.
          </h2>
          <p className={`text-[15px] ${BODY} leading-relaxed mt-4 max-w-[600px]`}>
            The readiness tool, including the GHG, energy and water calculators, is free and runs on
            your device. Pro adds Collect: the engine for gathering data from the client&apos;s team and
            the grounded AI narrative draft.
          </p>
          <div className="grid md:grid-cols-2 gap-4 mt-12">
            {/* Free */}
            <div className="rounded-2xl border border-[#E6E3DB] bg-[#FCFBF7] p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-[20px] text-[#14201B]">Free · the readiness tool</span>
                <span className="font-mono text-[9.5px] uppercase tracking-wide text-[#0E7A56] bg-[#E3F7F0] rounded-full px-2 py-1 whitespace-nowrap">No login</span>
              </div>
              <p className="text-[13px] text-[#5B6660] leading-relaxed mt-2">Prepare a defensible report start to finish, on your device.</p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Gap-analysed action plan (Ready / Verify / Collect)",
                  "Built-in GHG, energy and water calculators",
                  "Suggested materiality and cross-framework mapping",
                  "Plain-English AI explanation on every field",
                  "CSV export and a client-ready PDF brief",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#3F4A44] leading-snug"><Check className="text-brand-600 mt-0.5" />{f}</li>
                ))}
              </ul>
            </div>
            {/* Pro */}
            <div className="rounded-2xl bg-forest text-white p-6 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-[20px] text-white">Pro · Collect</span>
                <span className="font-mono text-[9.5px] uppercase tracking-wide text-forest bg-brand-400 rounded-full px-2 py-1 whitespace-nowrap">Paid</span>
              </div>
              <p className="text-[13px] text-[#BFD3CA] leading-relaxed mt-2">Everything in Free, plus the tools to collect at scale.</p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Chase data from the client's team with branded emails and auto-reminders",
                  "No-login owner submission with evidence attached",
                  "Emissions auto-computed and attributed to source",
                  "Grounded AI narrative draft, review-ready",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-[#EAF3EE] leading-snug"><Check className="text-brand-400 mt-0.5" />{f}</li>
                ))}
              </ul>
              <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-brand-500 text-forest text-[13.5px] font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-400 transition-colors pressable mt-6">
                Request Pro access
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Modules ────────────────────────────────────────────────────────── */}
      <section id="modules" className="bg-white border-t border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <Eyebrow>The platform</Eyebrow>
          <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.8rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>One platform, more compliance over time.</h2>
          <p className={`text-[15px] ${BODY} leading-relaxed mt-4 max-w-[560px]`}>Saaksh starts with BRSR. The same evidence-first approach extends to the frameworks Indian businesses face next.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              { code: "BRSR", live: true, desc: "SEBI's Business Responsibility & Sustainability Report, for India's top 1,000 listed companies. The full readiness tool, free." },
              { code: "CBAM", live: false, desc: "The EU's Carbon Border Adjustment Mechanism, for exporters of steel, aluminium, cement and more." },
              { code: "CCTS", live: false, desc: "India's Carbon Credit Trading Scheme, with intensity targets and credit accounting." },
              { code: "Broader ESG", live: false, desc: "Voluntary disclosures and assurance support across GRI, TCFD and IFRS sustainability standards." },
            ].map((m) => (
              <div key={m.code} className={`rounded-2xl p-6 ${m.live ? "bg-forest text-white" : "bg-[#FAF8F3] border border-[#E6E3DB]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className={`font-display text-[19px] leading-tight ${m.live ? "text-white" : "text-[#14201B]"}`}>{m.code}</span>
                  {m.live ? (
                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-forest bg-brand-400 rounded-full px-2 py-1 whitespace-nowrap">Available now</span>
                  ) : (
                    <span className="font-mono text-[9.5px] uppercase tracking-wide text-[#8A938D] bg-white border border-[#E6E3DB] rounded-full px-2 py-1 whitespace-nowrap">Coming soon</span>
                  )}
                </div>
                <p className={`text-[13px] leading-relaxed mt-4 ${m.live ? "text-[#BFD3CA]" : "text-[#5B6660]"}`}>{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust + founder ────────────────────────────────────────────────── */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { t: "Cited & versioned", b: "Every disclosure and emission factor traces to SEBI, ICAI, CEA or IPCC, so what you put in front of a client is defensible." },
            { t: "100% on-device", b: "The free readiness tool runs entirely in your browser. No upload, no account, nothing stored." },
            { t: "Free to start", b: "Built for independent consultants. The readiness tool is free; the paid Collect tools layer on when you need them." },
          ].map((c) => (
            <div key={c.t}>
              <h3 className="font-display text-[19px] text-[#14201B]">{c.t}</h3>
              <p className={`text-[14px] ${BODY} leading-relaxed mt-2`}>{c.b}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 rounded-2xl bg-white border border-[#E6E3DB] p-7 sm:p-9 max-w-[820px]">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#8A938D]">Why I built this</p>
          <p className="font-display text-[19px] sm:text-[22px] leading-[1.5] text-[#14201B] mt-3">
            &ldquo;I work in climate compliance, and the first week of every BRSR engagement was the same scramble: a blank format, scattered filings, and no quick way to see what was already covered. This is the tool I wished I had, and where Saaksh begins.&rdquo;
          </p>
          <p className="text-[13px] text-[#5B6660] mt-4">Rahul Upadhyay · maker of Saaksh</p>
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FCFBF7] border-y border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16">
          <p className="font-display font-normal text-center text-[1.7rem] sm:text-[2.2rem] leading-[1.18] tracking-[-0.02em] text-[#14201B] max-w-[640px] mx-auto" style={{ textWrap: "balance" }}>
            The first week of a BRSR engagement, done in minutes. Gap-analysed, cited, and ready to send.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { n: "108", l: "BRSR fields" },
              { n: "9", l: "NGRBC principles" },
              { n: "68", l: "framework mappings" },
              { n: "0", l: "records stored" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-display text-[2.8rem] sm:text-[3.2rem] leading-none text-forest">{s.n}</p>
                <p className="font-mono text-[11.5px] uppercase tracking-wide text-[#8A938D] mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-forest text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display font-normal text-[2.4rem] sm:text-[3.2rem] leading-[1.05] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Walk into your next BRSR engagement prepared.
          </h2>
          <button onClick={onStart} className="inline-flex items-center gap-2 bg-brand-500 text-forest text-[15px] font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-400 transition-colors pressable mt-8">
            Start a free report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <p className="font-mono text-[11.5px] text-[#9FB6AC] mt-5">No login · Client data never leaves your browser · Cited to SEBI &amp; ICAI</p>
        </div>
      </section>

      <Footer onStart={onStart} scrollTo={scrollTo} />
    </div>
  );
}

/* ── Header / Footer ───────────────────────────────────────────────────────── */
function Header({ onStart, scrollTo }: { onStart: () => void; scrollTo: (id: string) => () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-[#FAF8F3]/85 backdrop-blur-md border-b border-[#E6E3DB]">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-[28px] h-[28px] rounded-lg bg-forest flex items-center justify-center"><span className="font-display text-[14px] text-white leading-none">S</span></div>
          <span className="font-display text-[19px] text-[#14201B]">Saaksh</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={scrollTo("how")} className="hidden sm:inline text-[13.5px] text-[#5B6660] hover:text-[#14201B] transition-colors">How it works</button>
          <button onClick={scrollTo("modules")} className="hidden sm:inline text-[13.5px] text-[#5B6660] hover:text-[#14201B] transition-colors">Modules</button>
          <a href={COMPLIANCE_CHAT} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-[13.5px] text-[#5B6660] hover:text-[#14201B] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Compliance Chat
          </a>
          <button onClick={onStart} className="inline-flex items-center bg-forest text-white text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-forest-light transition-colors pressable">Start a free report</button>
        </div>
      </div>
    </header>
  );
}

function Footer({ onStart, scrollTo }: { onStart: () => void; scrollTo: (id: string) => () => void }) {
  return (
    <footer className="bg-[#0B1A14] text-white">
      <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="flex items-center gap-2.5">
            <div className="w-[26px] h-[26px] rounded-lg bg-brand-500 flex items-center justify-center"><span className="font-display text-[13px] text-forest leading-none">S</span></div>
            <span className="font-display text-[18px] text-white">Saaksh</span>
          </div>
          <p className="text-[13px] text-[#9FB6AC] leading-relaxed mt-3 max-w-[240px]">Evidence-first compliance for Indian businesses. Starting with BRSR.</p>
        </div>
        <FootCol title="Product" links={[["Start a free report", onStart], ["How it works", scrollTo("how")], ["Modules", scrollTo("modules")], ["Collect", scrollTo("collect")]]} />
        <FootCol title="Sources" links={[["SEBI BRSR Format", null], ["ICAI Background Material 2024", null], ["CEA emission factors", null], ["IPCC 2006", null]]} />
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5B6660]">Built by</p>
          <a href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/" target="_blank" rel="noopener noreferrer" className="block text-[13.5px] text-[#BFD3CA] hover:text-white mt-2.5">Rahul Upadhyay</a>
          <a href="mailto:rahulu626@gmail.com" className="block text-[13.5px] text-[#BFD3CA] hover:text-white mt-1">rahulu626@gmail.com</a>
          <p className="text-[11.5px] text-[#5B6660] mt-4">ICAI BRSR 2024 · SEBI Circulars · MoEFCC Rules</p>
        </div>
      </div>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: [string, (() => void) | null][] }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5B6660]">{title}</p>
      <ul className="mt-2.5 space-y-1.5">
        {links.map(([label, fn]) => (
          <li key={label}>
            {fn ? (
              <button onClick={fn} className="text-[13.5px] text-[#BFD3CA] hover:text-white text-left">{label}</button>
            ) : (
              <span className="text-[13.5px] text-[#BFD3CA]">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────────── */
function Dot() { return <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />; }
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-brand-700">{children}</p>;
}
function Spark() {
  return (
    <span className="w-5 h-5 flex-shrink-0 rounded-md bg-forest flex items-center justify-center mt-0.5">
      <svg className="w-3 h-3 text-brand-400" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.6 4.8L18 8.4l-4.4 1.6L12 15l-1.6-5L6 8.4l4.4-1.6L12 2z" /></svg>
    </span>
  );
}
function Check({ className = "text-brand-600" }: { className?: string }) {
  return (
    <svg className={`w-4 h-4 flex-shrink-0 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
  );
}

// A copy-left / panel-right feature row.
function FeatureRow({ eyebrow, title, panel, children }: { eyebrow: string; title: string; panel: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.7rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>{title}</h2>
        <div className="mt-5">{children}</div>
      </div>
      <div>{panel}</div>
    </section>
  );
}

/* ── Live product panels ───────────────────────────────────────────────────── */
function PanelCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-white border border-[#E6E3DB] shadow-[0_10px_40px_rgba(20,30,25,0.06)] ${className}`}>{children}</div>;
}

function ReadinessPanel() {
  const R = 34, C = 2 * Math.PI * R, pct = 67;
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest flex items-center justify-center"><span className="font-display text-[14px] text-white">S</span></div>
          <div>
            <p className="text-[13px] font-semibold text-[#14201B] leading-tight">Acme Industries Ltd</p>
            <p className="font-mono text-[10.5px] text-[#8A938D]">BRSR · FY 2024–25</p>
          </div>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-wide text-[#A8481B] bg-[#FBE7DC] rounded px-2 py-1">Draft</span>
      </div>
      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-[#F2F0EA]">
        <div className="relative flex-shrink-0" style={{ width: 92, height: 92 }}>
          <svg width="92" height="92" viewBox="0 0 92 92" className="-rotate-90">
            <circle cx="46" cy="46" r={R} fill="none" stroke="#EFEDE6" strokeWidth="8" />
            <circle cx="46" cy="46" r={R} fill="none" stroke="#0E4A36" strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[20px] text-[#14201B] leading-none">{pct}<span className="text-[11px]">%</span></span>
            <span className="font-mono text-[8px] uppercase tracking-wide text-[#8A938D] mt-0.5">Ready</span>
          </div>
        </div>
        <div className="flex-1 space-y-1.5">
          {[["Ready", 71, "bg-brand-500"], ["Verify", 22, "bg-[#C2871B]"], ["Collect", 15, "bg-[#D9682E]"]].map(([l, n, c]) => (
            <div key={l as string} className="flex items-center justify-between text-[12.5px]">
              <span className="flex items-center gap-1.5 text-[#3F4A44]"><span className={`w-2 h-2 rounded-full ${c}`} />{l}</span>
              <span className="font-mono font-semibold text-[#14201B]">{n}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="font-mono text-[10.5px] text-[#8A938D] mt-3 pt-3 border-t border-[#F2F0EA]">108 disclosure fields · 9 principles</p>
      <div className="mt-2 space-y-1.5">
        {[["P6", "Environment", "Collect", "#D9682E"], ["P3", "Employee wellbeing", "Verify", "#C2871B"], ["P1", "Ethics & transparency", "Ready", "#0E7A56"]].map(([p, name, st, c]) => (
          <div key={p as string} className="flex items-center gap-3 text-[12px]">
            <span className="font-mono text-[10px] text-[#8A938D] w-5">{p}</span>
            <span className="text-[#3F4A44] flex-1">{name}</span>
            <span className="h-1.5 w-20 rounded-full" style={{ backgroundColor: `${c}22` }}><span className="block h-1.5 rounded-full" style={{ width: st === "Ready" ? "100%" : st === "Verify" ? "55%" : "25%", backgroundColor: c as string }} /></span>
            <span className="font-medium w-12 text-right" style={{ color: c as string }}>{st}</span>
          </div>
        ))}
      </div>
      <p className="font-mono text-[10px] text-[#A6AFA8] mt-3">Cited to SEBI BRSR 2024 · CEA v18 · IPCC 2006</p>
    </PanelCard>
  );
}

function StatusPill({ s }: { s: "Ready" | "Verify" | "Collect" }) {
  const map = { Ready: ["#E3F7F0", "#0E7A56"], Verify: ["#F6ECD8", "#8A6516"], Collect: ["#FBE7DC", "#A8481B"] } as const;
  const [bg, fg] = map[s];
  return <span className="font-mono text-[10px] rounded-full px-2 py-0.5" style={{ backgroundColor: bg, color: fg }}>{s}</span>;
}

function ActionPlanPanel() {
  return (
    <PanelCard className="p-4">
      <div className="flex items-center justify-between px-1 pb-2.5 border-b border-[#F2F0EA]">
        <p className="text-[12.5px] font-semibold text-[#14201B]">Action plan · Principle 6 — Environment</p>
        <span className="font-mono text-[10.5px] text-[#8A938D]">11 fields</span>
      </div>
      <Row label="Total energy consumption (GJ)" status="Ready" dot="#18C39A" />
      <Row label="Water withdrawal by source (kL)" status="Verify" dot="#C2871B" />
      <div className="rounded-lg border border-[#E6E3DB] my-1.5">
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          <span className="w-2 h-2 rounded-full" style={{ background: "#D9682E" }} />
          <span className="text-[13px] text-[#14201B] flex-1">Scope 1 emissions (tCO₂e)</span>
          <span className="font-mono text-[10px] text-[#8A938D]">Essential</span>
          <StatusPill s="Collect" />
        </div>
        <div className="mx-3 mb-3 rounded-lg bg-[#E3F7F0] border border-[#CFEDE1] p-3">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#0E7A56]"><Spark />In plain English</p>
          <p className="text-[12px] text-[#3F4A44] leading-relaxed mt-1.5">Direct greenhouse gases from sources the company owns or controls: fuel burned in boilers, furnaces and company vehicles. Report the total in tonnes of CO₂-equivalent, using CEA and IPCC factors.</p>
          <p className="font-mono text-[10px] text-[#8A938D] mt-2">Source · SEBI BRSR Format, P6 Q7</p>
        </div>
      </div>
      <Row label="Scope 2 emissions (tCO₂e)" status="Collect" dot="#D9682E" />
      <Row label="Air emissions — NOx, SOx (MT)" status="Ready" dot="#18C39A" />
    </PanelCard>
  );
}
function Row({ label, status, dot }: { label: string; status: "Ready" | "Verify" | "Collect"; dot: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dot }} />
      <span className="text-[13px] text-[#14201B] flex-1">{label}</span>
      <StatusPill s={status} />
    </div>
  );
}

function MaterialityPanel() {
  const pts = [
    { n: 1, x: 220, y: 40, c: "#D9682E", label: "Climate & GHG emissions" },
    { n: 2, x: 190, y: 95, c: "#0E4A36", label: "Energy management" },
    { n: 3, x: 150, y: 70, c: "#0E4A36", label: "Water & effluents" },
    { n: 4, x: 120, y: 130, c: "#18C39A", label: "Employee health & safety" },
    { n: 5, x: 175, y: 150, c: "#18C39A", label: "Business ethics" },
    { n: 6, x: 95, y: 175, c: "#8A938D", label: "Waste & circularity" },
  ];
  return (
    <PanelCard className="p-5 flex gap-5">
      <svg viewBox="0 0 260 210" className="w-[58%] flex-shrink-0">
        <line x1="40" y1="10" x2="40" y2="190" stroke="#E6E3DB" strokeWidth="1" />
        <line x1="40" y1="190" x2="250" y2="190" stroke="#E6E3DB" strokeWidth="1" />
        <line x1="145" y1="10" x2="145" y2="190" stroke="#EFEDE6" strokeWidth="1" strokeDasharray="3 3" />
        <line x1="40" y1="100" x2="250" y2="100" stroke="#EFEDE6" strokeWidth="1" strokeDasharray="3 3" />
        {pts.map((p) => (
          <g key={p.n}>
            <circle cx={p.x} cy={p.y} r="12" fill={p.c} />
            <text x={p.x} y={p.y + 3.5} textAnchor="middle" fontSize="10" fontWeight="600" fill="#fff">{p.n}</text>
          </g>
        ))}
        <text x="145" y="206" textAnchor="middle" className="font-mono" fontSize="8" fill="#8A938D">Impact on enterprise value →</text>
      </svg>
      <ul className="flex-1 space-y-1.5 self-center">
        {pts.map((p) => (
          <li key={p.n} className="flex items-center gap-2 text-[12px] text-[#3F4A44]">
            <span className="font-mono text-[10px] w-3 text-[#8A938D]">{p.n}</span>{p.label}
          </li>
        ))}
      </ul>
    </PanelCard>
  );
}

function AlignmentPanel() {
  const rows = [
    ["GHG emissions", "305", "M-b", "S2·29", "—"],
    ["Energy use", "302", "—", "S2·29", "—"],
    ["Water withdrawal", "303", "—", "—", "C1.1"],
    ["Board diversity", "405", "—", "—", "—"],
  ];
  return (
    <PanelCard className="p-5">
      <table className="w-full text-left">
        <thead>
          <tr className="font-mono text-[10px] uppercase tracking-wide text-[#8A938D]">
            <th className="font-normal pb-2">Disclosure</th><th className="font-normal pb-2 text-right">GRI</th><th className="font-normal pb-2 text-right">TCFD</th><th className="font-normal pb-2 text-right">IFRS</th><th className="font-normal pb-2 text-right">TNFD</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-[#F2F0EA]">
              <td className="py-2.5 text-[13px] text-[#14201B]">{r[0]}</td>
              {r.slice(1).map((v, i) => <td key={i} className="py-2.5 text-right font-mono text-[12px] text-[#5B6660]">{v}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#F2F0EA]">
        <span className="font-mono text-[10.5px] text-[#8A938D]">Ratings</span>
        {["MSCI", "DJSI"].map((r) => <span key={r} className="font-mono text-[10.5px] text-[#0E7A56] bg-[#E3F7F0] rounded px-1.5 py-0.5">{r}</span>)}
      </div>
    </PanelCard>
  );
}

function GhgCalculatorPanel() {
  const [diesel, setDiesel] = useState("12000");
  const [elec, setElec] = useState("84000");
  const d = parseFloat(diesel) || 0, e = parseFloat(elec) || 0;
  const s1 = (d * 2.68) / 1000, s2 = (e * 0.716) / 1000, total = s1 + s2;
  const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 1 });
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EA]">
        <p className="text-[12.5px] font-semibold text-[#14201B]">GHG calculator · Scope 1 & 2</p>
        <span className="font-mono text-[10px] uppercase tracking-wide text-[#0E7A56]">live</span>
      </div>
      <div className="mt-3 space-y-3">
        <Field label="Diesel consumed (litres / year)" value={diesel} onChange={setDiesel} factor="× 2.68 kg/L" />
        <Field label="Grid electricity (kWh / year)" value={elec} onChange={setElec} factor="× 0.716 t/MWh" />
      </div>
      <p className="font-mono text-[10px] text-[#8A938D] mt-2.5">Factors · IPCC 2006 · CEA v18 (FY24)</p>
      <div className="mt-3 rounded-xl bg-forest text-white p-4">
        <div className="flex items-center justify-between text-[12.5px] text-[#BFD3CA]"><span>Scope 1 (fuel)</span><span className="font-mono text-white">{fmt(s1)} t</span></div>
        <div className="flex items-center justify-between text-[12.5px] text-[#BFD3CA] mt-1"><span>Scope 2 (electricity)</span><span className="font-mono text-white">{fmt(s2)} t</span></div>
        <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-white/15">
          <span className="text-[13px] font-semibold">Total</span>
          <span className="font-display text-[26px] leading-none">{fmt(total)}<span className="font-mono text-[12px] ml-1">tCO₂e</span></span>
        </div>
      </div>
    </PanelCard>
  );
}
function Field({ label, value, onChange, factor }: { label: string; value: string; onChange: (v: string) => void; factor: string }) {
  return (
    <div>
      <label className="text-[12px] text-[#5B6660]">{label}</label>
      <div className="flex items-center gap-2 mt-1">
        <input value={value} onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ""))} inputMode="numeric"
          className="flex-1 h-10 px-3 font-mono text-[14px] text-[#14201B] bg-white border border-[#E6E3DB] rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
        <span className="font-mono text-[11px] text-[#8A938D] whitespace-nowrap">{factor}</span>
      </div>
    </div>
  );
}

function CollectPanel() {
  const reqs = [
    { in: "PR", name: "Priya R.", dept: "Facilities", item: "Energy bills · FY24", status: "Submitted", c: "#0E7A56", bg: "#E3F7F0" },
    { in: "RM", name: "Rohan M.", dept: "Fleet", item: "Diesel & fuel logs", status: "Reminder sent", c: "#8A6516", bg: "#F6ECD8" },
    { in: "AN", name: "Anita N.", dept: "Utilities", item: "Water meter readings", status: "Awaiting", c: "#A8481B", bg: "#FBE7DC" },
  ];
  return (
    <PanelCard className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#F2F0EA]">
        <p className="text-[12.5px] font-semibold text-[#14201B]">Data requests · Acme Industries</p>
        <span className="font-mono text-[10.5px] text-[#8A938D]">3 of 5 in</span>
      </div>
      <div className="mt-2 space-y-1">
        {reqs.map((r) => (
          <div key={r.in} className="flex items-center gap-3 py-2">
            <span className="w-8 h-8 rounded-full bg-[#E3F7F0] flex items-center justify-center font-mono text-[11px] text-[#0E4A36] flex-shrink-0">{r.in}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-[#14201B] leading-tight">{r.name} · <span className="text-[#5B6660]">{r.dept}</span></p>
              <p className="font-mono text-[11px] text-[#8A938D]">{r.item}</p>
            </div>
            <span className="font-mono text-[10px] rounded-full px-2 py-0.5 whitespace-nowrap" style={{ backgroundColor: r.bg, color: r.c }}>{r.status}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-[#E3F7F0] border border-[#CFEDE1] p-3">
        <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-[#0E7A56]"><Spark />AI-drafted narrative</p>
        <p className="text-[12px] text-[#3F4A44] leading-relaxed mt-1.5">In FY 2024–25 the company&apos;s Scope 1 and 2 emissions totalled <span className="font-semibold text-[#14201B]">92.3 tCO₂e</span>, a 4% reduction year on year, driven by the switch to grid-renewable supply at the Pune facility.</p>
        <p className="font-mono text-[10px] text-[#8A938D] mt-2">Every figure linked to source · nothing invented</p>
      </div>
    </PanelCard>
  );
}
