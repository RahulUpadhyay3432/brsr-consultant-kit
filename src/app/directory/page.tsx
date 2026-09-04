"use client";

// The consultant directory. Its whole reason to exist is a question that gets
// asked constantly in ESG consultant groups and answered only with "DM me":
// who can actually do this piece of work, and where are they.
//
// Read-only and static: profiles come from src/data/consultants.json, curated by
// hand from submissions. No login, no messaging, no profile pages. Someone
// looking for an LCA consultant in Chennai should be able to find one and click
// through to them, and nothing more is needed until that happens often enough to
// justify more.

import { useMemo, useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import CompanyAvatar from "@/components/CompanyAvatar";
import { ListingForm } from "@/components/directory/ListingForm";
import { track } from "@/lib/mixpanel";
import {
  getConsultants,
  expertiseTags,
  matchesConsultant,
  type Consultant,
} from "@/lib/consultants";
import { deDash } from "@/lib/jobs";

function ProfileCard({ c }: { c: Consultant }) {
  const href = c.link
    ? c.link.startsWith("http")
      ? c.link
      : `https://${c.link}`
    : null;
  return (
    <article className="rounded-xl border border-line bg-white p-4 transition-[border-color,box-shadow] duration-150 ease-out hover:border-brand-300 hover:shadow-elev-1">
      <div className="flex items-start gap-3">
        <CompanyAvatar name={c.name} size={44} rounded="rounded-xl" />
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-[15.5px] font-semibold leading-snug text-ink">{deDash(c.name)}</h3>
          <p className="mt-0.5 text-[13.5px] leading-snug text-ink-body">{deDash(c.headline)}</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">
            {deDash(c.location)}
            {c.experience ? ` · ${deDash(c.experience)}` : ""}
            {c.availability ? ` · ${deDash(c.availability)}` : ""}
          </p>
        </div>
      </div>

      {c.about && (
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-body">{deDash(c.about)}</p>
      )}

      {c.expertise?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {c.expertise.map((t) => (
            <span key={t} className="rounded-lg bg-[#EEF3F8] px-2.5 py-1 text-[12px] font-medium text-[#55617A]">
              {t}
            </span>
          ))}
        </div>
      )}

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("directory_profile_clicked", { name: c.name })}
          className="mt-3.5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand-700 hover:underline"
        >
          Get in touch
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>
        </a>
      )}
    </article>
  );
}

export default function DirectoryPage() {
  const all = useMemo(() => getConsultants(), []);
  const tags = useMemo(() => expertiseTags(all), [all]);
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("all");
  const shown = all.filter((c) => matchesConsultant(c, query, tag));

  return (
    <div className="flex min-h-screen flex-col bg-page">
      <main className="flex-1">
        <ToolHero
          active="jobs"
          eyebrow="Directory · ESG consultants"
          title="Find a consultant who does this work"
          subtitle="Independent ESG, BRSR, LCA and EHS consultants across India, listed with what they actually take on."
          whoFor="For anyone with a piece of ESG work and no idea who to ask, and for consultants who would rather be findable than repeat themselves in a group chat."
          maxWidth={1180}
        />

        <div className="anim-up-sm mx-auto w-full px-5 py-8 sm:px-8 lg:px-12" style={{ maxWidth: 1180 }}>
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,420px)]">
            <div className="min-w-0">
              {all.length > 0 && (
                <>
                  <label className="mb-4 flex items-center gap-2.5 rounded-xl border border-line bg-white px-4 py-2.5 text-ink-faint shadow-elev-1 focus-within:border-brand-300">
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search by name, skill or city"
                      aria-label="Search consultants"
                      className="w-full border-none bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-faint"
                    />
                  </label>

                  {tags.length > 1 && (
                    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {[{ label: "All", value: "all" }, ...tags.map((t) => ({ label: t, value: t }))].map((o) => (
                        <button
                          key={o.value}
                          onClick={() => setTag(o.value)}
                          className={`flex-shrink-0 rounded-lg border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 ${
                            tag === o.value ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-white text-ink-body"
                          }`}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="mb-3 text-[13.5px] text-ink-muted">
                    <span className="font-bold text-ink">{shown.length}</span>{" "}
                    {shown.length === 1 ? "consultant" : "consultants"}
                  </p>
                </>
              )}

              <div className="flex flex-col gap-3">
                {shown.map((c) => (
                  <ProfileCard key={c.id} c={c} />
                ))}

                {all.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
                    <h3 className="m-0 font-display text-[1.2rem] font-bold text-ink">The directory is just opening</h3>
                    <p className="mx-auto mt-2.5 max-w-[480px] text-[14px] leading-relaxed text-ink-muted">
                      In every ESG consultant group the same question goes round: who can do an
                      ash-dyke audit, who knows LCA for petrochemicals, is there an ISO lead
                      auditor free in Bengaluru. The answer is always &ldquo;DM me&rdquo;, and it
                      reaches whoever happens to be reading that day.
                    </p>
                    <p className="mx-auto mt-3 max-w-[480px] text-[14px] leading-relaxed text-ink-body">
                      This is a place to be findable instead. If you do this work, add yourself.
                    </p>
                  </div>
                )}

                {all.length > 0 && shown.length === 0 && (
                  <div className="rounded-2xl border border-line bg-white px-6 py-12 text-center">
                    <p className="m-0 text-[14px] text-ink-muted">
                      No one matches that yet. Try a broader term, or{" "}
                      <button onClick={() => { setQuery(""); setTag("all"); }} className="font-semibold text-brand-700 underline">
                        clear the filters
                      </button>
                      .
                    </p>
                  </div>
                )}
              </div>

              <p className="mt-8 text-[13px] leading-relaxed text-ink-muted">
                Listings are self-described and are not endorsements or vetting. Check credentials
                yourself before engaging anyone. Looking for work rather than a consultant? The{" "}
                <Link href="/jobs" className="font-semibold text-brand-700 underline decoration-line hover:decoration-brand-500">
                  roles and gigs board
                </Link>{" "}
                is next door.
              </p>
            </div>

            <aside className="rounded-2xl border border-line bg-white p-5 shadow-elev-1 lg:sticky lg:top-[calc(var(--site-header-h)+1.25rem)]">
              <h2 className="m-0 font-display text-[1.15rem] font-bold text-ink">List yourself</h2>
              <p className="mb-4 mt-1.5 text-[13.5px] leading-relaxed text-ink-muted">
                Free, and it takes a minute. Your email is only used to reach you, it is never
                published.
              </p>
              <ListingForm />
            </aside>
          </div>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
