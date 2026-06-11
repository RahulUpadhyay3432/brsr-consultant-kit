"use client";

import { useState } from "react";
import type {
  IntakeFormData,
  IndustryType,
  SectorType,
  CompanySize,
  ReportingMaturity,
  ExportMarket,
  ExistingFiling,
} from "@/lib/types";
import {
  INDUSTRY_LABELS,
  SECTOR_LABELS,
  MATURITY_LABELS,
  FILING_LABELS,
  inferDefaultSector,
} from "@/lib/types";
import CompanyAutocomplete from "./CompanyAutocomplete";

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
  isLoading: boolean;
  // When returning from a generated report to edit, the prior answers are
  // passed back in so the consultant doesn't have to re-enter everything.
  initialData?: IntakeFormData;
}

const EXPORT_MARKETS: ExportMarket[] = ["EU", "USA", "UK", "Middle East", "Southeast Asia", "None"];

// Company-size options as cards (title + one-line context) for a 2×2 grid.
const SIZE_OPTIONS: { key: CompanySize; title: string; sub: string }[] = [
  { key: "listed_top_1000",             title: "Listed · Top 1000",         sub: "By market cap — BRSR mandatory" },
  { key: "listed_outside_1000",         title: "Listed · Outside top 1000", sub: "Voluntary / phased-in" },
  { key: "unlisted_supplier",           title: "Unlisted supplier",         sub: "In a listed company's value chain" },
  { key: "unlisted_not_in_value_chain", title: "Unlisted",                  sub: "Not in a listed value chain" },
];

export default function IntakeForm({ onSubmit, isLoading, initialData }: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>(initialData ?? {
    companyName: "",
    industry: "textile_and_apparel",
    sector: inferDefaultSector("textile_and_apparel"),
    companySize: "listed_top_1000",
    reportingMaturity: "first_time",
    exportMarkets: [],
    existingFilings: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleExportMarket = (market: ExportMarket) => {
    setFormData((prev) => {
      if (market === "None") {
        return { ...prev, exportMarkets: prev.exportMarkets.includes("None") ? [] : ["None"] };
      }
      const filtered = prev.exportMarkets.filter((m) => m !== "None");
      return {
        ...prev,
        exportMarkets: filtered.includes(market)
          ? filtered.filter((m) => m !== market)
          : [...filtered, market],
      };
    });
  };

  const toggleFiling = (filing: ExistingFiling) => {
    setFormData((prev) => {
      if (filing === "none") {
        return { ...prev, existingFilings: prev.existingFilings.includes("none") ? [] : ["none"] };
      }
      const filtered = prev.existingFilings.filter((f) => f !== "none");
      return {
        ...prev,
        existingFilings: filtered.includes(filing)
          ? filtered.filter((f) => f !== filing)
          : [...filtered, filing],
      };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Company Name ─────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Client Company Name
        </label>
        <CompanyAutocomplete
          value={formData.companyName}
          onChange={(name) => setFormData((p) => ({ ...p, companyName: name }))}
          onPick={(c) => setFormData((p) => ({
            ...p,
            companyName: c.name,
            industry: c.industry,
            sector: c.sector,
            // Curated companies are large listed BRSR filers — default to Top 1000
            // (overridable below).
            companySize: "listed_top_1000",
          }))}
        />
        <p className="mt-1.5 text-xs text-stone-500">
          Pick a listed company to auto-fill its industry, business type &amp; listing status — or just type any name.
        </p>
      </div>

      {/* ── Industry ─────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Industry <span className="text-rose-400">*</span>
        </label>
        <select
          value={formData.industry}
          onChange={(e) => {
            const industry = e.target.value as IndustryType;
            // Smart-default the sector toggle from the chosen industry; the user
            // can still override it below.
            setFormData(p => ({ ...p, industry, sector: inferDefaultSector(industry) }));
          }}
          className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-900
            focus:outline-none focus:ring-2 focus:ring-brand-500/60 focus:border-brand-500
            transition-[border-color,box-shadow] duration-150 appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2378716c' viewBox='0 0 16 16'%3E%3Cpath d='M4 6l4 4 4-4'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 12px center",
          }}
        >
          {Object.entries(INDUSTRY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      {/* ── Business Type (sector) ───────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Business Type <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.entries(SECTOR_LABELS) as [SectorType, string][]).map(([key, label]) => (
            <label
              key={key}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer pressable text-center ${
                formData.sector === key
                  ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="sector"
                value={key}
                checked={formData.sector === key}
                onChange={(e) => setFormData((p) => ({ ...p, sector: e.target.value as SectorType }))}
                className="sr-only"
              />
              <span className="text-sm text-stone-700">{label}</span>
            </label>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Service-sector clients skip manufacturing-only disclosures (air emissions, effluent
          discharge, product-reclaim, EIAs) — we mark those <span className="font-medium text-stone-600">Not applicable</span>.
          Pre-set from your industry; change it if needed.
        </p>
      </div>

      {/* ── Company Size & Listing — 2×2 card grid ───────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Company Size & Listing Status <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SIZE_OPTIONS.map((opt) => {
            const selected = formData.companySize === opt.key;
            return (
              <label
                key={opt.key}
                className={`relative flex items-start gap-2.5 px-3.5 py-3 rounded-lg border cursor-pointer pressable transition-colors ${
                  selected
                    ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                    : "border-stone-200 bg-white hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="companySize"
                  value={opt.key}
                  checked={selected}
                  onChange={(e) => setFormData((p) => ({ ...p, companySize: e.target.value as CompanySize }))}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selected ? "border-brand-600" : "border-stone-300"
                }`}>
                  {selected && <div className="w-2 h-2 rounded-full bg-brand-600" />}
                </div>
                <div className="min-w-0">
                  <span className="block text-[13px] font-medium text-stone-800 leading-snug">{opt.title}</span>
                  <span className="block text-[11px] text-stone-400 mt-0.5 leading-snug">{opt.sub}</span>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* ── Reporting Maturity ────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Reporting Maturity <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {Object.entries(MATURITY_LABELS).map(([key, label]) => (
            <label
              key={key}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border cursor-pointer pressable text-center ${
                formData.reportingMaturity === key
                  ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="maturity"
                value={key}
                checked={formData.reportingMaturity === key}
                onChange={(e) => setFormData((p) => ({ ...p, reportingMaturity: e.target.value as ReportingMaturity }))}
                className="sr-only"
              />
              <span className="text-sm text-stone-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Export Markets ────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Export Markets
        </label>
        <div className="flex flex-wrap gap-2">
          {EXPORT_MARKETS.map((market) => (
            <button
              key={market}
              type="button"
              onClick={() => toggleExportMarket(market)}
              className={`px-4 py-2 rounded-full border text-sm chip-spring ${
                formData.exportMarkets.includes(market)
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              {market}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Affects materiality scoring for CBAM, CSDDD, and trade-linked ESG requirements
        </p>
      </div>

      {/* ── Existing Compliance Filings ───────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Existing Compliance Filings
        </label>
        <p className="text-xs text-brand-800 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2 mb-3">
          <span className="font-semibold">Key field.</span> Every filing you select shows which BRSR fields are already documented in those reports — so you don't have to collect that data from scratch.
        </p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(FILING_LABELS) as [ExistingFiling, string][]).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleFiling(key)}
              className={`px-4 py-2 rounded-full border text-sm chip-spring ${
                formData.existingFilings.includes(key)
                  ? "border-brand-500 bg-brand-50 text-brand-700 ring-1 ring-brand-500/20"
                  : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          Select all filings your client currently files — the tool will show what&apos;s already tracked vs what&apos;s new
        </p>
      </div>

      {/* ── Submit ────────────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-forest text-white font-medium rounded-full hover:bg-forest-light
          pressable disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
          flex items-center justify-center gap-3"
      >
        {isLoading ? (
          <>
            <svg aria-hidden="true" className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating Report...
          </>
        ) : (
          <>
            Generate BRSR Readiness Report
            <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
