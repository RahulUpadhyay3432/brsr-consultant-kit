import { SiteHeader } from "@/components/SiteHeader";
import { GlowOrb, Contours } from "@/components/brand/Decor";

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
      <div className="relative overflow-hidden bg-forest glow-dark">
        <GlowOrb tone="brand" className="w-[480px] h-[480px] -top-44 left-1/3" />
        <Contours className="w-[380px] h-[380px] -right-16 -top-10 text-brand-400" stroke="#4D97F0" opacity={0.12} />
        <div className="relative mx-auto w-full px-5 sm:px-8 pt-14 pb-12" style={{ maxWidth }}>
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-brand-400 mb-3.5">
            {eyebrow}
          </p>
          <h1 className="font-editorial font-semibold text-white text-[2.2rem] sm:text-[2.8rem] leading-[1.06] tracking-[-0.02em]" style={{ textWrap: "balance" }}>
            {title}
          </h1>
          <p className="text-[16px] text-ondark-muted leading-relaxed mt-4 max-w-[660px]">
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
