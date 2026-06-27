"use client";

// Consultant profile (Pro). Your details + default rate card, saved on-device.
// Brands the proposal PDF and seeds the fee builder so nothing is re-typed.

import { useEffect, useState } from "react";
import { loadProfile, saveProfile, EMPTY_PROFILE, type ConsultantProfile } from "@/lib/datarequest/profile";

const inputCls =
  "w-full h-10 px-3 text-[15px] text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-colors";
const cardCls = "bg-white border border-line rounded-xl p-5 shadow-[0_1px_2px_rgba(16,33,26,0.05)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-ink-body mb-1">{label}</span>
      {children}
    </label>
  );
}

function RateField({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-1.5">
        <span className="text-[13.5px] text-ink-muted">₹</span>
        <input
          type="number"
          min="0"
          step="500"
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="flex-1 min-w-0 h-9 px-2.5 text-[14.5px] font-mono text-ink bg-white border border-line rounded-lg focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>
    </Field>
  );
}

export default function ProfilePanel() {
  const [p, setP] = useState<ConsultantProfile>(EMPTY_PROFILE);
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof ConsultantProfile>(k: K, v: ConsultantProfile[K]) => {
    setP((prev) => ({ ...prev, [k]: v }));
    setSaved(false);
  };

  // localStorage is client-only — hydrate after mount.
  useEffect(() => {
    setP(loadProfile());
  }, []);

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    saveProfile(p);
    setSaved(true);
  }

  return (
    <div className="max-w-[1100px] mx-auto">
      <h1 className="font-display text-[26px] text-ink tracking-tight">Your profile</h1>
      <p className="text-[14.5px] text-ink-body mt-1 max-w-[64ch] leading-relaxed">
        Your details and default rate card. Used to brand your client proposals and to pre-fill the fee
        builder, so you don&apos;t re-type them each time.{" "}
        <span className="font-semibold text-ink">Saved on this device only</span> — nothing is uploaded.
      </p>

      <form onSubmit={onSave} className="mt-6 space-y-5">
        {/* Identity */}
        <div className={`${cardCls} space-y-3.5`}>
          <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">You &amp; your firm</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Your name">
              <input className={inputCls} value={p.name} onChange={(e) => set("name", e.target.value)} placeholder="Priya Sharma" />
            </Field>
            <Field label="Firm / practice">
              <input className={inputCls} value={p.firm} onChange={(e) => set("firm", e.target.value)} placeholder="Sharma ESG Advisory" />
            </Field>
            <Field label="Email">
              <input type="email" className={inputCls} value={p.email} onChange={(e) => set("email", e.target.value)} placeholder="priya@example.com" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={p.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+91 98765 43210" />
            </Field>
            <Field label="Website (optional)">
              <input className={inputCls} value={p.website} onChange={(e) => set("website", e.target.value)} placeholder="example.com" />
            </Field>
          </div>
        </div>

        {/* Rate card */}
        <div className={`${cardCls} space-y-4`}>
          <div>
            <p className="text-[15.5px] font-bold text-ink font-display">Default rate card</p>
            <p className="text-[13.5px] text-ink-body leading-relaxed mt-0.5">
              Seeds the proposal &amp; fee builder. You can still tweak any number per proposal.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <RateField label="Base BRSR engagement" value={p.baseFee} onChange={(n) => set("baseFee", n)} />
            <RateField label="Per additional framework" value={p.perFramework} onChange={(n) => set("perFramework", n)} />
            <RateField label="Scope 3 inventory" value={p.scope3Fee} onChange={(n) => set("scope3Fee", n)} />
            <RateField label="Value-chain collection" value={p.valueChainFee} onChange={(n) => set("valueChainFee", n)} />
            <RateField label="Assurance support" value={p.assuranceFee} onChange={(n) => set("assuranceFee", n)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-forest text-white text-[15px] font-semibold px-5 py-2.5 rounded-lg hover:bg-forest-light transition-colors pressable focus:outline-none focus:ring-2 focus:ring-brand-400"
          >
            Save profile
          </button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-emerald-700">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
              Saved on this device
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
