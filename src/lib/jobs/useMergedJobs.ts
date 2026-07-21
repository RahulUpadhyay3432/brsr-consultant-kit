"use client";
// Client hook: curated jobs (jobs.json) render immediately; link-verified ingested
// jobs (from /api/jobs) fold in when the fetch resolves. Empty and harmless before
// the scraping pipeline / brsr_jobs table exist, so the board always works.
import { useEffect, useMemo, useState } from "react";
import { getJobs, mergeJobs, type Job } from "@/lib/jobs";

export function useMergedJobs(): Job[] {
  const curated = useMemo(() => getJobs(), []);
  const [stored, setStored] = useState<Job[]>([]);
  useEffect(() => {
    let live = true;
    fetch("/api/jobs")
      .then((r) => (r.ok ? r.json() : { jobs: [] }))
      .then((d) => {
        if (live) setStored(Array.isArray(d?.jobs) ? (d.jobs as Job[]) : []);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  return useMemo(() => mergeJobs(curated, stored), [curated, stored]);
}
