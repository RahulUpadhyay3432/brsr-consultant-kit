"use client";

// "Continue where you left off" banner. Shown when in-progress work is saved on
// this device (localStorage) but isn't currently loaded — e.g. the consultant
// closed the browser or restarted their laptop and came back. The work itself is
// never lost (it lives on the device); this just gives them the door back to it.

interface ResumeBannerProps {
  companyName: string; // may be "" — the client name is an optional field
  onResume: () => void;
  className?: string;
}

export default function ResumeBanner({ companyName, onResume, className = "" }: ResumeBannerProps) {
  const name = companyName.trim();
  return (
    <div
      className={`anim-up-sm flex flex-wrap items-center justify-between gap-3 rounded-xl
        border border-brand-200 bg-brand-50 px-4 py-3 ${className}`}
    >
      <div className="flex items-center gap-2.5 text-[13.5px] text-stone-700">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 flex-shrink-0" />
        <span>
          You have a saved report
          {name ? (
            <>
              {" "}for <strong className="font-semibold text-stone-900">{name}</strong>
            </>
          ) : null}{" "}
          on this device.
        </span>
      </div>
      <button
        onClick={onResume}
        className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3.5 py-1.5
          text-[12.5px] font-semibold text-white hover:bg-forest-light transition-colors pressable shadow-sm"
      >
        Continue where you left off
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
