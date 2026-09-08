import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import { GLOSSARY, GLOSSARY_CATEGORIES, getTerm, type GlossaryTerm } from "@/data/glossary";

// The vocabulary of Indian sustainability reporting, in one place.
//
// Definitional queries are the shape answer engines retrieve most, and no
// Indian ESG glossary currently answers them well: the existing ones are either
// global and vague about SEBI, or marketing pages with three sentences per term.
// Every entry here names the regulator, the number and the year, and every term
// is separately linkable so a specific definition can be cited on its own.

export const metadata: Metadata = {
  title: "BRSR, CBAM & CCTS Glossary for Indian ESG Reporting",
  description:
    "Every term an Indian ESG consultant has to explain: BRSR Core, Essential and Leadership indicators, reasonable assurance vs assessment, Scope 1, 2 and 3, the CEA grid factor, CBAM, CCTS, GEI, EPR, ZLD, GRI, ESRS and more. Defined precisely, with the regulator and the year.",
  alternates: { canonical: "/glossary" },
};

function TermCard({ t }: { t: GlossaryTerm }) {
  return (
    <article id={t.id} className="scroll-mt-24 rounded-2xl border border-line bg-white p-6 shadow-elev-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
        <h3 className="font-editorial font-semibold text-ink text-[1.25rem] leading-tight tracking-[-0.01em]">
          <a href={`#${t.id}`} className="hover:text-brand-700 transition-colors">
            {t.term}
          </a>
        </h3>
        {t.aka && <span className="text-[13px] text-ink-muted">{t.aka}</span>}
      </div>

      <p className="text-[14.5px] text-ink-body leading-relaxed">{t.definition}</p>

      {(t.links?.length || t.see?.length) && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px]">
          {t.links?.map((l) => (
            <Link key={l.href} href={l.href} className="font-semibold text-brand-700 hover:underline">
              {l.label} →
            </Link>
          ))}
          {t.see?.length ? (
            <span className="text-ink-muted">
              See also{" "}
              {t.see.map((id, i) => {
                const s = getTerm(id);
                if (!s) return null;
                return (
                  <span key={id}>
                    {i > 0 && ", "}
                    <a href={`#${id}`} className="text-ink-body hover:text-brand-700 underline decoration-line">
                      {s.term}
                    </a>
                  </span>
                );
              })}
            </span>
          ) : null}
        </div>
      )}
    </article>
  );
}

export default function GlossaryPage() {
  const byCategory = GLOSSARY_CATEGORIES.map((c) => ({
    category: c,
    terms: GLOSSARY.filter((t) => t.category === c),
  })).filter((g) => g.terms.length);

  const termSetLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Saaksh glossary of Indian ESG and sustainability reporting",
    description:
      "Definitions of the BRSR, CBAM, CCTS and global framework terms used in Indian sustainability reporting.",
    url: "https://saaksh.co/glossary",
    hasDefinedTerm: GLOSSARY.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      ...(t.aka && { alternateName: t.aka }),
      description: t.definition,
      url: `https://saaksh.co/glossary#${t.id}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://saaksh.co" },
      { "@type": "ListItem", position: 2, name: "Glossary", item: "https://saaksh.co/glossary" },
    ],
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(termSetLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <SiteHeader active="tools" />

      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-4">Reference</p>
          <h1 className="font-editorial font-semibold text-white text-[2.4rem] md:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[22ch]">
            The Indian ESG reporting glossary
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[660px]">
            {GLOSSARY.length} terms an Indian ESG consultant has to explain to a client, defined precisely: which regulator,
            which number, which year. Where a value has a version, the version is stated.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {GLOSSARY_CATEGORIES.map((c) => (
              <a
                key={c}
                href={`#cat-${c.replace(/[^a-z]/gi, "-").toLowerCase()}`}
                className="pressable rounded-full border border-white/25 px-3.5 py-1.5 text-[13px] text-white hover:bg-white/10 transition-colors"
              >
                {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-14">
          {byCategory.map((g) => (
            <section key={g.category} id={`cat-${g.category.replace(/[^a-z]/gi, "-").toLowerCase()}`} className="scroll-mt-24">
              <div className="flex flex-wrap items-baseline gap-3 mb-6">
                <h2 className="font-editorial font-semibold text-ink text-[1.8rem] leading-tight tracking-[-0.015em]">
                  {g.category}
                </h2>
                <span className="text-[13px] text-ink-faint">{g.terms.length} terms</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {g.terms.map((t) => (
                  <TermCard key={t.id} t={t} />
                ))}
              </div>
            </section>
          ))}

          <section className="rounded-3xl border border-brand-200 bg-tint p-8 sm:p-10 text-center">
            <h2 className="font-editorial font-semibold text-ink text-[1.7rem] leading-tight tracking-[-0.015em]">
              Now see the terms against a real client
            </h2>
            <p className="text-[15px] text-ink-body leading-relaxed mt-2.5 max-w-[560px] mx-auto">
              Describe a client in six fields and the free tool classifies all 108 BRSR disclosures as ready to pull,
              needs verification, or collect fresh, with the emissions, energy and water calculators built in and every
              factor cited. Nothing leaves your browser.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/start" className="pressable inline-flex items-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold px-5 py-3 hover:bg-forest-light transition-colors">
                Start a free report
              </Link>
              <Link href="/brsr" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-ink text-[15px] font-medium px-5 py-3 border border-line hover:bg-band transition-colors">
                All 108 disclosures
              </Link>
            </div>
          </section>
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
