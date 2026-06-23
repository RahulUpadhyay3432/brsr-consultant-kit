"use client";

import { useMemo, useState } from "react";
import type { RequestField } from "@/lib/datarequest/types";
import { SECTION_LABELS, PRINCIPLE_LABELS, PRINCIPLE_ORDER } from "@/lib/datarequest/brsr-meta";

// A group in the picker: Section A, Section B, or one Section-C principle.
interface Group {
  key: string;            // "A" | "B" | "P1".."P9"
  title: string;          // display heading
  sub?: string;           // e.g. principle short name
  fields: RequestField[];
}

function buildGroups(fields: RequestField[]): Group[] {
  const groups: Group[] = [];
  const a = fields.filter((f) => f.section === "A");
  const b = fields.filter((f) => f.section === "B");
  if (a.length) groups.push({ key: "A", title: SECTION_LABELS.A, fields: a });
  if (b.length) groups.push({ key: "B", title: SECTION_LABELS.B, fields: b });
  for (const p of PRINCIPLE_ORDER) {
    const pf = fields.filter((f) => f.section === "C" && f.principle === p);
    if (pf.length) groups.push({ key: p, title: p, sub: PRINCIPLE_LABELS[p], fields: pf });
  }
  return groups;
}

// "+ Add a data owner" → reveals the form. Pick fields from the full BRSR format
// (Section A / B / C by principle), search by code or label, then Send. The page
// reloads (server action) with the new owner listed and this panel collapsed.
export default function AddOwnerPanel({
  action, error, fields,
}: {
  action: (formData: FormData) => void | Promise<void>;
  error?: boolean;
  fields: RequestField[];
}) {
  const [open, setOpen] = useState(!!error);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const allGroups = useMemo(() => buildGroups(fields), [fields]);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    if (!q) return allGroups;
    return allGroups
      .map((g) => ({
        ...g,
        fields: g.fields.filter(
          (f) => f.label.toLowerCase().includes(q) || f.id.toLowerCase().includes(q)
        ),
      }))
      .filter((g) => g.fields.length > 0);
  }, [allGroups, q]);

  function toggleField(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleGroup(key: string) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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

  // A group is expanded when the user opens it, or whenever a search is active.
  const isOpen = (key: string) => !!q || openGroups.has(key);

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-stone-800">Add a data owner</p>
        <button onClick={() => setOpen(false)} className="text-[12.5px] text-stone-400 hover:text-stone-600 transition-colors">Cancel</button>
      </div>
      <p className="text-[12px] text-stone-500 mt-0.5 mb-4">
        Assign the BRSR fields this person owns: the energy manager for electricity &amp; fuel, EHS for water, HR for
        headcount. Each field carries its Section and indicator code. Add owners one at a time.
      </p>

      {error && (
        <p className="mb-4 text-[13px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5">
          Add an email and select at least one field.
        </p>
      )}

      <form action={action} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input name="name" placeholder="Name (optional)"
            className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
          <input name="email" type="email" required placeholder="Email *"
            className="h-10 px-3 text-[13.5px] text-stone-800 bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
        </div>

        {/* Search + selected count */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="7" /><path strokeLinecap="round" d="M21 21l-4.3-4.3" />
            </svg>
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${fields.length} BRSR fields by code or label…`}
              className="h-9 w-full pl-9 pr-3 text-[13px] text-stone-800 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors"
            />
          </div>
          <span className="text-[12px] text-stone-500 whitespace-nowrap tabular-nums">
            {selected.size} selected
          </span>
        </div>

        {/* Grouped, collapsible field list */}
        <div className="max-h-[420px] overflow-y-auto rounded-lg border border-stone-200 divide-y divide-stone-100">
          {groups.length === 0 && (
            <p className="px-4 py-6 text-center text-[13px] text-stone-400">No fields match “{query}”.</p>
          )}
          {groups.map((g) => {
            const sel = g.fields.filter((f) => selected.has(f.id)).length;
            return (
              <div key={g.key}>
                <button
                  type="button"
                  onClick={() => toggleGroup(g.key)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left hover:bg-stone-50 transition-colors"
                >
                  {g.sub
                    ? <span className="text-[11px] font-bold font-mono text-stone-500 w-7 shrink-0">{g.title}</span>
                    : null}
                  <span className="flex-1 text-[12.5px] font-semibold text-stone-700">
                    {g.sub ?? g.title}
                  </span>
                  {sel > 0 && (
                    <span className="text-[10.5px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full tabular-nums">{sel}</span>
                  )}
                  <span className="text-[11px] text-stone-400 tabular-nums">{g.fields.length}</span>
                  <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen(g.key) ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {isOpen(g.key) && (
                  <div className="px-2 pb-2 space-y-0.5">
                    {g.fields.map((f) => {
                      const checked = selected.has(f.id);
                      return (
                        <label
                          key={f.id}
                          className={`flex items-start gap-2.5 px-2.5 py-2 rounded-lg cursor-pointer transition-colors ${checked ? "bg-brand-50/60" : "hover:bg-stone-50"}`}
                        >
                          <input
                            type="checkbox" name="fields" value={f.id}
                            checked={checked} onChange={() => toggleField(f.id)}
                            className="mt-0.5 accent-[#0E4A36]"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10.5px] font-mono font-semibold text-stone-500">{f.id}</span>
                              {f.indicatorType && (
                                <span className={`text-[9px] font-semibold px-1 py-0.5 rounded-full border ${f.indicatorType === "essential" ? "text-stone-600 bg-stone-100 border-stone-200" : "text-amber-700 bg-amber-50 border-amber-100"}`}>
                                  {f.indicatorType === "essential" ? "Essential" : "Leadership"}
                                </span>
                              )}
                              {f.kind === "activity" && (
                                <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded-full">activity · auto-calc</span>
                              )}
                            </span>
                            <span className="block text-[12.5px] text-stone-700 leading-snug mt-0.5">
                              {f.label}{f.unit && <span className="text-stone-400"> · {f.unit}</span>}
                            </span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button type="submit" className="inline-flex items-center gap-2 bg-forest text-white text-[14px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable disabled:opacity-50" disabled={selected.size === 0}>
          Send request →
        </button>
      </form>
    </div>
  );
}
