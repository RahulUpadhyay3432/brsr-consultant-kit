import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import {
  BRSR_FIELDS,
  getField,
  neighbours,
  siblings,
  PRINCIPLE_GUIDE,
  SEBI_FORMAT_URL,
  ICAI_SOURCE,
  type BrsrField,
} from "@/lib/brsr-fields";

// One reference page per BRSR Section C disclosure, 108 in all, built from the
// same cited knowledge base the free tool runs on.
//
// The searches these answer are specific and operational: "BRSR P6-E1", "what
// does BRSR P3-E1 ask for", "BRSR energy intensity disclosure format", "is
// P6-E4 applicable to a services company". Nobody has published a per-field
// reference for BRSR, and we already hold every part of the answer, so this is
// the cheapest large surface available to us. Each page ends in the free tool,
// which is the only place the reader can see the field against a real client.

export function generateStaticParams() {
  return BRSR_FIELDS.map((f) => ({ code: f.code }));
}

export function generateMetadata({ params }: { params: { code: string } }): Metadata {
  const f = getField(params.code);
  if (!f) return {};
  const title = `BRSR ${f.id}: ${shortLabel(f)}`;
  return {
    title,
    description: `What BRSR disclosure ${f.id} asks for, in plain English: SEBI's wording, the unit, where the data comes from, which team usually holds it, and what a complete assurance-ready answer contains. Cited to the ${ICAI_SOURCE}.`,
    alternates: { canonical: `/brsr/${f.code}` },
  };
}

/** SEBI labels can run long; trim to something that reads as a title. */
function shortLabel(f: BrsrField): string {
  const s = f.label.replace(/,?\s*in the following format\.?$/i, "").trim();
  if (s.length <= 78) return s;
  const cut = s.slice(0, 78);
  const at = cut.lastIndexOf(" ");
  return (at > 40 ? cut.slice(0, at) : cut) + "…";
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-3">
      <div className="sm:w-[150px] flex-shrink-0 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        {label}
      </div>
      <div className="flex-1 text-[14.5px] text-ink-body leading-relaxed">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 sm:p-7 shadow-elev-1">
      <h2 className="font-editorial font-semibold text-ink text-[1.3rem] leading-tight tracking-[-0.01em] mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function BrsrFieldPage({ params }: { params: { code: string } }) {
  const field = getField(params.code);
  if (!field) notFound();

  const { prev, next } = neighbours(field.code);
  const related = siblings(field);
  const url = `https://saaksh.co/brsr/${field.code}`;
  const guide = PRINCIPLE_GUIDE[field.principle];

  // The questions someone actually arrives with, answered from this field's own
  // record so the page and the schema can never disagree.
  const faqs: { q: string; a: string }[] = [
    {
      q: `What does BRSR ${field.id} ask for?`,
      a: field.explainer
        ? field.explainer
        : `${field.label} It is reported in ${field.unit}. ${field.guidance}`,
    },
    {
      q: `Is BRSR ${field.id} an Essential or a Leadership indicator?`,
      a:
        field.indicatorType === "Essential"
          ? `${field.id} is an Essential indicator, so it is mandatory for every BRSR filer. It sits under Principle ${field.principle.slice(1)}, ${field.principleName}.`
          : `${field.id} is a Leadership indicator, so it is voluntary. Leadership indicators apply to companies that have been filing BRSR for three or more years, or that are in the top 1000 listed companies. A first-time filer can leave it out.`,
    },
    {
      q: `Who inside the company holds the data for ${field.id}?`,
      a: `${field.owner.chip}. ${field.owner.found}`,
    },
    ...(field.manufacturingOnly
      ? [
          {
            q: `Does ${field.id} apply to a services company?`,
            a: `Usually not. ${field.id} is one of eleven Section C disclosures that assume manufacturing operations. A pure services business with no factory, physical product or industrial effluent can mark it not applicable, but should record a one-line written justification rather than leaving it blank.`,
          },
        ]
      : [
          {
            q: `What unit does ${field.id} use?`,
            a: `${field.unit}. Reporting in the wrong unit, or switching the denominator of an intensity ratio between years, is one of the more common reasons a figure has to be restated.`,
          },
        ]),
    ...(field.completeAnswer
      ? [{ q: `What does a complete answer to ${field.id} look like?`, a: field.completeAnswer }]
      : []),
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://saaksh.co" },
      { "@type": "ListItem", position: 2, name: "BRSR disclosures", item: "https://saaksh.co/brsr" },
      { "@type": "ListItem", position: 3, name: `${field.id}`, item: url },
    ],
  };

  // The disclosure itself is the thing this page defines.
  const termLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: `BRSR ${field.id}`,
    alternateName: shortLabel(field),
    description: field.plain ?? field.label,
    termCode: field.id,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "SEBI Business Responsibility and Sustainability Report (BRSR), Section C",
      url: "https://saaksh.co/brsr",
    },
    url,
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(termLd) }} />
      <SiteHeader active="tools" />

      {/* Hero */}
      <section className="bg-forest glow-dark">
        <div className="max-w-[1000px] mx-auto px-6 py-14 md:py-16">
          <nav className="flex flex-wrap items-center gap-2 text-[12.5px] text-ondark-muted mb-5">
            <Link href="/brsr" className="hover:text-white transition-colors">All 108 BRSR disclosures</Link>
            <span aria-hidden>/</span>
            <span>Principle {field.principle.slice(1)}, {field.principleName}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <span className="rounded-md bg-white/10 border border-white/20 px-2.5 py-1 text-[12px] font-bold tracking-[0.06em] text-white">
              {field.id}
            </span>
            <span className="rounded-md bg-white/5 border border-white/15 px-2.5 py-1 text-[12px] font-medium text-ondark-muted">
              {field.indicatorType} indicator
            </span>
            {field.manufacturingOnly && (
              <span className="rounded-md bg-ember/15 border border-ember/30 px-2.5 py-1 text-[12px] font-medium text-[#FFC9BA]">
                Manufacturing only
              </span>
            )}
          </div>

          <h1 className="font-editorial font-semibold text-white text-[2rem] md:text-[2.6rem] leading-[1.1] tracking-[-0.02em] max-w-[26ch]">
            {shortLabel(field)}
          </h1>

          {field.plain && (
            <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[640px]">{field.plain}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/start"
              className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors"
            >
              See this field against a real client
            </Link>
            {guide && (
              <Link
                href={guide}
                className="pressable inline-flex items-center gap-2 rounded-xl border border-white/25 text-white text-[15px] font-medium px-5 py-3 hover:bg-white/10 transition-colors"
              >
                Principle {field.principle.slice(1)} guide
              </Link>
            )}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1000px] mx-auto px-6 py-12 space-y-8">

          {/* At a glance */}
          <section className="rounded-2xl border border-line bg-white px-6 sm:px-7 py-3 shadow-elev-1 divide-y divide-line-soft">
            <Row label="Code">{field.id}</Row>
            <Row label="Section">Section C, principle-wise performance</Row>
            <Row label="Principle">
              Principle {field.principle.slice(1)}, {field.principleName}
              <span className="block text-[13px] text-ink-muted mt-1">{field.principleFullName}</span>
            </Row>
            <Row label="Type">
              {field.indicatorType}
              <span className="text-ink-muted">
                {field.indicatorType === "Essential"
                  ? ", mandatory for every filer"
                  : ", voluntary, for filers of three or more years or in the top 1000"}
              </span>
            </Row>
            <Row label="Unit">{field.unit}</Row>
            <Row label="Usually held by">{field.owner.chip}</Row>
            <Row label="Source">
              <a href={SEBI_FORMAT_URL} target="_blank" rel="noopener noreferrer" className="text-brand-700 font-semibold hover:underline">
                SEBI BRSR Format
              </a>
              <span className="text-ink-muted">, and {ICAI_SOURCE}, page {field.page}</span>
            </Row>
          </section>

          {/* SEBI's own wording, verbatim */}
          <Card title="What SEBI asks, verbatim">
            <blockquote className="border-l-[3px] border-brand-300 pl-4 text-[15px] text-ink-body leading-relaxed italic">
              {field.label}
            </blockquote>
            <p className="text-[14.5px] text-ink-body leading-relaxed mt-4">{field.guidance}</p>
            <p className="text-[12.5px] text-ink-faint leading-relaxed mt-4">
              Quoted from the SEBI BRSR Format as amended March 2025, with measurement guidance from the {ICAI_SOURCE}, page {field.page}.
            </p>
          </Card>

          {/* Plain English */}
          {field.explainer && (
            <Card title="In plain English">
              <p className="text-[15px] text-ink-body leading-relaxed">{field.explainer}</p>
            </Card>
          )}

          {/* What a complete answer contains */}
          {field.completeAnswer && (
            <Card title="What a complete, assurance-ready answer contains">
              <p className="text-[15px] text-ink-body leading-relaxed">{field.completeAnswer}</p>
              <p className="text-[12.5px] text-ink-faint leading-relaxed mt-4">
                Describes the completeness and granularity an assurer expects. No company figures are named.
              </p>
            </Card>
          )}

          {/* Where the data comes from */}
          <Card title="Where the data comes from">
            <p className="text-[15px] text-ink-body leading-relaxed">{field.owner.found}</p>
            <p className="text-[14.5px] text-ink-body leading-relaxed mt-3">
              Much of what BRSR asks for already exists in filings the company makes elsewhere, such as Pollution Control Board consents, PAT returns, hazardous-waste manifests and EPR registrations.{" "}
              <Link href="/start" className="text-brand-700 font-semibold hover:underline">
                The free gap analysis
              </Link>{" "}
              cross-references those filings against all 108 fields and shows which are already covered.
            </p>
          </Card>

          {/* Applicability caveat */}
          {field.manufacturingOnly && (
            <Card title="Does this apply to a services company?">
              <p className="text-[15px] text-ink-body leading-relaxed">
                Usually not. {field.id} is one of eleven Section C disclosures that assume manufacturing operations. A pure
                services business with no factory, physical product or industrial effluent can mark it not applicable, but
                should record a short written justification rather than leaving it blank. A bare &ldquo;not applicable&rdquo; with no
                reason is what invites scrutiny.
              </p>
              <p className="text-[14.5px] text-ink-body leading-relaxed mt-3">
                See{" "}
                <Link href="/blog/brsr-for-it-services" className="text-brand-700 font-semibold hover:underline">
                  BRSR for IT services companies
                </Link>{" "}
                for all eleven, with the justification wording for each.
              </p>
            </Card>
          )}

          {/* FAQ */}
          <section>
            <h2 className="font-editorial font-semibold text-ink text-[1.6rem] leading-tight tracking-[-0.015em] mb-5">
              Frequently asked questions
            </h2>
            <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden">
              {faqs.map((f, i) => (
                <details key={i} className={i > 0 ? "border-t border-line-soft" : ""}>
                  <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 text-[15px] font-semibold text-ink list-none">
                    {f.q}
                    <svg className="w-4 h-4 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </summary>
                  <p className="px-5 pb-4 text-[14px] text-ink-body leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Related disclosures */}
          {related.length > 0 && (
            <section>
              <h2 className="font-editorial font-semibold text-ink text-[1.6rem] leading-tight tracking-[-0.015em] mb-5">
                Other disclosures under Principle {field.principle.slice(1)}
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/brsr/${r.code}`}
                    className="group rounded-xl border border-line bg-white p-4 shadow-elev-1 hover:border-brand-300 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11.5px] font-bold tracking-[0.05em] text-brand-700 bg-brand-50 border border-[#CDE2F6] rounded px-1.5 py-0.5">
                        {r.id}
                      </span>
                      <span className="text-[11.5px] text-ink-faint">{r.indicatorType}</span>
                    </div>
                    <p className="text-[14px] text-ink-body leading-snug group-hover:text-brand-700 transition-colors">
                      {r.plain ?? shortLabel(r)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Prev / next */}
          <nav className="flex flex-col sm:flex-row gap-3 justify-between border-t border-line pt-6">
            {prev ? (
              <Link href={`/brsr/${prev.code}`} className="text-[14px] text-ink-muted hover:text-brand-700 transition-colors">
                ← {prev.id}, {shortLabel(prev)}
              </Link>
            ) : <span />}
            {next && (
              <Link href={`/brsr/${next.code}`} className="text-[14px] text-ink-muted hover:text-brand-700 transition-colors sm:text-right">
                {next.id}, {shortLabel(next)} →
              </Link>
            )}
          </nav>

          {/* CTA */}
          <section className="rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center">
            <h2 className="font-editorial font-semibold text-ink text-[1.6rem] leading-tight tracking-[-0.015em]">
              See {field.id} against a real client
            </h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[540px] mx-auto">
              Describe a client in six fields and get all 108 BRSR disclosures classified as ready to pull, needs
              verification, or collect fresh, with the calculators built in. Free, no login, and nothing leaves your browser.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light transition-colors">
                Start a free report
              </Link>
              <Link href="/brsr" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-ink text-[15px] font-medium px-5 py-3 border border-line hover:bg-band transition-colors">
                Browse all 108 disclosures
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
