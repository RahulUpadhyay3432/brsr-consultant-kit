"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import CompanyAvatar from "@/components/CompanyAvatar";
import { SubscribeForm } from "@/components/SubscribeForm";
import { track } from "@/lib/mixpanel";
import {
  usedCategories, jobAge, jobChips, similarJobs, matchesQuery,
  getSavedJobIds, toggleSavedJob, workModeLabel, jobTypeLabel, CATEGORY_LABEL,
  sortJobs, JOB_SORTS, deDash, realCompany, getGigs,
  type Job, type JobCategory, type JobSort,
} from "@/lib/jobs";
import { useMergedJobs } from "@/lib/jobs/useMergedJobs";
import { JobDescription } from "@/components/jobs/JobDescription";
import { PostGigForm } from "@/components/jobs/PostGigForm";

/* ── small pieces ─────────────────────────────────────────────────────────── */
function ArrowUpRight({ cls = "w-4 h-4" }: { cls?: string }) {
  return <svg className={`${cls} flex-shrink-0`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>;
}
function SearchIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function Bookmark({ filled, size = 18 }: { filled: boolean; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>;
}

function FeaturedBadge() {
  return <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-forest text-white text-[10.5px] font-semibold tracking-[0.03em]">Featured</span>;
}
function ClosedBadge() {
  return <span className="inline-flex items-center px-2 py-[3px] rounded-md bg-band text-ink-faint text-[10.5px] font-semibold tracking-[0.03em] border border-line">Closed</span>;
}
function ActiveSignal() {
  return <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Actively hiring</span>;
}
function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center px-2.5 py-1 rounded-full border border-line bg-band text-ink-body text-[12.5px] font-medium leading-none whitespace-nowrap">{children}</span>;
}
function CheckChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-line bg-band text-ink-body text-[13px] font-medium leading-none whitespace-nowrap"><span className="text-emerald-600 font-bold">✓</span>{children}</span>;
}

/* ── filter rail radio row ────────────────────────────────────────────────── */
function OptionRow({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`flex items-center gap-2.5 w-full px-2 py-[7px] rounded-lg text-[13.5px] transition-colors ${active ? "bg-brand-50 text-brand-700 font-semibold" : "text-ink-body font-medium hover:bg-band"}`}>
      <span className={`w-[15px] h-[15px] rounded-full flex-shrink-0 border-2 ${active ? "border-brand-600 bg-brand-600 shadow-[inset_0_0_0_2.5px_#fff]" : "border-[#C6CFDA] bg-white"}`} />
      <span className="flex-1 text-left">{label}</span>
    </button>
  );
}
function FilterGroup({ title, options, value, onChange }: { title: string; options: { label: string; value: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint mb-2">{title}</div>
      <div className="flex flex-col gap-px">
        {options.map((o) => <OptionRow key={o.value} label={o.label} active={value === o.value} onClick={() => onChange(o.value)} />)}
      </div>
    </div>
  );
}

/* ── list card ────────────────────────────────────────────────────────────── */
function JobCard({ job, selected, saved, onSelect, onSave }: { job: Job; selected: boolean; saved: boolean; onSelect: () => void; onSave: () => void }) {
  return (
    <div role="button" tabIndex={0} onClick={onSelect} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(); } }}
      className={`group relative p-4 rounded-xl flex flex-col gap-2.5 cursor-pointer border transition-[border-color,box-shadow,background-color,opacity] duration-150 ease-out ${selected ? "border-brand-500 bg-brand-50/50 shadow-elev-1" : "border-line bg-white hover:border-brand-300 hover:shadow-elev-1"} ${job.closed ? "opacity-70" : ""}`}>
      {selected && <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-r bg-brand-500" />}
      <div className="flex gap-3 items-start">
        <CompanyAvatar name={realCompany(job.company) || "?"} size={40} />
        <div className="flex-1 min-w-0">
          {(job.featured || job.closed) && (
            <div className="flex items-center gap-1.5 mb-1">{job.featured && <FeaturedBadge />}{job.closed && <ClosedBadge />}</div>
          )}
          <h3 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-ink leading-snug">{deDash(job.title)}</h3>
          <p className="mt-0.5 text-[13px] text-ink-muted truncate"><span className="font-semibold text-ink-body">{realCompany(job.company) || "Company on posting"}</span>{job.location ? ` · ${deDash(job.location)}` : ""}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} aria-pressed={saved} aria-label={saved ? "Saved" : "Save"} title={saved ? "Saved" : "Save"}
          className={`p-1 rounded-lg flex-shrink-0 transition-[transform,color] duration-150 ease-out active:scale-90 ${saved ? "text-brand-600" : "text-ink-faint hover:text-ink-muted"}`}><Bookmark filled={saved} size={18} /></button>
      </div>
      {jobChips(job).length > 0 && <div className="flex flex-wrap gap-1.5">{jobChips(job).slice(0, 3).map((c) => <Chip key={c}>{c}</Chip>)}</div>}
      <div className="flex items-center gap-2 text-[11.5px] text-ink-faint">
        {job.activelyHiring && !job.closed && <span className="inline-flex items-center gap-1 font-semibold text-emerald-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Hiring</span>}
        <span className="truncate">{CATEGORY_LABEL[job.category]} · {jobAge(job.postedDate)}{job.sourceName ? ` · ${job.sourceName}` : ""}</span>
        {job.salary && <span className="ml-auto font-semibold text-ink-body whitespace-nowrap">{deDash(job.salary)}</span>}
      </div>
    </div>
  );
}

/* ── detail pane ──────────────────────────────────────────────────────────── */
type Tab = "job" | "company" | "similar";
function DetailPane({ job, all, saved, onSave, onSelect, embedded = false }: { job: Job; all: Job[]; saved: boolean; onSave: () => void; onSelect: (id: string) => void; embedded?: boolean }) {
  const [tab, setTab] = useState<Tab>("job");
  useEffect(() => setTab("job"), [job.id]);
  const chips = jobChips(job);
  const sim = similarJobs(all, job);
  const companyMeta = [job.location, job.companySize].filter(Boolean).map((x) => deDash(x as string)).join(" · ");
  const TabBtn = ({ k, label }: { k: Tab; label: string }) => (
    <button onClick={() => setTab(k)} className={`pb-3 -mb-px text-[14.5px] border-b-2 transition-colors ${tab === k ? "text-ink font-semibold border-brand-600" : "text-ink-muted font-medium border-transparent hover:text-ink-body"}`}>{label}</button>
  );

  return (
    <div className="bg-white border border-line rounded-[18px] shadow-elev-2 overflow-hidden">
      <div className="px-6 pt-6">
        {job.closed && <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#F6F2ED] border border-[#EADFD1] text-[#946B41] text-[13px] font-medium mb-4">This role is no longer accepting applications.</div>}
        <div className="flex gap-4 items-start">
          <CompanyAvatar name={realCompany(job.company) || "?"} size={56} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {job.featured && <FeaturedBadge />}
              {job.activelyHiring && !job.closed && <ActiveSignal />}
            </div>
            <h2 className="m-0 font-editorial text-[1.6rem] font-semibold tracking-[-0.01em] leading-tight text-ink">{deDash(job.title)}</h2>
            <div className="flex items-center gap-2 mt-1.5 text-[14px] text-ink-muted"><span className="font-semibold text-ink-body">{realCompany(job.company) || "Company on posting"}</span> · <span>{deDash(job.location)}</span></div>
            <div className="mt-1 text-[12.5px] text-ink-faint">Posted {jobAge(job.postedDate)} · via {job.sourceName || "source"}</div>
          </div>
          <button onClick={onSave} aria-pressed={saved} className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-line bg-white text-[13px] font-semibold text-ink-body flex-shrink-0 hover:bg-band"><Bookmark filled={saved} size={16} />{saved ? "Saved" : "Save"}</button>
        </div>

        {job.salary && (
          <div className="mt-[18px] px-4 py-3.5 bg-brand-50 border border-[#CDE2F6] rounded-xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint mb-0.5">Compensation</div>
            <div className="text-[21px] font-bold text-ink tracking-[-0.01em]">{deDash(job.salary)}</div>
          </div>
        )}

        {chips.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{chips.map((c) => <CheckChip key={c}>{c}</CheckChip>)}</div>}

        <div className="flex items-center gap-3.5 mt-5">
          {job.closed
            ? <span className="inline-flex items-center px-5 py-3 rounded-xl bg-band text-ink-faint font-semibold text-[14.5px]">Applications closed</span>
            : <a href={job.applyUrl} target="_blank" rel="noreferrer" onClick={() => track("job_clicked", { category: job.category, company: job.company, from: "jobs-detail" })} className="pressable inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-[14.5px]">View &amp; apply <ArrowUpRight /></a>}
          <span className="text-[12.5px] text-ink-faint">Opens {job.sourceName || "the source"} in a new tab</span>
        </div>

        <div className="flex gap-6 mt-5 border-b border-line">
          <TabBtn k="job" label="About the job" />
          <TabBtn k="company" label="About the company" />
          <TabBtn k="similar" label="Similar jobs" />
        </div>
      </div>

      {/* key={tab} remounts the panel so the fade replays on every switch, and the
          scroll position resets to the top of the new tab rather than carrying over. */}
      <div key={tab} className={`tab-fade px-6 py-5 ${embedded ? "" : "max-h-[calc(100vh-var(--site-header-h)-320px)] min-h-[280px] overflow-y-auto"}`}>
        {tab === "job" && (
          <div>
            <JobDescription job={job} />
            {job.tags && job.tags.length > 0 && (
              <>
                <div className="text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint mb-2.5 mt-4">Skills &amp; focus</div>
                <div className="flex flex-wrap gap-1.5">{job.tags.map((t) => <span key={t} className="px-2.5 py-1 rounded-lg bg-[#EEF3F8] text-[#55617A] text-[12.5px] font-medium">{t}</span>)}</div>
              </>
            )}
          </div>
        )}
        {tab === "company" && (
          <div>
            <div className="flex gap-3 items-center mb-3.5"><CompanyAvatar name={realCompany(job.company) || "?"} size={44} /><div><div className="text-[15.5px] font-semibold text-ink">{realCompany(job.company) || "Company on posting"}</div>{companyMeta && <div className="text-[13px] text-ink-muted">{companyMeta}</div>}</div></div>
            <p className="m-0 text-[14.5px] leading-relaxed text-ink-body">{deDash(job.aboutCompany) || `${realCompany(job.company) || "The employer"} is hiring for this role. See the original posting for more about the team.`}</p>
          </div>
        )}
        {tab === "similar" && (
          <div className="flex flex-col gap-2.5">
            {sim.map((j) => (
              <div key={j.id} role="button" tabIndex={0} onClick={() => onSelect(j.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(j.id); } }}
                className="flex gap-3 items-center p-3 border border-line rounded-xl cursor-pointer bg-white hover:border-brand-200 hover:shadow-elev-1 transition-[border-color,box-shadow] duration-150 ease-out">
                <CompanyAvatar name={realCompany(j.company) || "?"} size={38} />
                <div className="flex-1 min-w-0"><div className="text-[14px] font-semibold text-ink truncate">{deDash(j.title)}</div><div className="text-[12.5px] text-ink-muted truncate">{realCompany(j.company) || "Company on posting"} · {workModeLabel(j.workMode) || CATEGORY_LABEL[j.category]} · {jobAge(j.postedDate)}</div></div>
                {j.salary && <div className="text-[13px] font-semibold text-ink whitespace-nowrap">{deDash(j.salary)}</div>}
              </div>
            ))}
            {sim.length === 0 && <div className="p-6 text-center text-[13.5px] text-ink-faint bg-band rounded-xl">No similar roles on the board right now.</div>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── gigs ─────────────────────────────────────────────────────────────────── */
// The gigs board is deliberately not a second copy of the roles board: there is
// no filter rail, no detail pane, no sort. A handful of curated assignments does
// not need furniture, and the submission form is the point of the page while the
// list is still short.
function GigsPanel({ gigs }: { gigs: Job[] }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] gap-8 items-start">
      <div className="flex flex-col gap-3 min-w-0">
        {gigs.length > 0 ? (
          gigs.map((g) => (
            <a
              key={g.id}
              href={g.applyUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("gig_clicked", { title: g.title })}
              className="group p-4 rounded-xl border border-line bg-white hover:border-brand-300 hover:shadow-elev-1 transition-[border-color,box-shadow] duration-150 ease-out"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="m-0 text-[15px] font-semibold text-ink leading-snug">{deDash(g.title)}</h3>
                {g.salary && (
                  <span className="text-[13px] font-semibold text-ink-body whitespace-nowrap">{deDash(g.salary)}</span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-ink-muted">
                {realCompany(g.company) || "Posted directly"}
                {g.location ? ` · ${deDash(g.location)}` : ""}
                {` · ${jobAge(g.postedDate)}`}
              </p>
              {g.summary && (
                <p className="mt-2 text-[13.5px] text-ink-body leading-relaxed">{deDash(g.summary)}</p>
              )}
            </a>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
            <h3 className="font-display text-[1.2rem] font-bold text-ink m-0">No gigs up yet</h3>
            <p className="mx-auto mt-2.5 max-w-[460px] text-[14px] text-ink-muted leading-relaxed">
              One-off assignments, an LCA study, a VVB empanelment, an EIA coordination,
              an ash-dyke audit, mostly travel by word of mouth in WhatsApp groups and
              never reach a job board. This is a place to put them where the consultants
              who do that work will actually see them.
            </p>
            <p className="mx-auto mt-3 max-w-[460px] text-[14px] text-ink-body leading-relaxed">
              Have one? Post it on the right. It is free, and it takes a minute.
            </p>
          </div>
        )}
      </div>

      <aside className="rounded-2xl border border-line bg-white p-5 shadow-elev-1 lg:sticky lg:top-[calc(var(--site-header-h)+1.25rem)]">
        <h3 className="font-display text-[1.15rem] font-bold text-ink m-0">Post a gig</h3>
        <p className="mt-1.5 mb-4 text-[13.5px] text-ink-muted leading-relaxed">
          Need a one-off piece of ESG work done? Put it in front of consultants who do it.
        </p>
        <PostGigForm />
      </aside>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────────── */
type DateFilter = "all" | "24h" | "week" | "month";
export default function JobsPage() {
  const all = useMergedJobs();
  const cats = useMemo(() => usedCategories(all), [all]);
  const modes = useMemo(() => Array.from(new Set(all.map((j) => j.workMode).filter(Boolean))) as string[], [all]);
  const types = useMemo(() => Array.from(new Set(all.map((j) => j.type).filter(Boolean))) as string[], [all]);

  const [cat, setCat] = useState<JobCategory | "all">("all");
  const [mode, setMode] = useState("all");
  const [type, setType] = useState("all");
  const [date, setDate] = useState<DateFilter>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<JobSort>("newest");
  const [board, setBoard] = useState<"roles" | "gigs">("roles");
  const gigs = useMemo(() => getGigs(), []);
  const [selected, setSelected] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false); // mobile filter sheet
  const [mobileDetail, setMobileDetail] = useState(false); // mobile job-detail sheet
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => setSavedIds(getSavedJobIds()), []);
  const save = (id: string) => { toggleSavedJob(id); setSavedIds(getSavedJobIds()); };

  const matchDate = (j: Job) => {
    if (date === "all") return true;
    const days = (Date.now() - new Date(j.postedDate).getTime()) / 86400000;
    return date === "24h" ? days <= 1 : date === "week" ? days <= 7 : days <= 30;
  };
  const shown = sortJobs(
    all.filter(
      (j) => (cat === "all" || j.category === cat) && (mode === "all" || j.workMode === mode) && (type === "all" || j.type === type) && matchDate(j) && matchesQuery(j, query)
    ),
    sort
  );
  // Prefer the selected job only if it's still in the filtered list, so changing a
  // filter also refreshes the detail pane (otherwise it looks like nothing happened).
  const activeJob = shown.find((j) => j.id === selected) || shown[0] || null;
  const anyFilter = cat !== "all" || mode !== "all" || type !== "all" || date !== "all" || !!query;
  const clear = () => { setCat("all"); setMode("all"); setType("all"); setDate("all"); setQuery(""); };
  // Count of active non-search filters, shown on the mobile Filters button.
  const activeFilterCount = [cat !== "all", mode !== "all", type !== "all", date !== "all"].filter(Boolean).length;

  // The four filter groups, shared by the desktop rail and the mobile sheet.
  const filterGroups = (
    <>
      {cats.length > 1 && <FilterGroup title="Role type" value={cat} onChange={(v) => setCat(v as JobCategory | "all")} options={[{ label: "All roles", value: "all" }, ...cats.map((c) => ({ label: c.label, value: c.slug }))]} />}
      {modes.length > 1 && <FilterGroup title="Workplace" value={mode} onChange={setMode} options={[{ label: "Any", value: "all" }, ...modes.map((m) => ({ label: workModeLabel(m as never) || m, value: m }))]} />}
      {types.length > 1 && <FilterGroup title="Employment" value={type} onChange={setType} options={[{ label: "Any", value: "all" }, ...types.map((t) => ({ label: jobTypeLabel(t as never) || t, value: t }))]} />}
      <FilterGroup title="Date posted" value={date} onChange={(v) => setDate(v as DateFilter)} options={[{ label: "Any time", value: "all" }, { label: "Past 24 hours", value: "24h" }, { label: "Past week", value: "week" }, { label: "Past month", value: "month" }]} />
    </>
  );

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="jobs"
          eyebrow="Careers · ESG & sustainability"
          title="Sustainability & ESG roles, hand-picked"
          subtitle="A small, curated board of BRSR, climate and sustainable-finance work across India: full-time roles, and the one-off assignments that usually only travel by word of mouth."
          whoFor="For consultants looking for their next assignment, for anyone building a career in sustainability, and for the people who need a piece of ESG work done. We link out, we never scrape."
          maxWidth={1520}
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 lg:px-12 py-8" style={{ maxWidth: 1520 }}>
          {all.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-16 text-center">
              <div className="mx-auto grid place-items-center h-14 w-14 rounded-2xl bg-brand-50 text-brand-600 mb-4">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" /></svg>
              </div>
              <h3 className="font-display text-[1.25rem] font-bold text-ink">First roles landing shortly</h3>
              <p className="text-[14px] text-ink-muted max-w-[440px] mx-auto mt-2 leading-relaxed">We&apos;re curating live ESG and sustainability openings across India, hand-picked and linked to the original posting. Check back soon, or get updates in the Brief.</p>
              <Link href="/brief" className="inline-flex items-center gap-2 mt-5 rounded-xl bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 hover:bg-forest-light transition-colors">Open the Brief</Link>
            </div>
          ) : (
            <>
              {/* Roles vs gigs. A consultant hunting their next assignment and one
                  hunting a job want different lists, and only one of the two can be
                  crawled -- gigs are submitted. */}
              <div className="inline-flex items-center gap-1 p-1 mb-5 rounded-xl border border-line bg-white shadow-elev-1">
                {([["roles", `Roles${all.length ? ` (${all.length})` : ""}`], ["gigs", `Freelance gigs${gigs.length ? ` (${gigs.length})` : ""}`]] as const).map(([v, label]) => (
                  <button
                    key={v}
                    onClick={() => { setBoard(v); track("jobs_board_switched", { board: v }); }}
                    aria-pressed={board === v}
                    className={`rounded-lg px-3.5 py-1.5 text-[13.5px] font-semibold transition-colors duration-150 ${board === v ? "bg-brand-600 text-white" : "text-ink-body hover:bg-band"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {board === "gigs" ? (
                <GigsPanel gigs={gigs} />
              ) : (
              <>
              {/* search */}
              <div className="flex items-center gap-3 mb-5">
                <label className="flex-1 flex items-center gap-2.5 bg-white border border-line rounded-xl px-4 py-2.5 shadow-elev-1 text-ink-faint focus-within:border-brand-300">
                  <SearchIcon />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search roles, companies, or skills" aria-label="Search roles" className="border-none outline-none bg-transparent text-[14.5px] text-ink w-full placeholder:text-ink-faint" />
                </label>
                <button onClick={() => setShowFilters(true)} className="lg:hidden flex-shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-ink-body shadow-elev-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="6" x2="20" y2="6" /><line x1="7" y1="12" x2="17" y2="12" /><line x1="10" y1="18" x2="14" y2="18" /></svg>
                  Filters{activeFilterCount > 0 && <span className="ml-0.5 grid place-items-center min-w-[18px] h-[18px] rounded-full bg-brand-600 text-white text-[11px] font-bold px-1">{activeFilterCount}</span>}
                </button>
              </div>

              {/* count + sort. Its own row rather than crammed beside the search
                  box, which on a phone left the count clipped to a bare number. */}
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-[13.5px] text-ink-muted whitespace-nowrap">
                  <span className="font-bold text-ink">{shown.length}</span> role{shown.length === 1 ? "" : "s"}
                  {anyFilter && <span className="text-ink-faint"> of {all.length}</span>}
                </span>
                <label className="flex items-center gap-2 text-[13px] text-ink-muted">
                  <span className="hidden sm:inline">Sort by</span>
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value as JobSort); track("jobs_sorted", { sort: e.target.value }); }}
                    aria-label="Sort roles"
                    className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[13px] font-semibold text-ink-body shadow-elev-1 outline-none focus:border-brand-300"
                  >
                    {JOB_SORTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid lg:grid-cols-[220px_minmax(360px,460px)_minmax(440px,1fr)] gap-6 xl:gap-8 items-start">
                {/* filter rail */}
                <aside className="hidden lg:flex flex-col gap-5 sticky top-[calc(var(--site-header-h)+1.25rem)]">
                  <div className="flex items-center justify-between">
                    <div className="text-[15px] font-bold tracking-[-0.01em] text-ink">Filters</div>
                    {anyFilter && <button onClick={clear} className="text-brand-700 text-[12.5px] font-semibold">Clear all</button>}
                  </div>
                  {filterGroups}
                </aside>

                {/* list */}
                <div className="flex flex-col gap-3 min-w-0">
                  {/* mobile category pills */}
                  {cats.length > 1 && (
                    <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                      {[{ label: "All", value: "all" as const }, ...cats.map((c) => ({ label: c.label, value: c.slug as JobCategory }))].map((o) => (
                        <button key={o.value} onClick={() => setCat(o.value)} className={`flex-shrink-0 text-[13px] font-medium px-3.5 py-1.5 rounded-lg border ${cat === o.value ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line"}`}>{o.label}</button>
                      ))}
                    </div>
                  )}
                  {shown.map((job) => (
                    <JobCard key={job.id} job={job} selected={activeJob?.id === job.id} saved={savedIds.includes(job.id)} onSelect={() => { setSelected(job.id); setMobileDetail(true); track("job_selected", { company: job.company }); }} onSave={() => save(job.id)} />
                  ))}
                  {shown.length === 0 && (
                    <div className="text-center py-14 px-6 bg-white border border-line rounded-2xl">
                      <div className="font-editorial text-[1.25rem] font-semibold text-ink mb-1.5">No roles match these filters</div>
                      <p className="text-[14px] text-ink-muted m-0 mb-4">Try widening your search or clearing a filter.</p>
                      <button onClick={clear} className="pressable inline-flex items-center rounded-xl bg-brand-600 text-white text-[13.5px] font-semibold px-4 py-2.5">Clear all filters</button>
                    </div>
                  )}
                </div>

                {/* detail pane */}
                <section className="hidden lg:block sticky top-[calc(var(--site-header-h)+1.25rem)] min-w-0">
                  {activeJob
                    ? <DetailPane job={activeJob} all={all} saved={savedIds.includes(activeJob.id)} onSave={() => save(activeJob.id)} onSelect={(id) => setSelected(id)} />
                    : <div className="bg-white border border-dashed border-line rounded-[18px] py-16 px-10 text-center font-editorial text-[1.15rem] font-semibold text-ink-muted">Select a role to see the details</div>}
                </section>
              </div>

              </>
              )}

              <div className="mt-8"><SubscribeForm variant="strip" source="jobs" /></div>
            </>
          )}

          <p className="text-[13px] text-ink-muted leading-relaxed mt-8">
            Roles are curated and link to the original posting, verify the details and apply there. Listings are not endorsements. Have a one-off assignment? Post it under Freelance gigs. Hiring for a full-time role?{" "}
            <a href="mailto:rahulu626@gmail.com?subject=ESG%20job%20listing%20for%20Saaksh" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">Send it to us</a>.
          </p>
        </div>
      </main>
      <BlogFooter />

      {/* Mobile filter sheet. Rendered at the page root (outside the anim-up-sm
          container, whose transform would otherwise break position:fixed) so it
          overlays the viewport. Reuses the same FilterGroups as the desktop rail. */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end">
          <button aria-label="Close filters" onClick={() => setShowFilters(false)} className="scrim-in absolute inset-0 bg-ink/40" />
          <div className="sheet-up relative bg-white rounded-t-3xl border-t border-line shadow-elev-3 max-h-[85%] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-line">
              <div className="font-display text-[1.1rem] font-bold text-ink">Filters</div>
              {anyFilter && <button onClick={clear} className="text-brand-700 text-[13px] font-semibold">Clear all</button>}
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 flex flex-col gap-5">{filterGroups}</div>
            <div className="px-5 py-3.5 border-t border-line">
              <button onClick={() => setShowFilters(false)} className="pressable w-full rounded-xl bg-brand-600 text-white text-[14px] font-semibold py-3">Show {shown.length} role{shown.length === 1 ? "" : "s"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile job detail. The desktop detail pane is lg-only, so on phones a tapped
          card opens this full-screen sheet with the same DetailPane. Rendered at the
          page root to escape the anim-up-sm transform. */}
      {mobileDetail && activeJob && (
        <div className="sheet-up lg:hidden fixed inset-0 z-50 bg-page flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-line bg-white flex-shrink-0">
            <button onClick={() => setMobileDetail(false)} className="pressable inline-flex items-center gap-1.5 text-[14px] font-semibold text-ink-body">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              All roles
            </button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            <DetailPane job={activeJob} all={all} saved={savedIds.includes(activeJob.id)} onSave={() => save(activeJob.id)} onSelect={(id) => setSelected(id)} embedded />
          </div>
        </div>
      )}
    </div>
  );
}
