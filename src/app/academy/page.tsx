import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { jsonLdHtml } from "@/lib/jsonld";
import { ICAI_SOURCE, SEBI_FORMAT_URL } from "@/lib/brsr-fields";
import {
  ACADEMY_MODULES, moduleFields, totalHours, coveredDisclosureCount,
} from "@/lib/academy";

// A teaching pack: the reference content this site already publishes, sequenced
// into modules a trainer can run. The ordering is the product here, not the
// content — every module points at pages that already exist, and its covered
// disclosures resolve from BRSR_FIELDS at build time so the syllabus cannot
// drift away from the reference pages.
//
// Deliberately generic. It names no academy, institute or partner, because
// naming one would imply an endorsement nobody has given. A trainer who wants
// to co-brand it can; that is a conversation, not a page.

export const metadata: Metadata = {
  title: "BRSR Teaching Pack: a Course Outline for Trainers",
  description:
    "Eight modules that sequence the 108 BRSR disclosures, the glossary and nine live tools into a runnable course: learning objectives, the disclosures each module covers, hands-on practice, and assessment questions. Free to adapt.",
  alternates: { canonical: "/academy" },
};

const MODULE_COUNT = ACADEMY_MODULES.length;
const HOURS = totalHours();
const COVERED = coveredDisclosureCount();

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-5 py-4 shadow-elev-1">
      <div className="font-editorial font-semibold text-ink text-[1.9rem] leading-none tabular-nums">{n}</div>
      <div className="text-[12.5px] text-ink-muted leading-snug mt-1.5">{label}</div>
    </div>
  );
}

export default function AcademyPage() {
  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "BRSR Teaching Pack",
    description:
      "An eight-module course outline for teaching SEBI's Business Responsibility and Sustainability Report (BRSR): applicability, Sections A and B, Principle 6 in three parts, the social principles, cross-framework reporting, and assurance readiness.",
    url: "https://saaksh.co/academy",
    inLanguage: "en-IN",
    isAccessibleForFree: true,
    teaches: ACADEMY_MODULES.map((m) => m.objective),
    provider: { "@type": "Organization", name: "Saaksh", url: "https://saaksh.co" },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: `PT${Math.round(HOURS)}H`,
    },
    syllabusSections: ACADEMY_MODULES.map((m, i) => ({
      "@type": "Syllabus",
      position: i + 1,
      name: m.title,
      description: m.objective,
      timeRequired: `PT${m.minutes}M`,
      url: `https://saaksh.co/academy#${m.slug}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://saaksh.co" },
      { "@type": "ListItem", position: 2, name: "Teaching pack", item: "https://saaksh.co/academy" },
    ],
  };

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(courseLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumbLd) }} />
      <SiteHeader active="tools" />

      <section className="bg-forest glow-dark">
        <div className="max-w-[1100px] mx-auto px-6 py-16 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-4">Teaching pack</p>
          <h1 className="font-editorial font-semibold text-white text-[2.4rem] md:text-[3.1rem] leading-[1.06] tracking-[-0.02em] max-w-[22ch]">
            A BRSR course outline, free to adapt
          </h1>
          <p className="text-[17px] text-ondark-muted leading-relaxed mt-5 max-w-[680px]">
            {MODULE_COUNT} modules that put the {COVERED} disclosures they cover, the glossary and nine live tools in a
            teachable order: what the learner can do afterwards, which disclosures that covers, what to practise on, and
            the questions to check they got it. Roughly {HOURS} hours of contact time. Cited throughout to the SEBI BRSR
            Format and the {ICAI_SOURCE}.
          </p>
          <p className="text-[14.5px] text-ondark-muted/85 leading-relaxed mt-4 max-w-[680px]">
            Written because the reference pages on this site each answer one question well, which makes them useful to
            someone who already knows what to look up and useless as a course. The missing piece was the ordering.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/brsr" className="pressable inline-flex items-center gap-2 rounded-xl bg-white text-forest text-[15px] font-semibold px-5 py-3 hover:bg-white/90 transition-colors">
              The 108 disclosures
            </Link>
            <Link href="/glossary" className="pressable inline-flex items-center gap-2 rounded-xl border border-white/25 text-white text-[15px] font-medium px-5 py-3 hover:bg-white/10 transition-colors">
              Glossary
            </Link>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <div className="max-w-[1100px] mx-auto px-6 py-14 space-y-14">

          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat n={String(MODULE_COUNT)} label="Modules, in teaching order" />
            <Stat n={`~${HOURS}`} label="Hours of contact time, as a planning aid" />
            <Stat n={String(COVERED)} label="Section C disclosures covered at least once" />
            <Stat n="9" label="Live tools used for hands-on work" />
          </section>

          <section className="rounded-2xl border border-line bg-tint px-6 py-5">
            <h2 className="font-editorial font-semibold text-ink text-[1.35rem] leading-tight">How to use it</h2>
            <p className="text-[14.5px] text-ink-body leading-relaxed mt-2.5">
              Take it as a skeleton, not a script. The modules are sequenced so each depends only on the ones before it,
              the assessment questions are all answerable from the linked pages, and the contact times are planning
              estimates rather than promises. Adapt, reorder, cut, or co-brand it &mdash; no permission needed and no
              attribution required. If you teach BRSR and something here is wrong or missing, that is the most useful
              thing you could tell us.
            </p>
            <p className="text-[13px] text-ink-muted leading-relaxed mt-3">
              It carries no certification and no accreditation, and it is not affiliated with any institute or training
              body. It is a course outline built from public regulation and this site&apos;s own reference pages.
            </p>
          </section>

          <section className="space-y-8">
            <h2 className="font-editorial font-semibold text-ink text-[1.9rem] leading-tight tracking-[-0.015em]">
              The modules
            </h2>

            {ACADEMY_MODULES.map((m, i) => {
              const fields = moduleFields(m);
              return (
                <article
                  key={m.slug}
                  id={m.slug}
                  className="rounded-2xl border border-line bg-white px-6 py-6 shadow-elev-1 scroll-mt-24"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-[12px] font-semibold text-brand-700 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-editorial font-semibold text-ink text-[1.45rem] leading-tight flex-1">
                      {m.title}
                    </h3>
                    <span className="text-[12px] text-ink-muted tabular-nums whitespace-nowrap">{m.minutes} min</span>
                  </div>

                  <p className="text-[15px] text-ink-body leading-relaxed mt-3">
                    <span className="font-semibold text-ink">By the end:</span> {m.objective}
                  </p>
                  <p className="text-[13.5px] text-ink-muted leading-relaxed mt-2">
                    <span className="font-semibold">Why here:</span> {m.rationale}
                  </p>

                  {fields.length > 0 && (
                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        Disclosures covered · {fields.length}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {fields.map((f) => (
                          <Link
                            key={f.id}
                            href={`/brsr/${f.code}`}
                            title={f.plain ?? f.label}
                            className="inline-flex items-center rounded-lg border border-line bg-page px-2 py-1 text-[12px] font-medium text-ink-body tabular-nums hover:border-brand-300 hover:text-brand-700 transition-colors"
                          >
                            {f.id}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.practise && (
                    <div className="mt-4 rounded-xl border border-brand-100 bg-tint px-4 py-3.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-700">
                        Hands-on
                      </p>
                      <Link
                        href={m.practise.href}
                        className="text-[14.5px] font-semibold text-ink hover:text-brand-700 transition-colors mt-1 inline-block"
                      >
                        {m.practise.label} &rarr;
                      </Link>
                      <p className="text-[13.5px] text-ink-body leading-relaxed mt-1.5">{m.practise.task}</p>
                    </div>
                  )}

                  <div className="mt-4 grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        Terms to know
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {m.glossary.map((id) => (
                          <Link
                            key={id}
                            href={`/glossary#${id}`}
                            className="inline-flex items-center rounded-lg bg-page border border-line px-2 py-1 text-[12px] text-ink-body hover:border-brand-300 hover:text-brand-700 transition-colors"
                          >
                            {id}
                          </Link>
                        ))}
                      </div>
                      {m.readGuide && (
                        <Link
                          href={m.readGuide}
                          className="text-[13.5px] font-medium text-brand-700 hover:text-brand-800 underline underline-offset-2 mt-3 inline-block"
                        >
                          Background reading for this principle
                        </Link>
                      )}
                    </div>

                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                        Check they got it
                      </p>
                      <ol className="mt-2 space-y-1.5">
                        {m.assessment.map((q) => (
                          <li key={q} className="text-[13.5px] text-ink-body leading-relaxed flex gap-2">
                            <span className="text-ink-muted flex-shrink-0">&middot;</span>
                            <span>{q}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border border-line bg-white px-6 py-5 shadow-elev-1">
            <h2 className="font-editorial font-semibold text-ink text-[1.35rem] leading-tight">Sources</h2>
            <p className="text-[14px] text-ink-body leading-relaxed mt-2.5">
              Every disclosure, unit and measurement note in the linked pages is taken from the{" "}
              <a href={SEBI_FORMAT_URL} target="_blank" rel="noopener noreferrer" className="text-brand-700 font-medium underline underline-offset-2">
                SEBI BRSR Format
              </a>{" "}
              and the {ICAI_SOURCE}, with the page citation shown on each field page. The emission factors behind the
              calculators carry their own citations and vintages. Nothing in this pack asks a learner to take a figure
              on trust.
            </p>
          </section>

        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
