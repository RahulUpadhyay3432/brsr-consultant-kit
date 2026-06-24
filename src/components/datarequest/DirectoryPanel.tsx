"use client";

// The client's saved-contacts roster. Save the people you collect data from once
// (name, email, role) — by hand or by pasting a list — then import them with one
// tap when adding a data owner. Owners you add are auto-captured here too.

import { useState } from "react";
import type { CompanyContact } from "@/lib/datarequest/types";

type Action = (formData: FormData) => void | Promise<void>;

export default function DirectoryPanel({
  contacts, addAction, deleteAction,
}: {
  contacts: CompanyContact[];
  addAction: Action;
  deleteAction: Action;
}) {
  const [showPaste, setShowPaste] = useState(false);

  const inputCls =
    "h-9 px-3 text-[13px] text-stone-800 bg-white border border-stone-200 rounded-lg " +
    "focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors";

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] font-semibold text-stone-800">Saved contacts</p>
        {contacts.length > 0 && (
          <span className="text-[12px] text-stone-500 tabular-nums">{contacts.length}</span>
        )}
      </div>
      <p className="text-[12px] text-stone-500 mt-0.5 mb-4">
        Save the client&apos;s people once, then add a data owner with one tap. Anyone you add as an owner is saved here automatically.
      </p>

      {/* Roster */}
      {contacts.length === 0 ? (
        <p className="text-[12.5px] text-stone-400 bg-stone-50 border border-stone-100 rounded-lg px-3.5 py-3 mb-4">
          No saved contacts yet. Add a person below, or paste a list you got from the client.
        </p>
      ) : (
        <ul className="mb-4 divide-y divide-stone-100 rounded-lg border border-stone-200">
          {contacts.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-3.5 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-stone-800 truncate">
                  {c.name || c.email}
                  {c.role && (
                    <span className="ml-2 align-middle text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 px-1.5 py-0.5 rounded-full">{c.role}</span>
                  )}
                </p>
                {c.name && <p className="text-[11.5px] text-stone-400 truncate">{c.email}</p>}
              </div>
              <form action={deleteAction}>
                <input type="hidden" name="contactId" value={c.id} />
                <button type="submit" title="Remove from saved contacts"
                  className="text-stone-300 hover:text-rose-500 transition-colors pressable">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                  </svg>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      {/* Add one */}
      <form action={addAction} className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
        <input name="name" placeholder="Name (optional)" className={inputCls} />
        <input name="email" type="email" required placeholder="Email *" className={inputCls} />
        <input name="role" placeholder="Role (optional)" className={`${inputCls} sm:w-[120px]`} />
        <button type="submit"
          className="sm:col-span-3 justify-self-start inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-3.5 py-2 rounded-lg transition-colors pressable">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          Add contact
        </button>
      </form>

      {/* Paste a list */}
      <div className="mt-3 pt-3 border-t border-stone-100">
        <button type="button" onClick={() => setShowPaste((v) => !v)}
          className="flex items-center gap-1.5 text-[12.5px] font-medium text-stone-500 hover:text-stone-700 transition-colors">
          <svg className={`w-3.5 h-3.5 transition-transform ${showPaste ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          Paste a list
        </button>
        {showPaste && (
          <form action={addAction} className="mt-2.5 space-y-2">
            <textarea name="paste" rows={4}
              placeholder={"One contact per line, e.g.\nPriya Sharma, priya@acme.com, HR\nRohan Mehta\trohan@acme.com\tFleet"}
              className="w-full px-3 py-2.5 text-[12.5px] text-stone-800 bg-white border border-stone-200 rounded-lg font-mono leading-relaxed focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors" />
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Paste from the client&apos;s email/chat, or copy cells straight from Excel/Sheets (name, email, role per line — the email is all that&apos;s required).
            </p>
            <button type="submit"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-forest hover:bg-forest-light px-3.5 py-2 rounded-lg transition-colors pressable">
              Add list
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
