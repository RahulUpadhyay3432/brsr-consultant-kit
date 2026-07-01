import { SiteHeader } from "@/components/SiteHeader";

function CheckDot() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 text-[#5FD0A6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/**
 * Shared navy hero for the /tools/* pages. Renders the SiteHeader + a navy band
 * with an eyebrow, the outcome-led H1, a readable subtitle (#C4D0E0 on #0F1E33,
 * AA), and an optional "what you get" benefits strip so the consultant sees the
 * payoff before the tool. maxWidth is inline so callers can align the body to it.
 */
export function ToolHero({
  eyebrow, title, subtitle, benefits, whoFor, maxWidth = 1120, active = "tools",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  benefits?: string[];
  whoFor?: string;
  maxWidth?: number;
  active?: string;
}) {
  return (
    <>
      <SiteHeader active={active} />
      <div className="bg-[#0F1E33]">
        <div className="mx-auto w-full px-5 sm:px-8 pt-11 pb-10" style={{ maxWidth }}>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6AB4F5] mb-3">
            {eyebrow}
          </p>
          <h1 className="font-display font-bold text-[2rem] sm:text-[2.55rem] text-white leading-[1.08] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            {title}
          </h1>
          <p className="text-[15.5px] text-[#C4D0E0] leading-relaxed mt-3.5 max-w-[660px]">
            {subtitle}
          </p>
          {benefits && benefits.length > 0 && (
            <ul className="mt-6 flex flex-col sm:flex-row sm:flex-wrap gap-x-7 gap-y-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[14px] text-[#DCE6F2] leading-snug max-w-[340px]">
                  <span className="mt-0.5"><CheckDot /></span>{b}
                </li>
              ))}
            </ul>
          )}
          {whoFor && (
            <p className="text-[12.5px] text-ondark-faint mt-5 leading-relaxed">{whoFor}</p>
          )}
        </div>
      </div>
    </>
  );
}
