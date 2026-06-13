"use client";

import { useState } from "react";
import { REQUEST_FIELDS } from "@/lib/datarequest/fields";
import type { FieldCategory } from "@/lib/datarequest/types";

const ORDER: FieldCategory[] = ["Environment", "Social", "Governance"];
const DOT: Record<FieldCategory, string> = {
  Environment: "bg-emerald-500", Social: "bg-blue-500", Governance: "bg-violet-500",
};

// "+ Add a data owner" button that reveals the form. Click → fill → Send →
// the page reloads (server action) with the new owner in the list and this
// panel collapsed again, ready for the next.
export default function AddOwnerPanel({
  action, error,
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: boolean;
}) {
  const [open, setOpen] = useState(!!error); // re-open if the last submit errored

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13.5px] font-semibold
          text-stone-600 bg-white border border-dashed border-stone-300 hover:border-brand-400 hover:text-brand-700
          hover:bg-brand-50/40 transition-colors pressable"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Add a data owner
      </button>
    );
  }

  const grouped = ORDER.map((cat) => ({ cat, fields: REQUEST_FIELDS.filter((f) => f.category === cat) }));

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-stone-800">Add a data owner</p>
        <button onClick={() => setOpen(false)} className="text-[12.5px] text-stone-400 hover:text-stone-600 transition-colors">Cancel</button>
      </div>
      <p className="text-[12px] text-stone-500 mt-0.5 mb-4">
        Assign the fields this person owns — e.g. the energy manager for electricity &amp; fuel, EHS for water.
        Each owner gets their own request; add them one at a time.
      </p>

      {error && (
        <p className="mb-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
          Add an email and select at least one field.
        </p>
      )}

      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <input name="name" placeholder="Name (optional)"
            className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
          <input name="email" type="email" required placeholder="Email *"
            className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
        </div>

        <div className="space-y-4">
          {grouped.map(({ cat, fields }) => (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-1.5 h-1.5 rounded-full ${DOT[cat]}`} />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-stone-400">{cat}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-1.5">
                {fields.map((f) => (
                  <label key={f.id} className="flex items-start gap-2.5 px-3 py-2 rounded-lg border border-stone-200 hover:border-stone-300 hover:bg-stone-50 cursor-pointer transition-colors">
                    <input type="checkbox" name="fields" value={f.id} className="mt-0.5 accent-[#00745a]" />
                    <span className="text-[12.5px] text-stone-700 leading-snug">
                      {f.label}
                      {f.kind === "activity" && <span className="ml-1.5 text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-full align-middle">activity</span>}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" className="inline-flex items-center gap-2 bg-[#111] text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-black transition-colors">
          Send request →
        </button>
      </form>
    </div>
  );
}
