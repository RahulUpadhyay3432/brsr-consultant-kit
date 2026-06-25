"use client";

// Downloads the assurance-readiness ledger as an on-device CSV. The rows are built
// on the server (it has the owner/evidence/factor data); this just triggers the
// browser download via the shared, formula-safe export helper. Nothing is uploaded.
import { downloadCsv } from "@/lib/export";

export default function AssurancePackButton({ rows, filename }: { rows: string[][]; filename: string }) {
  return (
    <button
      onClick={() => downloadCsv(filename, rows)}
      className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 bg-brand-50
        border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable whitespace-nowrap"
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
      </svg>
      Export assurance ledger (CSV)
    </button>
  );
}
