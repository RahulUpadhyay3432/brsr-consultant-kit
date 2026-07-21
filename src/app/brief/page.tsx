import QRCode from "qrcode";
import { getBriefFeed } from "@/lib/brief/feed";
import BriefFeed from "@/components/brief/BriefFeed";

// News is dynamic (Supabase); always render the latest. Cron revalidates too.
export const dynamic = "force-dynamic";

export default async function BriefPage() {
  const items = await getBriefFeed();
  const qr = await QRCode.toDataURL("https://saaksh.co/brief", {
    width: 240,
    margin: 1,
    color: { dark: "#0F1E33", light: "#FFFFFF" },
  });

  return (
    <div className="min-h-[100dvh] bg-band text-ink lg:flex lg:items-center lg:justify-center lg:gap-8 lg:px-8 lg:py-10">
      {/* Desktop: context panel */}
      <aside className="hidden lg:flex flex-col w-[300px] gap-5">
        <div className="flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-lg bg-brand-600 text-white text-[18px] font-bold">S</span>
          <span className="font-display text-[22px] font-bold text-ink">Saaksh Brief</span>
        </div>
        <h1 className="font-editorial text-[1.9rem] leading-[1.15] font-semibold text-ink tracking-[-0.02em]">
          The 30-second read on Indian ESG &amp; BRSR.
        </h1>
        <p className="text-[14.5px] leading-relaxed text-ink-muted">
          SEBI, BRSR Core, CBAM, CCTS and the global frameworks, in swipeable cards.
          Fresh news is AI-summarised and always links the source; regulation and
          guides are hand-cited.
        </p>
        <ul className="space-y-2 text-[14px] text-ink-body">
          {["Swipe through what changed, in a few minutes", "Tap Why it matters for the consultant's-eye take", "No signup, no paywall, nothing stored"].map((t) => (
            <li key={t} className="flex items-start gap-2.5">
              <svg className="mt-1 flex-shrink-0 text-brand-600" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* The phone (full-screen on mobile; a real device bezel on desktop) */}
      <div className="lg:flex-shrink-0 lg:p-[11px] lg:rounded-[2.7rem] lg:bg-gradient-to-b lg:from-[#2a2a2f] lg:to-[#141416] lg:border lg:border-black/60 lg:shadow-[0_36px_100px_rgba(15,30,51,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <BriefFeed items={items} />
      </div>

      {/* Desktop: open-on-phone panel with a scannable QR */}
      <aside className="hidden lg:flex flex-col w-[240px] gap-3 rounded-2xl border border-line bg-white shadow-elev-1 p-6 text-center">
        <p className="text-[13px] font-semibold text-ink">Open it on your phone</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt="Scan to open saaksh.co/brief" width={132} height={132} className="mx-auto my-1 rounded-lg border border-line" />
        <p className="text-[12.5px] text-ink-muted leading-relaxed">
          Scan it, then use <span className="text-ink font-semibold">Add to Home Screen</span> to keep the Brief one tap away.
        </p>
      </aside>
    </div>
  );
}
