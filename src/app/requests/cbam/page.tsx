import { requireConsultant } from "@/lib/datarequest/guard";
import CbamCalculator from "@/components/cbam/CbamCalculator";
import cbamData from "@/data/cbam_readiness.json";

// Pro tool — gated by the /requests middleware; requireConsultant() is
// defence-in-depth (redirects to /login if the passcode cookie is missing).
export const dynamic = "force-dynamic";

const COVERED = (cbamData.covered_goods as string[]) ?? [];

export default function CbamPage() {
  requireConsultant();

  return (
    <div className="bg-page min-h-full">
      <div className="max-w-[920px] mx-auto px-1">
        <header className="pt-1">
          <h1 className="font-display text-[26px] font-bold text-ink tracking-tight">
            CBAM — embedded emissions (screening)
          </h1>
          <p className="text-[14.5px] text-ink-body mt-1.5 max-w-[68ch] leading-relaxed">
            A quick screening estimate of the embedded emissions of CBAM-covered goods, using the EU&apos;s
            published default values. It helps you ballpark a client&apos;s EU-border exposure before the heavier,
            installation-verified declaration. Fully on your device — nothing is stored.
          </p>
        </header>

        {/* Who's in scope — derived from cbam_readiness.json */}
        <div className="mt-4 rounded-xl bg-white border border-line shadow-[0_1px_2px_rgba(16,33,26,0.05)] px-5 py-4">
          <p className="text-[12.5px] font-bold uppercase tracking-[0.1em] text-ink-muted">Who&apos;s in scope</p>
          <p className="text-[13.5px] text-ink-body mt-1.5 leading-relaxed">
            CBAM applies when a producer of a covered good exports it into the EU. The six covered goods are:
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {COVERED.map((g) => (
              <span key={g} className="text-[13px] font-medium text-brand-700 bg-tint border border-brand-700/15 px-2.5 py-1 rounded-full">
                {g}
              </span>
            ))}
          </div>
          <p className="text-[13px] text-ink-body mt-3 leading-relaxed">
            {cbamData._meta?.status_note}
          </p>
        </div>

        <div className="mt-5 pb-8">
          <CbamCalculator />
        </div>
      </div>
    </div>
  );
}
