"use client";

// Email capture for regulatory/BRSR updates. Calls the public subscribeAction
// (stores in Supabase). Three layouts: a "card" (end of a blog post), a "strip"
// (/latest), and "compact" (footer). tone="dark" for placement on a dark surface.

import { useState } from "react";
import { subscribeAction } from "@/lib/datarequest/leads";
import { track } from "@/lib/mixpanel";

type Variant = "card" | "strip" | "compact" | "inline";
type Tone = "light" | "dark";

const COPY = {
  heading: "Stay ahead of the regulation",
  sub: "SEBI, BRSR, CBAM and CCTS moves that matter, plus the newest guides, in your inbox. No spam.",
};

export function SubscribeForm({
  source,
  variant = "card",
  tone = "light",
}: {
  source: string;
  variant?: Variant;
  tone?: Tone;
}) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("source", source);
    try {
      const res = await subscribeAction(fd);
      if (res.ok) {
        track("newsletter_subscribed", { source });
        setState("done");
      } else {
        setError(res.message || "Something went wrong.");
        setState("error");
      }
    } catch {
      setError("Something went wrong.");
      setState("error");
    }
  };

  const dark = tone === "dark";
  const inputCls = dark
    ? "flex-1 min-w-0 rounded-lg bg-white/10 border border-white/15 px-3.5 py-2.5 text-[14px] text-white placeholder-white/45 outline-none focus:border-brand-400 focus:bg-white/[0.14] transition-colors"
    : "flex-1 min-w-0 rounded-lg bg-white border border-line px-3.5 py-2.5 text-[14px] text-ink placeholder-ink-faint outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors";
  const btnCls =
    "shrink-0 inline-flex items-center justify-center rounded-lg bg-brand-500 text-white text-[14px] font-semibold px-4 py-2.5 hover:bg-brand-400 transition-colors disabled:opacity-60 pressable";

  // Shared form body (input + button + honeypot + status), used by all variants.
  const formBody = (
    <form onSubmit={onSubmit} className="w-full">
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      {state === "done" ? (
        <p className={`text-[14px] font-medium flex items-center gap-2 ${dark ? "text-white" : "text-brand-700"}`}>
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
          You&apos;re on the list. Thanks!
        </p>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              name="email"
              type="email"
              required
              maxLength={254}
              placeholder="you@firm.com"
              aria-label="Email address"
              className={inputCls}
            />
            <button type="submit" disabled={state === "sending"} className={btnCls}>
              {state === "sending" ? "…" : "Subscribe"}
            </button>
          </div>
          {state === "error" && (
            <p className={`text-[12.5px] mt-1.5 ${dark ? "text-ember" : "text-ember-dark"}`}>{error}</p>
          )}
        </>
      )}
    </form>
  );

  // Bare form only (no heading/sub); the caller supplies its own surrounding copy.
  if (variant === "inline") return formBody;

  if (variant === "compact") {
    // Footer: heading + sub stacked above a narrow form.
    return (
      <div className="max-w-[340px]">
        <p className={`font-mono text-[10.5px] uppercase tracking-[0.14em] ${dark ? "text-white/55" : "text-ink-muted"}`}>
          {COPY.heading}
        </p>
        <p className={`text-[13px] leading-relaxed mt-2 mb-3 ${dark ? "text-white/70" : "text-ink-muted"}`}>
          {COPY.sub}
        </p>
        {formBody}
      </div>
    );
  }

  if (variant === "strip") {
    // /latest: a full-width band, heading left + form right.
    return (
      <div className="rounded-2xl border border-brand-100 bg-brand-50 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="flex-1">
          <p className="font-display font-bold text-[1.25rem] text-ink tracking-[-0.015em] leading-tight">{COPY.heading}</p>
          <p className="text-[13.5px] text-ink-body leading-relaxed mt-1.5 max-w-[440px]">{COPY.sub}</p>
        </div>
        <div className="sm:w-[320px] shrink-0">{formBody}</div>
      </div>
    );
  }

  // card (blog): bordered card with heading + sub + form.
  return (
    <div className="rounded-2xl border border-line bg-white p-6 sm:p-7 shadow-elev-1">
      <p className="font-display font-bold text-[1.2rem] text-ink tracking-[-0.015em] leading-tight">{COPY.heading}</p>
      <p className="text-[13.5px] text-ink-body leading-relaxed mt-1.5 mb-4 max-w-[460px]">{COPY.sub}</p>
      {formBody}
    </div>
  );
}
