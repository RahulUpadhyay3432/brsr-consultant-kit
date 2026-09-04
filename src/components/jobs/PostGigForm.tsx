"use client";

// Submission form for the gigs board. Gigs are one-off assignments (an LCA study,
// a VVB empanelment, an ash-dyke audit) that circulate in consultant WhatsApp
// groups and never reach iimjobs or Indeed, so there is nothing to crawl: the
// people who need the work done have to be able to post it.
//
// Submissions land in the founder's inbox and are curated into src/data/gigs.json
// by hand. Nothing goes live unreviewed, and the copy says so.

import { useState } from "react";
import { postGigAction } from "@/lib/datarequest/leads";
import { track } from "@/lib/mixpanel";

const FIELD =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-brand-300";
const LABEL = "block text-[12.5px] font-semibold text-ink-body mb-1.5";

export function PostGigForm({ onDone }: { onDone?: () => void }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await postGigAction(new FormData(e.currentTarget));
      if (res.ok) {
        track("gig_submitted");
        setState("done");
        onDone?.();
      } else {
        setError(res.message || "Something went wrong.");
        setState("error");
      }
    } catch {
      setError("Could not send that. Please try again.");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5">
        <p className="text-[15px] font-semibold text-ink">Thank you, that has reached us.</p>
        <p className="mt-1.5 text-[14px] text-ink-body leading-relaxed">
          Every gig is read before it goes on the board, so it will not appear straight
          away. If anything needs clarifying we will reply to the email you gave.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      {/* Honeypot: a real person never fills a hidden field. */}
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div>
        <label className={LABEL} htmlFor="gig-title">
          What is the assignment?
        </label>
        <input
          id="gig-title"
          name="title"
          required
          maxLength={200}
          className={FIELD}
          placeholder="One-time LCA study for industrial equipment"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5">
        <div>
          <label className={LABEL} htmlFor="gig-location">
            Location
          </label>
          <input
            id="gig-location"
            name="location"
            maxLength={120}
            className={FIELD}
            placeholder="Chennai, or Remote"
          />
        </div>
        <div>
          <label className={LABEL} htmlFor="gig-budget">
            Budget or fee <span className="font-normal text-ink-faint">(optional)</span>
          </label>
          <input
            id="gig-budget"
            name="budget"
            maxLength={60}
            className={FIELD}
            placeholder="Open to a quotation"
          />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="gig-brief">
          A short brief
        </label>
        <textarea
          id="gig-brief"
          name="brief"
          rows={3}
          maxLength={1500}
          className={`${FIELD} resize-y`}
          placeholder="Scope, the sector, roughly when it needs doing, and how you would like to be contacted."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5">
        <div>
          <label className={LABEL} htmlFor="gig-name">
            Your name
          </label>
          <input id="gig-name" name="name" required maxLength={120} className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="gig-email">
            Your email
          </label>
          <input
            id="gig-email"
            name="email"
            type="email"
            required
            maxLength={254}
            className={FIELD}
          />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="gig-org">
          Organisation <span className="font-normal text-ink-faint">(optional)</span>
        </label>
        <input id="gig-org" name="organisation" maxLength={200} className={FIELD} />
      </div>

      {error && <p className="text-[13.5px] text-[#B3261E] m-0">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={state === "sending"}
          className="pressable rounded-xl bg-brand-600 px-5 py-3 text-[14.5px] font-semibold text-white disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Send the gig"}
        </button>
        <span className="text-[12.5px] text-ink-muted">
          Free to post. Read before it goes up.
        </span>
      </div>
    </form>
  );
}
