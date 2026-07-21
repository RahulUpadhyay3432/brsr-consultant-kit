"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import CompanyAvatar from "@/components/CompanyAvatar";
import { SubscribeForm } from "@/components/SubscribeForm";
import { track } from "@/lib/mixpanel";
import {
  getJobs, usedCategories, jobAge, workModeLabel, jobTypeLabel, CATEGORY_LABEL,
  type Job, type JobCategory,
} from "@/lib/jobs";

function ArrowUpRight() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-[11.5px] font-medium text-ink-body bg-band border border-line rounded-md px-2 py-0.5">
      {children}
    </span>
  );
}

function JobCard({ job }: { job: Job }) {
  const onClick = () => track("job_clicked", { category: job.category, company: job.company });
  const meta = [jobTypeLabel(job.type), workModeLabel(job.workMode), job.seniority, job.experience].filter(Boolean) as string[];

  return (
    <a
      href={job.applyUrl} target="_blank" rel="noreferrer" onClick={onClick}
      className="group flex flex-col rounded-2xl border border-line bg-white p-5 shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-start gap-3">
        <CompanyAvatar name={job.company} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16px] font-semibold text-ink leading-snug tracking-[-0.01em] group-hover:text-brand-700 transition-colors">
            {job.title}
          </h3>
          <p className="text-[13px] text-ink-muted mt-0.5 truncate">
            {job.company} · {job.location}
          </p>
        </div>
        <span className="text-[11px] font-medium text-ink-faint whitespace-nowrap">{jobAge(job.postedDate)}</span>
      </div>

      {job.summary && <p className="text-[13.5px] text-ink-body leading-relaxed mt-3">{job.summary}</p>}

      {(meta.length > 0 || job.salary) && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {job.salary && (
            <span className="inline-flex items-center text-[11.5px] font-semibold text-brand-700 bg-brand-50 border border-[#CDE2F6] rounded-md px-2 py-0.5">{job.salary}</span>
          )}
          {meta.map((m) => <Chip key={m}>{m}</Chip>)}
        </div>
      )}

      {job.tags && job.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {job.tags.slice(0, 5).map((t) => (
            <span key={t} className="text-[11px] text-ink-muted">#{t}</span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line">
        <span className="text-[12px] text-ink-faint">
          {CATEGORY_LABEL[job.category]}{job.sourceName ? ` · via ${job.sourceName}` : ""}
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 group-hover:gap-2 transition-all">
          View &amp; apply <ArrowUpRight />
        </span>
      </div>
    </a>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" /></svg>
      </div>
      <h3 className="font-display text-[1.25rem] font-bold text-ink">First roles landing shortly</h3>
      <p className="text-[14px] text-ink-muted max-w-[440px] mx-auto mt-2 leading-relaxed">
        We&apos;re curating live ESG and sustainability openings across India, hand-picked and linked to the original posting. Check back soon, or get updates in the Brief.
      </p>
      <Link href="/brief" className="inline-flex items-center gap-2 mt-5 rounded-xl bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 hover:bg-forest-light transition-colors">
        Open the Brief
      </Link>
    </div>
  );
}

export default function JobsPage() {
  const jobs = useMemo(() => getJobs(), []);
  const cats = useMemo(() => usedCategories(jobs), [jobs]);
  const [cat, setCat] = useState<JobCategory | "all">("all");
  const shown = cat === "all" ? jobs : jobs.filter((j) => j.category === cat);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="jobs"
          eyebrow="Careers · ESG & sustainability"
          title="ESG & sustainability jobs in India"
          subtitle="A hand-picked board of live openings in BRSR, ESG, climate and sustainability, from consulting, corporates and startups. Every role links straight to the original posting."
          whoFor="For consultants hiring or subcontracting, and for anyone building a career in sustainability. We link out, we never scrape."
          maxWidth={1180}
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1180 }}>
          {jobs.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 mb-7">
                <button onClick={() => setCat("all")}
                  className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${cat === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line hover:border-brand-300"}`}>
                  All roles
                </button>
                {cats.map((c) => (
                  <button key={c.slug} onClick={() => setCat(c.slug)}
                    className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${cat === c.slug ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line hover:border-brand-300"}`}>
                    {c.label}
                  </button>
                ))}
                <span className="ml-auto text-[12.5px] text-ink-faint">{shown.length} role{shown.length === 1 ? "" : "s"}</span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shown.map((job) => <JobCard key={job.id} job={job} />)}
              </div>

              <div className="mt-8">
                <SubscribeForm variant="strip" source="jobs" />
              </div>
            </>
          )}

          <p className="text-[13px] text-ink-muted leading-relaxed mt-8">
            Roles are curated and link to the original posting, verify the details and apply there. Listings are not endorsements. Hiring for a sustainability role and want it here?{" "}
            <a href="mailto:rahulu626@gmail.com?subject=ESG%20job%20listing%20for%20Saaksh" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">Send it to us</a>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
