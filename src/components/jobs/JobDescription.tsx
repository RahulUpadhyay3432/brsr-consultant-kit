"use client";
// Renders a job's "about the job" content. Prefers rich structured `sections`
// (heading + intro + bullets), falling back to bulleting the plain `aboutRole`
// prose, and finally to a short line. Shared by the desktop detail pane and the
// phone job sheet; `compact` trims the type scale slightly for the phone.
import { toBullets, type Job } from "@/lib/jobs";

function Bullets({ items, textCls }: { items: string[]; textCls: string }) {
  return (
    <ul className="m-0 list-none pl-0 flex flex-col gap-1.5">
      {items.map((b, i) => (
        <li key={i} className={`flex gap-2.5 leading-relaxed text-ink-body ${textCls}`}>
          <span className="mt-[7px] h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function JobDescription({ job, compact = false }: { job: Job; compact?: boolean }) {
  const textCls = compact ? "text-[13.5px]" : "text-[14.5px]";
  const headCls = "text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-faint mb-2";

  if (job.sections && job.sections.length > 0) {
    return (
      <div className="flex flex-col gap-4">
        {job.sections.map((s, i) => (
          <div key={i}>
            {s.heading && <div className={headCls}>{s.heading}</div>}
            {s.body && (
              <p className={`m-0 ${s.bullets && s.bullets.length ? "mb-2.5" : ""} leading-relaxed text-ink-body ${textCls}`}>{s.body}</p>
            )}
            {s.bullets && s.bullets.length > 0 && <Bullets items={s.bullets} textCls={textCls} />}
          </div>
        ))}
      </div>
    );
  }

  const bullets = toBullets(job.aboutRole);
  if (bullets.length >= 2) return <Bullets items={bullets} textCls={textCls} />;
  return (
    <p className={`m-0 leading-relaxed text-ink-body ${textCls}`}>
      {job.aboutRole || job.summary || "Open the original posting to read the full description."}
    </p>
  );
}
