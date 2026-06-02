"use client";

import { useState } from "react";
import type {
  IntakeFormData,
  IndustryType,
  CompanySize,
  ReportingMaturity,
  ExportMarket,
  ExistingFiling,
} from "@/lib/types";
import {
  INDUSTRY_LABELS,
  COMPANY_SIZE_LABELS,
  MATURITY_LABELS,
  FILING_LABELS,
} from "@/lib/types";

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
  isLoading: boolean;
}

const EXPORT_MARKETS: ExportMarket[] = ["EU", "USA", "UK", "Middle East", "Southeast Asia", "None"];

export default function IntakeForm({ onSubmit, isLoading }: IntakeFormProps) {
  const [formData, setFormData] = useState<IntakeFormData>({
    companyName: "",
    industry: "textile_and_apparel",
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
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
          placeholder="e.g., Acme Industries Ltd."
          className="w-full px-4 py-3 rounded-lg border border-stone-200 bg-white text-stone-900
            placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60
            focus:border-brand-500 transition-[border-color,box-shadow] duration-150"
        />
      </div>

      {/* ── Industry ─────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Industry <span className="text-rose-400">*</span>
        </label>
        <select
          value={formData.industry}
          onChange={(e) => setFormData(p => ({ ...p, industry: e.target.value as IndustryType }))}
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

      {/* ── Company Size ──────────────────────────────────────────────────── */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-3">
          Company Size & Listing Status <span className="text-rose-400">*</span>
        </label>
        <div className="space-y-2">
          {Object.entries(COMPANY_SIZE_LABELS).map(([key, label]) => (
            <label
              key={key}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer pressable ${
                formData.companySize === key
                  ? "border-brand-500 bg-brand-50/50 ring-1 ring-brand-500/20"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type="radio"
                name="companySize"
                value={key}
                checked={formData.companySize === key}
                onChange={(e) => setFormData((p) => ({ ...p, companySize: e.target.value as CompanySize }))}
                className="sr-only"
              />
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                formData.companySize === key ? "border-brand-600" : "border-stone-300"
              }`}>
                {formData.companySize === key && (
                  <div className="w-2 h-2 rounded-full bg-brand-600" />
                )}
              </div>
              <span className="text-sm text-stone-700">{label}</span>
            </label>
          ))}
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
