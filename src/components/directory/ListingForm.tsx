"use client";

// "List yourself" form for the consultant directory. Mirrors PostGigForm: the
// submission is an inbox, not the directory, and the copy says so.
//
// Note what is NOT asked for: a phone number. The published profile carries only
// the link the consultant gives, so a public page never becomes a scrapable list
// of people's mobiles. Their email is collected to reply to them, never shown.

import { useState } from "react";
import { listConsultantAction } from "@/lib/datarequest/leads";
import { track } from "@/lib/mixpanel";

const FIELD =
  "w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-faint focus:border-brand-300";
const LABEL = "block text-[12.5px] font-semibold text-ink-body mb-1.5";
const OPT = <span className="font-normal text-ink-faint">(optional)</span>;

export function ListingForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "sending") return;
    setState("sending");
    setError("");
    try {
      const res = await listConsultantAction(new FormData(e.currentTarget));
      if (res.ok) {
        track("directory_listing_submitted");
        setState("done");
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
          Every listing is read before it goes up, so it will not appear straight away.
          We will reply to the email you gave if anything needs checking.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3.5">
      <input
        type="text"
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      <div className="grid sm:grid-cols-2 gap-3.5">
        <div>
          <label className={LABEL} htmlFor="d-name">Your name</label>
          <input id="d-name" name="name" required maxLength={120} className={FIELD} />
        </div>
        <div>
          <label className={LABEL} htmlFor="d-email">Your email</label>
          <input id="d-email" name="email" type="email" required maxLength={254} className={FIELD} />
          <p className="mt-1 text-[11.5px] text-ink-faint">Used to reach you. Never published.</p>
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="d-headline">One line on what you do</label>
        <input
          id="d-headline"
          name="headline"
          required
          maxLength={160}
          className={FIELD}
          placeholder="Independent BRSR and assurance-readiness consultant"
        />
      </div>

      <div>
        <label className={LABEL} htmlFor="d-expertise">What you take on</label>
        <input
          id="d-expertise"
          name="expertise"
          maxLength={240}
          className={FIELD}
          placeholder="BRSR, GHG accounting, LCA, CBAM, ISO 14001"
        />
        <p className="mt-1 text-[11.5px] text-ink-faint">Comma separated. These become the filters people search by.</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3.5">
        <div>
          <label className={LABEL} htmlFor="d-location">Where you are</label>
          <input id="d-location" name="location" maxLength={120} className={FIELD} placeholder="Bengaluru, or Remote" />
        </div>
        <div>
          <label className={LABEL} htmlFor="d-exp">Years in the field {OPT}</label>
          <input id="d-exp" name="experience" maxLength={60} className={FIELD} placeholder="8 years" />
        </div>
      </div>

      <div>
        <label className={LABEL} htmlFor="d-link">A link people can reach you through</label>
        <input
          id="d-link"
          name="link"
          maxLength={300}
          className={FIELD}
          placeholder="linkedin.com/in/yourname"
        />
        <p className="mt-1 text-[11.5px] text-ink-faint">
          This is the only contact detail shown on your profile, so use one you are happy to have public.
        </p>
      </div>

      <div>
        <label className={LABEL} htmlFor="d-about">A short note about your work {OPT}</label>
        <textarea
          id="d-about"
          name="about"
          rows={3}
          maxLength={1200}
          className={`${FIELD} resize-y`}
          placeholder="The sectors you know, the kind of engagement you like, anything that helps someone decide you are the right person to ask."
        />
      </div>

      {error && <p className="text-[13.5px] text-[#B3261E] m-0">{error}</p>}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={state === "sending"}
          className="pressable rounded-xl bg-brand-600 px-5 py-3 text-[14.5px] font-semibold text-white disabled:opacity-60"
        >
          {state === "sending" ? "Sending..." : "Add me to the directory"}
        </button>
        <span className="text-[12.5px] text-ink-muted">Free. Read before it goes up.</span>
      </div>
    </form>
  );
}
