import { getBriefFeed } from "@/lib/brief/feed";
import BriefFeed from "@/components/brief/BriefFeed";

// News is dynamic (Supabase); always render the latest. Cron revalidates too.
export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const items = await getBriefFeed();

  return (
    <div className="min-h-[100dvh] bg-[#0A1524] text-ondark lg:flex lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-10">
      {/* Desktop: context panel */}
      <aside className="hidden lg:flex flex-col w-[300px] gap-5">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-brand-600 text-white text-[18px] font-bold">S</span>
          <span className="font-display text-[22px] font-bold text-ondark">Saaksh Brief</span>
        </div>
        <h1 className="font-display text-[1.9rem] leading-[1.15] font-bold text-ondark tracking-[-0.01em]">
          The 30-second read on Indian ESG &amp; BRSR.
        </h1>
        <p className="text-[14.5px] leading-relaxed text-ondark-muted">
          SEBI, BRSR Core, CBAM, CCTS and the global frameworks, in swipeable cards.
          Fresh news is AI-summarised and always links the source; regulation and
          guides are hand-cited.
        </p>
        <ul className="space-y-2 text-[14px] text-ondark-muted">
          {["Swipe through what changed, in a few minutes", "Tap Why it matters for the consultant's-eye take", "No signup, no paywall, nothing stored"].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <svg className="mt-1 flex-shrink-0 text-brand-400" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* The phone column (full-screen on mobile, framed on desktop) */}
      <BriefFeed items={items} />

      {/* Desktop: open-on-phone panel */}
      <aside className="hidden lg:flex flex-col w-[240px] gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
        <p className="text-[13px] font-semibold text-ondark">Open it on your phone</p>
        <div className="mx-auto my-1 grid place-items-center h-28 w-28 rounded-xl bg-white/5 border border-white/10 text-ondark-faint text-[11px] leading-tight px-2">
          Visit<br /><span className="text-ondark font-semibold">saaksh.co/brief</span><br />on mobile
        </div>
        <p className="text-[12.5px] text-ondark-muted leading-relaxed">
          Then use <span className="text-ondark">Add to Home Screen</span> to keep the Brief one tap away.
        </p>
      </aside>
    </div>
  );
}
