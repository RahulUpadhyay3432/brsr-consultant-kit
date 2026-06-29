// "Upload last year's report" card, client-side, privacy-safe. Pure UI; all
// extraction/detection state lives in useChecklistState.
import type { RefObject } from "react";

export type UploadStatus = "idle" | "processing" | "done" | "error";

interface UploadCardProps {
  fileInputRef: RefObject<HTMLInputElement>;
  uploadStatus: UploadStatus;
  uploadInfo: { fileName: string; pageCount: number } | null;
  uploadError: string;
  detectedInReport: number;
  showOnlyDetected: boolean;
  onFile: (file: File) => void;
  onToggleShowOnlyDetected: () => void;
  onMarkAllDetected: () => void;
  onClear: () => void;
}

export default function UploadCard({
  fileInputRef, uploadStatus, uploadInfo, uploadError, detectedInReport,
  showOnlyDetected, onFile, onToggleShowOnlyDetected, onMarkAllDetected, onClear,
}: UploadCardProps) {
  return (
    <div className="bg-white border border-brand-200 rounded-xl p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
      />

      {uploadStatus !== "done" ? (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-brand-600" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M7.5 10V2.5M5 5l2.5-2.5L10 5" />
              <path d="M2.5 9.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-stone-900">
              Save time, upload last year's BRSR report
            </h3>
            <p className="text-[13.5px] text-stone-600 mt-1 leading-relaxed">
              We'll flag what's already documented, so you only chase what's new.
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium ml-1">
                <svg className="w-3 h-3" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M7.5 1.5l5 2v3.5c0 3-2.2 5-5 6.5-2.8-1.5-5-3.5-5-6.5V3.5z" />
                </svg>
                Scanned in your browser, the file never leaves your device.
              </span>
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === "processing"}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                  bg-forest text-white hover:bg-forest-light pressable transition-colors
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {uploadStatus === "processing" ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Reading PDF…
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                      <path d="M7.5 10V2.5M5 5l2.5-2.5L10 5M2.5 9.5v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Choose PDF
                  </>
                )}
              </button>
              <span className="text-[12px] text-stone-500">Text-based PDF · processed locally · nothing uploaded</span>
            </div>
            {uploadStatus === "error" && (
              <p className="mt-2 text-xs text-rose-600 leading-relaxed">{uploadError}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="check-path" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-[15px] font-semibold text-stone-900">
              {detectedInReport > 0
                ? <>Found <span className="text-emerald-700">{detectedInReport}</span> disclosure{detectedInReport === 1 ? "" : "s"} already documented in last year's report</>
                : <>No recurring disclosures detected automatically</>}
            </h3>
            <p className="text-[13px] text-stone-600 mt-1 leading-relaxed">
              Scanned <span className="font-medium text-stone-600">{uploadInfo?.fileName}</span> ({uploadInfo?.pageCount} pages) locally.
              {detectedInReport > 0
                ? <> These fields show a <span className="font-medium text-brand-700">Last year</span> tag, expand one to see the matched text, confirm it's still current, then mark it collected.</>
                : <> The PDF may be image-based, or use different wording. You can still work through the checklist normally.</>}
            </p>
            <div className="mt-2.5 flex items-center gap-2 flex-wrap">
              {detectedInReport > 0 && (
                <>
                  <button
                    type="button"
                    onClick={onToggleShowOnlyDetected}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border pressable transition-colors ${
                      showOnlyDetected
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-brand-50 text-brand-700 border-brand-200 hover:bg-brand-100"
                    }`}
                  >
                    {showOnlyDetected ? "Showing found only" : "Show found only"}
                    <span className={showOnlyDetected ? "text-white/80" : "text-brand-500"}>({detectedInReport})</span>
                  </button>
                  <button
                    type="button"
                    onClick={onMarkAllDetected}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 pressable transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Mark all {detectedInReport} as collected
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium
                  text-stone-500 hover:text-stone-700 hover:bg-stone-100 pressable transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
