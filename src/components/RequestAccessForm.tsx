"use client";

// The on-site "Request Pro access" form. Calls the public requestAccessAction
// (stores the lead + emails us), shows an inline success state. No data leaves
// until submit; nothing about a client is involved here.

import { useState } from "react";
import { requestAccessAction } from "@/lib/datarequest/leads";
import { track } from "@/lib/mixpanel";

export function RequestAccessForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await requestAccessAction(fd);
      if (res.ok) {
        track("pro_access_requested");
        setState("done");
      } else {
        setError(res.message || "Something went wrong. Please try again.");
        setState("error");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center shadow-elev-1">
        <div className="mx-auto w-11 h-11 rounded-full bg-brand-600 flex items-center justify-center mb-4">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-display font-bold text-[1.3rem] text-ink tracking-[-0.015em]">Request received</p>
        <p className="text-[14px] text-ink-body leading-relaxed mt-2 max-w-[380px] mx-auto">
          Thanks, we&apos;ll be in touch shortly to set you up. In the meantime, the free readiness tool
          is yours to use with no login.
        </p>
      </div>
    );
  }

  const inputCls =
    "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink placeholder-ink-faint " +
    "outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors";
  const labelCls = "block text-[13px] font-semibold text-ink-body mb-1.5";

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-line bg-white p-6 sm:p-8 shadow-elev-1 space-y-4">
      {/* Honeypot: hidden from users, catches bots. */}
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ra-name" className={labelCls}>Your name <span className="text-ember">*</span></label>
          <input id="ra-name" name="name" required maxLength={120} placeholder="Priya Sharma" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ra-org" className={labelCls}>Organisation</label>
          <input id="ra-org" name="organisation" maxLength={200} placeholder="Your firm (optional)" className={inputCls} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="ra-email" className={labelCls}>Work email <span className="text-ember">*</span></label>
          <input id="ra-email" name="email" type="email" required maxLength={254} placeholder="you@firm.com" className={inputCls} />
        </div>
        <div>
          <label htmlFor="ra-clients" className={labelCls}>Roughly how many clients?</label>
          <input id="ra-clients" name="clients" maxLength={60} placeholder="e.g. 3–5" className={inputCls} />
        </div>
      </div>

      <div>
        <label htmlFor="ra-msg" className={labelCls}>Anything you want us to know?</label>
        <textarea id="ra-msg" name="message" rows={3} maxLength={2000} placeholder="What you're hoping Collect can do for you (optional)" className={`${inputCls} resize-none`} />
      </div>

      {state === "error" && (
        <p className="text-[13px] text-ember font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="pressable w-full inline-flex items-center justify-center gap-2 rounded-xl bg-forest text-white text-[15px] font-semibold py-3.5 hover:bg-forest-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {state === "sending" ? "Sending…" : "Request Pro access"}
      </button>
      <p className="text-[12px] text-ink-muted text-center leading-relaxed">
        We onboard consultants manually and price per engagement. No spam, no automated billing.
      </p>
    </form>
  );
}
