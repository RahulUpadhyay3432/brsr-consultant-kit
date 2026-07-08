import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import { INDUSTRY_LABELS, type IndustryType, type MaterialityTopic } from "@/lib/types";
import { materialityTopicsForIndustry } from "@/lib/report-generator";
import companiesData from "@/data/companies.json";

// Programmatic "BRSR for <industry>" landing pages — one per real industry,
// generated from the cited KB (material topics, example listed peers). Targets
// high-intent searches like "BRSR for textile companies" and multiplies the
// indexable surface from data we already own. Each links to the free tool + the
// principle guides.

const INDUSTRIES = (Object.keys(INDUSTRY_LABELS) as IndustryType[]).filter((k) => k !== "other");

// Principle → an in-depth guide, where one exists (internal linking).
const GUIDE_BY_PRINCIPLE: Record<string, string> = {
  P1: "/blog/brsr-principle-1-ethics-guide",
  P6: "/blog/brsr-principle-6-environment-guide",
};

const CATS = [
  { key: "environment", label: "Environment", dot: "#10A572" },
  { key: "social", label: "Social", dot: "#1E9DF2" },
  { key: "governance", label: "Governance", dot: "#7B6FE0" },
] as const;

function cleanWhy(s: string): string {
  return s.replace(/\s*\[[^\]]*\]\s*/g, " ").trim();
}

function companiesFor(industry: string): string[] {
  return (companiesData.companies as { name: string; industry: string }[])
    .filter((c) => c.industry === industry)
    .map((c) => c.name)
    .slice(0, 8);
}

export function generateStaticParams() {
  return INDUSTRIES.map((industry) => ({ industry }));
}

export function generateMetadata({ params }: { params: { industry: string } }): Metadata {
  const label = INDUSTRY_LABELS[params.industry as IndustryType];
  if (!label) return {};
  return {
    title: `BRSR for ${label} Companies: Material ESG Topics & Disclosures`,
    description: `The ESG topics that matter most for ${label.toLowerCase()} companies under BRSR, mapped to the SEBI principles, with example listed peers. Then run a free, cited BRSR gap analysis in minutes.`,
  };
}

export default function IndustryBrsrPage({ params }: { params: { industry: string } }) {
  const industry = params.industry as IndustryType;
  const label = INDUSTRY_LABELS[industry];
  if (!label || industry === "other") notFound();

  const topics = materialityTopicsForIndustry(industry);
  const byCat = CATS.map((c) => ({ ...c, items: topics.filter((t) => t.category === c.key) }));
  const peers = companiesFor(industry);

  // The principles that recur most across this industry's material topics.
  const pCount = new Map<string, number>();
  topics.forEach((t) => t.brsr_principles.forEach((p) => pCount.set(p, (pCount.get(p) ?? 0) + 1)));
  const topPrinciples = Array.from(pCount.entries()).sort((a, b) => b[1] - a[1]).map(([p]) => p).slice(0, 5);
  const topTopicNames = topics.slice(0, 4).map((t) => t.topic);

  const faqs = [
    {
      q: `Which BRSR principles matter most for ${label.toLowerCase()} companies?`,
      a: `Across the material topics for the ${label.toLowerCase()} sector, the disclosures cluster around ${topPrinciples.join(", ")}. Principle 6 (Environment) is almost always the heaviest, but the exact priority depends on the company's operations and value chain.`,
    },
    {
      q: `Does my ${label.toLowerCase()} company have to file BRSR?`,
      a: `The top 1000 listed companies by market capitalisation must file BRSR. If your company is listed on an Indian exchange and in that bracket, yes. Unlisted companies may still be pulled in as significant value-chain partners of a larger listed company.`,
    },
    {
      q: `What are the most material ESG topics for the ${label.toLowerCase()} sector?`,
      a: `The topics that typically matter most include ${topTopicNames.join(", ")}. A credible materiality assessment still needs the company's own stakeholder engagement, but this is the sector-informed starting point.`,
    },
    {
      q: `How do I know which BRSR data a ${label.toLowerCase()} company already has?`,
      a: `Much of it sits in filings the company already submits, such as Pollution Control Board consents, PAT returns and hazardous-waste manifests. Saaksh's free gap analysis maps those filings against all 108 BRSR fields and shows exactly what is already covered versus what to collect.`,
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }} />
      <SiteHeader active="tools" />

      {/* Hero */}
      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-4">BRSR by industry</p>
          <h1 className="font-editorial font-semibold text-white text-[2.4rem] md:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[20ch]">
            BRSR for {label} companies
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[640px]">
            The ESG topics that matter most for {label.toLowerCase()} companies under India&apos;s BRSR, mapped to the SEBI principles, so the materiality conversation starts in the right place. Then gap-analyse a real client in minutes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors">
              Start a free report
            </Link>
            <Link href="/demo" className="pressable inline-flex items-center gap-2 rounded-xl border border-white/25 text-white text-[15px] font-medium px-5 py-3 hover:bg-white/10 transition-colors">
              See a sample report
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-16">

          {/* Material topics by E/S/G */}
          <section>
            <h2 className="font-editorial font-semibold text-ink text-[1.9rem] leading-tight tracking-[-0.015em]">Material ESG topics for {label.toLowerCase()}</h2>
            <p className="text-[15px] text-ink-muted leading-relaxed mt-3 max-w-[620px]">
              A sector-informed shortlist of the topics most likely to be material, each mapped to the BRSR principle it lives under. A starting point for the client&apos;s own stakeholder-driven materiality assessment, not a finished one.
            </p>
            <div className="mt-8 space-y-8">
              {byCat.filter((c) => c.items.length).map((c) => (
                <div key={c.key}>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
                    <span className="font-mono text-[12px] font-bold uppercase tracking-[0.12em] text-ink-body">{c.label}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {c.items.map((t: MaterialityTopic) => (
                      <div key={t.id} className="rounded-2xl border border-line bg-white p-5 shadow-elev-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-[15.5px] font-semibold text-ink leading-snug">{t.topic}</h3>
                          <div className="flex flex-wrap gap-1 flex-shrink-0">
                            {t.brsr_principles.map((p) =>
                              GUIDE_BY_PRINCIPLE[p] ? (
                                <Link key={p} href={GUIDE_BY_PRINCIPLE[p]} className="font-mono text-[10.5px] font-semibold text-brand-700 bg-brand-50 border border-[#CDE2F6] rounded px-1.5 py-0.5 hover:bg-brand-100">{p}</Link>
                              ) : (
                                <span key={p} className="font-mono text-[10.5px] font-semibold text-ink-muted bg-band border border-line rounded px-1.5 py-0.5">{p}</span>
                              )
                            )}
                          </div>
                        </div>
                        <p className="text-[13.5px] text-ink-body leading-relaxed mt-2">{cleanWhy(t.why_material)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Example peers */}
          {peers.length > 0 && (
            <section>
              <h2 className="font-editorial font-semibold text-ink text-[1.9rem] leading-tight tracking-[-0.015em]">Example listed {label.toLowerCase()} companies</h2>
              <p className="text-[15px] text-ink-muted leading-relaxed mt-3 max-w-[620px]">
                Indian listed {label.toLowerCase()} companies that file BRSR. Useful reference points when benchmarking a client&apos;s disclosures.
              </p>
              <div className="mt-6 flex flex-wrap gap-2.5">
                {peers.map((name) => (
                  <span key={name} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13.5px] text-ink-body shadow-elev-1">{name}</span>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section>
            <h2 className="font-editorial font-semibold text-ink text-[1.9rem] leading-tight tracking-[-0.015em] mb-6">Frequently asked questions</h2>
            <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
              {faqs.map((f, i) => (
                <details key={i} className={i > 0 ? "border-t border-line-soft" : ""}>
                  <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 text-[15px] font-semibold text-ink list-none">
                    {f.q}
                    <svg className="w-4 h-4 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6" /></svg>
                  </summary>
                  <p className="px-5 pb-4 text-[14px] text-ink-body leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center">
            <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">Gap-analyse a {label.toLowerCase()} client&apos;s BRSR</h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[520px] mx-auto">
              A two-minute intake becomes a cited, gap-analysed action plan across all 108 BRSR fields, with built-in emissions calculators. Free, on your device.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light transition-colors">Start a free report</Link>
              <Link href="/demo" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-ink text-[15px] font-medium px-5 py-3 border border-line hover:bg-band transition-colors">See a sample</Link>
            </div>
          </section>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
