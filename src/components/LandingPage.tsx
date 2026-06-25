"use client";

// Saaksh marketing homepage — Evergreen & Ember design system (Newsreader display,
// Hanken Grotesk body, IBM Plex Mono labels). Rebuilt from the Claude Design mockup.
// All product panels are live HTML/CSS/SVG (no image assets). "Start a free report"
// hands off to the intake form via onStart.

import { useState } from "react";
import ResumeBanner from "@/components/ResumeBanner";
import { REQUEST_ACCESS_URL } from "@/lib/links";
import { useScrollReveal } from "@/lib/useScrollReveal";

interface LandingPageProps {
  onStart: () => void;
  resume?: { companyName: string; onResume: () => void } | null;
}

const COMPLIANCE_CHAT = "https://huggingface.co/spaces/sherlockwatson221/climate-compliance";
const BODY = "text-[#3F4A44]";

export default function LandingPage({ onStart, resume }: LandingPageProps) {
  useScrollReveal();
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
                <span className="font-display text-[14px] text-brand-700">साक्ष्य</span>
                <span className="text-[12.5px] text-[#5B6660]">Evidence, by name and by design</span>
              </div>

              <h1 className="anim-up-hero font-display font-normal text-[3.25rem] sm:text-[4.5rem] leading-[1.02] tracking-[-0.02em] mt-6" style={{ textWrap: "balance", animationDelay: "60ms" }}>
                Compliance reporting, made <span className="italic">fast and defensible</span>.
              </h1>

              <p className={`anim-up-md text-[17.5px] sm:text-[19px] ${BODY} leading-[1.6] mt-6 max-w-[545px]`} style={{ animationDelay: "160ms" }}>
                Saaksh turns the scramble of regulatory reporting — scattered data, emission maths, frameworks
                to reconcile, a narrative to draft — into one cited workflow. It starts with BRSR, and grows to
                CBAM, CCTS and broader ESG.
              </p>

              <div className="anim-up-md flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: "240ms" }}>
                <button onClick={onStart} className="inline-flex items-center gap-2 bg-forest text-white text-[15.5px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable shadow-sm">
                  Start a free report
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                </button>
                <button onClick={scrollTo("how")} className="inline-flex items-center gap-2 bg-white text-[#14201B] text-[15.5px] font-medium px-5 py-3 rounded-xl border border-[#E6E3DB] hover:bg-[#FCFBF7] transition-colors pressable">
                  See how it works
                </button>
              </div>

              <p className="anim-up-md flex flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[12px] text-[#5B6660] mt-6" style={{ animationDelay: "320ms" }}>
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
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8A938D]">Built on primary sources</span>
          {["SEBI BRSR Format", "ICAI 2024", "CEA factors", "IPCC 2006", "GRI · TCFD · IFRS"].map((s) => (
            <span key={s} className="font-display text-[16px] text-[#14201B]">{s}</span>
          ))}
        </div>
      </section>

      {/* ── Where the work goes (pain → solution) ──────────────────────────── */}
      <section data-reveal className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <Eyebrow>What BRSR actually takes</Eyebrow>
        <h2 className="font-display font-normal text-[2.4rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.02em] mt-3 max-w-[620px]" style={{ textWrap: "balance" }}>
          Every part of the work that eats weeks, handled.
        </h2>
        <p className={`text-[16.5px] ${BODY} leading-relaxed mt-4 max-w-[600px]`}>
          A BRSR report is a hundred-odd disclosures, scattered data, emission maths and a stack of frameworks.
          Saaksh takes each of those jobs and gives it a tool.
        </p>
        <div className="mt-12 rounded-2xl border border-[#E6E3DB] bg-white overflow-hidden divide-y divide-[#EFEDE6]">
          {[
            { pain: "A blank 108-field format, and no quick read on what's already covered", sol: "A gap-analysed action plan, every field sorted into Ready, Verify or Collect" },
            { pain: "Re-keying numbers out of last year's report by hand", sol: "An AI importer that pre-fills the figures, each shown with its source line for you to verify" },
            { pain: "Chasing data that lives with different people across the business", sol: "Branded requests with auto-reminders and no-login submission, evidence attached" },
            { pain: "Emission factors to get right, and proving the number is defensible", sol: "Calculators cited to CEA & IPCC (version on every line) and an assurance evidence trail" },
            { pain: "One dataset, demanded by GRI, TCFD, IFRS and TNFD", sol: "Cross-framework mapping and one-click export — collect once, report many" },
            { pain: "Hunting for materiality formats and how-to guidance", sol: "A templates & guides library, built from the same cited knowledge base" },
            { pain: "New regulations landing — CBAM for exporters, CCTS carbon credits", sol: "Beyond-BRSR readiness checks: who's in scope, and what to prepare" },
          ].map((r) => (
            <div key={r.pain} className="grid sm:grid-cols-2 gap-x-8 gap-y-2 px-5 sm:px-7 py-5 items-center">
              <div className="flex items-start gap-3">
                <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-[#FBE7DC] flex items-center justify-center">
                  <svg className="w-3 h-3 text-[#A8481B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </span>
                <p className="text-[15px] text-[#5B6660] leading-snug">{r.pain}</p>
              </div>
              <div className="flex items-start gap-3 sm:pl-8 sm:border-l border-[#EFEDE6]">
                <Check className="text-brand-600 mt-0.5" />
                <p className="text-[15px] text-[#14201B] leading-snug flex-1 font-medium">{r.sol}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ───────────────────────────────────────────────────── */}
      <section id="how" data-reveal className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <h2 className="font-display font-normal text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
          Three steps from intake to a defensible plan.
        </h2>
        <p className={`text-[16.5px] ${BODY} leading-relaxed mt-4 max-w-[560px]`}>
          No setup, no account. Open the tool, describe the company, and get a plan you can take straight into the work.
        </p>
        <div className="grid md:grid-cols-3 gap-10 sm:gap-8 mt-12">
          {[
            { n: "01", t: "Describe the company", b: "A short intake: sector, listing category, what's already in last year's filing. Two minutes, on your device." },
            { n: "02", t: "Get a gap-analysed report", b: "All 108 fields sorted into Ready, Verify and Collect, with suggested materiality and cross-framework mapping." },
            { n: "03", t: "Take it into the work", b: "Export a clean PDF brief and a CSV of every data point still to collect — or move to Collect to chase it." },
          ].map((s) => (
            <div key={s.n}>
              <p className="font-display text-[2.6rem] text-brand-500 leading-none">{s.n}</p>
              <h3 className="text-[17px] font-semibold text-[#14201B] mt-4">{s.t}</h3>
              <p className={`text-[15px] ${BODY} leading-relaxed mt-2`}>{s.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature: Action plan ───────────────────────────────────────────── */}
      <FeatureRow eyebrow="The readiness report" title="A gap-analysed action plan, colour-coded." panel={<ActionPlanPanel />}>
        <p className={`text-[16.5px] ${BODY} leading-relaxed`}>
          Every disclosure is matched against last year&apos;s filing and sorted: what&apos;s{" "}
          <span className="text-brand-700 font-medium">Ready</span>, what to{" "}
          <span className="text-[#8A6516] font-medium">Verify</span>, and what still needs to be{" "}
          <span className="text-[#A8481B] font-medium">Collected</span>. Open any field for a plain-English explanation written from the public SEBI definition.
        </p>
        <div className="mt-5 flex items-start gap-2.5 rounded-lg border border-[#E6E3DB] bg-[#FCFBF7] px-3.5 py-3 max-w-[460px]">
          <Spark />
          <p className="text-[13.5px] text-[#5B6660] leading-relaxed">
            <span className="font-semibold text-[#14201B]">In plain English</span> is AI-written, once, from public definitions. No client data is involved, and the text ships static.
          </p>
        </div>
      </FeatureRow>

      {/* ── Materiality + Alignment (two-up) ───────────────────────────────── */}
      <section className="bg-white border-y border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <Eyebrow>Suggested materiality</Eyebrow>
            <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.6rem] leading-[1.08] tracking-[-0.02em] mt-3">Where to focus, by sector.</h2>
            <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>A starting materiality view drawn from the company&apos;s sector, so the conversation begins with the topics that matter most.</p>
            <div className="mt-6"><MaterialityPanel /></div>
          </div>
          <div>
            <Eyebrow>Cross-framework alignment</Eyebrow>
            <h2 className="font-display font-normal text-[2.2rem] sm:text-[2.6rem] leading-[1.08] tracking-[-0.02em] mt-3">One disclosure, mapped everywhere.</h2>
            <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[460px]`}>Each BRSR data point is linked to its equivalent in GRI, TCFD, IFRS S2 and TNFD, plus the ratings that matter to investors.</p>
            <div className="mt-6"><AlignmentPanel /></div>
          </div>
        </div>
      </section>

      {/* ── Feature: Calculators ───────────────────────────────────────────── */}
      <FeatureRow eyebrow="Calculators & exports" title="The maths is done, and it's cited." panel={<GhgCalculatorPanel />}>
        <p className={`text-[16.5px] ${BODY} leading-relaxed`}>
          Built-in GHG, energy, water and Scope 3 screening calculators convert raw activity data into BRSR-ready figures, using CEA and IPCC factors with the version noted on every line. Export a CSV for your working file and a clean PDF brief to share.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#14201B] bg-white border border-[#E6E3DB] px-3.5 py-2 rounded-lg">Export CSV</span>
          <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-white bg-forest px-3.5 py-2 rounded-lg">Client-ready PDF brief</span>
        </div>
      </FeatureRow>

      {/* ── AI section (dark) ──────────────────────────────────────────────── */}
      <section className="bg-forest text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-400">On AI</p>
            <h2 className="font-display font-normal text-[2.4rem] sm:text-[3rem] leading-[1.05] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>
              AI where it helps, never where it can mislead.
            </h2>
            <p className="text-[16.5px] text-[#BFD3CA] leading-relaxed mt-5 max-w-[460px]">
              What goes into a filed report has to be defensible. So AI does the explaining, the reading and the
              drafting, never the deciding, and never the inventing. Three places it helps:
            </p>
          </div>
          <div className="space-y-6">
            {[
              { t: "Plain-English explainers", tag: "Free", b: "Every field explained from the public SEBI definition. Written once, shipped as static text — nothing about the client is ever sent anywhere." },
              { t: "Compliance importer", tag: "Pro", b: "Reads the client's existing reports and pre-fills the figures, each shown with the source line it came from, for you to verify. It never invents a number." },
              { t: "Grounded narrative draft", tag: "Pro", b: "Turns the numbers you collected into review-ready prose. Every figure traces back to its source; gaps are flagged, not guessed." },
            ].map((p, i) => (
              <div key={p.t} className={i > 0 ? "border-t border-white/10 pt-6" : ""}>
                <p className="flex items-center gap-2 text-[16px] font-semibold text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />{p.t}
                  <span className="font-mono text-[9.5px] uppercase tracking-wide rounded-full px-1.5 py-0.5 text-forest bg-brand-400">{p.tag}</span>
                </p>
                <p className="text-[14.5px] text-[#9FB6AC] leading-relaxed mt-1.5 pl-3.5">{p.b}</p>
              </div>
            ))}
            <p className="text-[13px] text-[#9FB6AC] leading-relaxed pl-3.5 border-t border-white/10 pt-5">
              Everything stays cited — each disclosure links to SEBI, ICAI, CEA or IPCC with the version noted. You can defend every line.
            </p>
          </div>
        </div>
      </section>

      {/* ── Collect (paid tier) ────────────────────────────────────────────── */}
      <section id="collect" className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-flex items-center font-mono text-[11px] uppercase tracking-[0.12em] text-[#A8481B] bg-[#FBE7DC] border border-[#F2CDBA] rounded px-2 py-1">Collect · paid tier</span>
          <h2 className="font-display font-normal text-[2.4rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.02em] mt-4">Chase the data without chasing people.</h2>
          <p className={`text-[16.5px] ${BODY} leading-relaxed mt-5 max-w-[470px]`}>
            When the job moves from preparing to collecting, Collect requests BRSR data from the team that holds each number, with branded emails and automatic reminders. They submit through a no-login form with evidence attached, emissions are calculated with cited factors, and an AI draft turns the result into review-ready narrative.
          </p>
          <ul className="mt-6 space-y-2.5">
            {["Branded request emails & auto-reminders", "No-login submission with evidence attachments", "Emissions calculated with attributed factors", "Assurance-ready evidence trail — every figure traced to its owner and source"].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[15px] text-[#14201B]"><Check />{f}</li>
            ))}
          </ul>
          <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable mt-7">
            Request Pro access
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <p className="text-[13px] text-[#8A938D] mt-3 max-w-[440px]">The readiness tool stays free and needs no login. Collect is the paid tier; we onboard you on request.</p>
        </div>
        <CollectPanel />
      </section>

      {/* ── Free vs Pro comparison ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <Eyebrow>Free and Pro</Eyebrow>
          <h2 className="font-display font-normal text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>
            Free prepares the report. Pro runs the whole job.
          </h2>
          <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[620px]`}>
            The whole readiness tool is genuinely free, on your device. Pro is the workspace that does the work —
            collecting the data, the AI that reads and drafts, the assurance trail, and the tools to win and price the engagement.
          </p>
          <CompareTable />
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable">
              Request Pro access
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
            <p className="text-[13px] text-[#8A938D]">Early access, priced per engagement — pay only when you have a client. The free tool always stays free.</p>
          </div>
        </div>
      </section>

      {/* ── Saaksh Pro — the compliance copilot ────────────────────────────── */}
      <section id="pro" className="bg-white border-t border-[#E6E3DB]">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
          <Eyebrow>Saaksh Pro</Eyebrow>
          <h2 className="font-display font-normal text-[2.4rem] sm:text-[3rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>
            The workspace for the whole engagement.
          </h2>
          <p className={`text-[16px] ${BODY} leading-relaxed mt-4 max-w-[620px]`}>
            The free tool prepares the report. Pro does the work: winning and pricing the engagement,
            collecting the data, computing and drafting, and reporting across frameworks. Collect, the AI
            compliance importer, cross-framework export and the proposal builder are live today, and it keeps growing.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {[
              { name: "Collect", status: "live" as const, flagship: true, desc: "Chase BRSR data from the client's team with branded emails, auto-reminders, and no-login submission with evidence." },
              { name: "Compliance importer", status: "live" as const, ai: true, desc: "Upload an existing report and the numbers are pre-filled, each with its source line, for you to verify. It never invents a figure." },
              { name: "Cross-framework export", status: "live" as const, desc: "Download the full BRSR ↔ GRI ↔ TCFD ↔ IFRS ↔ TNFD mapping (plus MSCI & DJSI) as a spreadsheet — collect once, report many. CBAM and CCTS join as they ship." },
              { name: "Proposal & fee builder", status: "live" as const, desc: "Turn a scope into a client-ready proposal and a transparent fee estimate, built from your own rates, so you win and price the work." },
              { name: "Multi-client workspace", status: "coming" as const, desc: "Every client's engagement in one place, instead of one report at a time." },
              { name: "Consultant network", status: "future" as const, desc: "Get matched with the companies that need a BRSR consultant. Be found, not just searching." },
            ].map((p) => (
              <ProPillar key={p.name} name={p.name} status={p.status} desc={p.desc} flagship={"flagship" in p ? p.flagship : undefined} ai={"ai" in p ? p.ai : undefined} />
            ))}
          </div>
          <p className="text-[13.5px] text-[#8A938D] mt-6 max-w-[620px] leading-relaxed">
            And the regulations keep coming: CBAM for exporters, CCTS for carbon credits, and broader ESG assurance
            across GRI, TCFD and IFRS.
          </p>
          <a href={REQUEST_ACCESS_URL} className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-3 rounded-xl hover:bg-forest-light transition-colors pressable mt-8">
            Request Pro access
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <p className="text-[13px] text-[#8A938D] mt-3">Early access, priced per engagement. Talk to us and we&apos;ll set you up.</p>
        </div>
      </section>

      {/* ── Trust + founder ────────────────────────────────────────────────── */}
      <section className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { t: "Cited & versioned", b: "Every disclosure and emission factor traces to SEBI, ICAI, CEA or IPCC, so what you put in front of a client is defensible." },
            { t: "100% on-device", b: "The free readiness tool runs entirely in your browser. No upload, no account, nothing stored." },
            { t: "Free to start", b: "The readiness tool is free and needs no login. The Pro workspace layers on when you move to collecting and reporting at scale." },
          ].map((c) => (
            <div key={c.t}>
              <h3 className="font-display text-[20px] text-[#14201B]">{c.t}</h3>
              <p className={`text-[15px] ${BODY} leading-relaxed mt-2`}>{c.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats band ─────────────────────────────────────────────────────── */}
      <section className="bg-[#FCFBF7] border-y border-[#E6E3DB]">
        <div data-reveal className="max-w-[1180px] mx-auto px-5 sm:px-8 py-16">
          <p className="font-display font-normal text-center text-[1.9rem] sm:text-[2.4rem] leading-[1.18] tracking-[-0.02em] text-[#14201B] max-w-[660px] mx-auto" style={{ textWrap: "balance" }}>
            The first week of BRSR work, done in minutes. Gap-analysed, cited, and ready to send.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {[
              { n: "108", l: "BRSR fields" },
              { n: "9", l: "NGRBC principles" },
              { n: "68", l: "framework mappings" },
              { n: "0", l: "records stored" },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p className="font-display text-[3rem] sm:text-[3.4rem] leading-none text-forest">{s.n}</p>
                <p className="font-mono text-[12px] uppercase tracking-wide text-[#8A938D] mt-2">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────────── */}
      <section className="bg-forest text-white">
        <div className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 text-center">
          <h2 className="font-display font-normal text-[2.6rem] sm:text-[3.4rem] leading-[1.05] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            Take the work out of your next BRSR report.
          </h2>
          <button onClick={onStart} className="inline-flex items-center gap-2 bg-brand-500 text-forest text-[16px] font-semibold px-6 py-3.5 rounded-xl hover:bg-brand-400 transition-colors pressable mt-8">
            Start a free report
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
          <p className="font-mono text-[12px] text-[#9FB6AC] mt-5">No login · Client data never leaves your browser · Cited to SEBI &amp; ICAI</p>
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
          <span className="font-display text-[20px] text-[#14201B]">Saaksh</span>
        </div>
        <div className="flex items-center gap-5">
          <button onClick={scrollTo("how")} className="hidden sm:inline text-[14px] text-[#5B6660] hover:text-[#14201B] transition-colors">How it works</button>
          <button onClick={scrollTo("pro")} className="hidden sm:inline text-[14px] text-[#5B6660] hover:text-[#14201B] transition-colors">Pro</button>
          <a href={COMPLIANCE_CHAT} target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 text-[14px] text-[#5B6660] hover:text-[#14201B] transition-colors">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Compliance Chat
          </a>
          <button onClick={onStart} className="inline-flex items-center bg-forest text-white text-[13.5px] font-semibold px-4 py-2 rounded-lg hover:bg-forest-light transition-colors pressable">Start a free report</button>
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
            <span className="font-display text-[19px] text-white">Saaksh</span>
          </div>
          <p className="text-[13.5px] text-[#9FB6AC] leading-relaxed mt-3 max-w-[240px]">Evidence-first compliance for Indian businesses. Starting with BRSR.</p>
        </div>
        <FootCol title="Product" links={[["Start a free report", onStart], ["How it works", scrollTo("how")], ["Pro", scrollTo("pro")], ["Collect", scrollTo("collect")]]} />
        <FootCol title="Sources" links={[["SEBI BRSR Format", null], ["ICAI Background Material 2024", null], ["CEA emission factors", null], ["IPCC 2006", null]]} />
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#5B6660]">Built by</p>
          <a href="https://www.linkedin.com/in/rahul-upadhyay-a7aa12207/" target="_blank" rel="noopener noreferrer" className="block text-[14px] text-[#BFD3CA] hover:text-white mt-2.5">Rahul Upadhyay</a>
          <a href="mailto:rahulu626@gmail.com" className="block text-[14px] text-[#BFD3CA] hover:text-white mt-1">rahulu626@gmail.com</a>
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
              <button onClick={fn} className="text-[14px] text-[#BFD3CA] hover:text-white text-left">{label}</button>
            ) : (
              <span className="text-[14px] text-[#BFD3CA]">{label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Shared bits ───────────────────────────────────────────────────────────── */
function Dot() { return <span className="w-1.5 h-1.5 rounded-full bg-brand-500 inline-block" />; }

// Free-vs-Pro comparison — Free wins the "prepare" rows; Pro wins those plus the whole
// collect / AI / win-work stack, so the value gap is visible at a glance.
const COMPARE: { band: string; rows: [string, boolean, boolean | "soon"][] }[] = [
  {
    band: "Prepare the report",
    rows: [
      ["Gap-analysed action plan — all 108 fields", true, true],
      ["GHG, energy, water & Scope 3 calculators, cited", true, true],
      ["Cross-framework mapping & export (GRI, TCFD, IFRS, TNFD, MSCI, DJSI)", true, true],
      ["Beyond-BRSR readiness: CBAM & CCTS in-scope checks", true, true],
      ["Templates & guides library", true, true],
      ["Plain-English AI explainer on every field", true, true],
      ["CSV + client-ready PDF export", true, true],
    ],
  },
  {
    band: "Collect & prove it",
    rows: [
      ["Chase data from the team that holds each number", false, true],
      ["Branded request emails + automatic reminders", false, true],
      ["No-login submission with evidence attached", false, true],
      ["Emissions auto-computed & attributed to source", false, true],
      ["Assurance-readiness pack — a data-ownership ledger", false, true],
    ],
  },
  {
    band: "AI that does the work",
    rows: [
      ["Compliance importer — pre-fill figures from existing reports", false, true],
      ["Grounded AI narrative draft, review-ready", false, true],
    ],
  },
  {
    band: "Win & scale",
    rows: [
      ["Proposal & fee builder — scope and price an engagement", false, true],
      ["Multi-client workspace", false, "soon"],
    ],
  },
];
function Mark({ v }: { v: boolean | "soon" }) {
  if (v === "soon") return <span className="font-mono text-[9px] uppercase tracking-wide text-[#8A6516] bg-[#F6ECD8] rounded-full px-1.5 py-0.5">soon</span>;
  return v
    ? <svg className="w-4 h-4 text-brand-600 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.6}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    : <span className="text-[#C9CFC9] text-[15px]">—</span>;
}
const CMP_COLS = "grid grid-cols-[1fr_52px_60px] sm:grid-cols-[1fr_120px_140px]";
function CompareTable() {
  return (
    <div className="mt-10 rounded-2xl border border-[#E6E3DB] overflow-hidden bg-white">
      {/* Header */}
      <div className={`${CMP_COLS} items-stretch border-b border-[#E6E3DB] bg-[#FCFBF7]`}>
        <div className="px-4 sm:px-6 py-3.5 flex items-end">
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[#8A938D]">What you get</span>
        </div>
        <div className="py-3.5 text-center border-l border-[#EFEDE6]">
          <p className="font-display text-[15px] text-[#14201B] leading-none">Free</p>
          <p className="font-mono text-[8.5px] uppercase tracking-wide text-[#0E7A56] mt-1">No login</p>
        </div>
        <div className="py-3.5 text-center bg-forest">
          <p className="font-display text-[15px] text-white leading-none">Pro</p>
          <p className="font-mono text-[8.5px] uppercase tracking-wide text-brand-400 mt-1">Paid</p>
        </div>
      </div>
      {/* Bands + rows */}
      {COMPARE.map((g) => (
        <div key={g.band}>
          <div className={`${CMP_COLS} bg-[#F7F6F1] border-b border-[#EFEDE6]`}>
            <p className="px-4 sm:px-6 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#5B6660]">{g.band}</p>
            <div className="border-l border-[#EFEDE6]" />
            <div className="bg-[#F2F7F4]" />
          </div>
          {g.rows.map(([label, free, pro], i) => (
            <div key={label} className={`${CMP_COLS} items-center ${i < g.rows.length - 1 ? "border-b border-[#F2F0EA]" : ""}`}>
              <p className="px-4 sm:px-6 py-3 text-[13.5px] sm:text-[14px] text-[#14201B] leading-snug">{label}</p>
              <div className="py-3 flex justify-center border-l border-[#EFEDE6]"><Mark v={free} /></div>
              <div className="py-3 flex justify-center bg-[#F2F7F4]"><Mark v={pro} /></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-brand-700">{children}</p>;
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

// A Saaksh Pro capability card. The flagship (Collect) is forest-filled; other
// live cards are light with a green "Available now" tag; roadmap cards carry an
// honest Coming / Future tag. Only the flagship gets the dark hero treatment, so
// "three things are live" reads as momentum without three heavy dark blocks.
function ProPillar({ name, status, desc, flagship, ai }: { name: string; status: "live" | "coming" | "future"; desc: string; flagship?: boolean; ai?: boolean }) {
  const filled = !!flagship; // only the flagship gets the forest fill
  const tag = status === "live" ? "Available now" : status === "coming" ? "Coming" : "Future";
  const tagCls =
    status === "live" ? "text-forest bg-brand-400"
      : status === "coming" ? "text-[#8A6516] bg-[#F6ECD8] border border-[#EAD9B0]"
        : "text-[#8A938D] bg-white border border-[#E6E3DB]";
  return (
    <div className={`rounded-2xl p-6 ${filled ? "bg-forest text-white" : "bg-[#FAF8F3] border border-[#E6E3DB]"}`}>
      <div className="flex items-start justify-between gap-2">
        <span className={`font-display text-[19px] leading-tight flex items-center gap-2 ${filled ? "text-white" : "text-[#14201B]"}`}>
          {name}
          {ai && <span className={`font-mono text-[8.5px] uppercase tracking-wide rounded-full px-1.5 py-0.5 ${filled ? "bg-brand-400 text-forest" : "bg-forest text-white"}`}>AI</span>}
        </span>
        <span className={`font-mono text-[9px] uppercase tracking-wide rounded-full px-2 py-1 whitespace-nowrap ${tagCls}`}>{tag}</span>
      </div>
      <p className={`text-[13.5px] leading-relaxed mt-3.5 ${filled ? "text-[#BFD3CA]" : "text-[#5B6660]"}`}>{desc}</p>
    </div>
  );
}

// A copy-left / panel-right feature row.
function FeatureRow({ eyebrow, title, panel, children }: { eyebrow: string; title: string; panel: React.ReactNode; children: React.ReactNode }) {
  return (
    <section data-reveal className="max-w-[1180px] mx-auto px-5 sm:px-8 py-20 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="font-display font-normal text-[2.4rem] sm:text-[2.9rem] leading-[1.06] tracking-[-0.02em] mt-3" style={{ textWrap: "balance" }}>{title}</h2>
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
