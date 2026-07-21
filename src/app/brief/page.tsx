import Link from "next/link";
import QRCode from "qrcode";
import { getBriefFeed } from "@/lib/brief/feed";
import BriefFeed from "@/components/brief/BriefFeed";
import { SaakshMark } from "@/components/SaakshMark";
import { CATEGORY_BY_SLUG } from "@/lib/brief/types";

// News is dynamic (Supabase); always render the latest. Cron revalidates too.
export const dynamic = "force-dynamic";

// Icons for the left site-nav (so a direct visitor to /brief can reach the rest
// of Saaksh). Simple, inline, no dependency.
const icon = {
  home: <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />,
  tools: <><path d="M4 5h16v6H4z" /><path d="M4 15h10v4H4z" /></>,
  latest: <><path d="M4 11a9 9 0 019 9M4 4a16 16 0 0116 16" /><circle cx="5" cy="19" r="1.5" /></>,
  blog: <><path d="M5 3h9l5 5v13H5z" /><path d="M8 12h8M8 16h6M8 8h4" /></>,
  pricing: <><path d="M20 12l-8 8-9-9V4h7z" /><circle cx="7.5" cy="7.5" r="1.3" /></>,
  about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></>,
  jobs: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></>,
};

const NAV: { label: string; href: string; k: keyof typeof icon }[] = [
  { label: "Home", href: "/", k: "home" },
  { label: "Free tools", href: "/start", k: "tools" },
  { label: "Latest updates", href: "/latest", k: "latest" },
  { label: "ESG jobs", href: "/jobs", k: "jobs" },
  { label: "Blog", href: "/blog", k: "blog" },
  { label: "Pricing", href: "/pricing", k: "pricing" },
  { label: "About", href: "/about", k: "about" },
];

export default async function BriefPage() {
  const items = await getBriefFeed();
  const radar = items.slice(0, 5);
  const qr = await QRCode.toDataURL("https://saaksh.co/brief", {
    width: 240,
    margin: 1,
    color: { dark: "#0F1E33", light: "#FFFFFF" },
  });

  return (
    <div className="brief-root min-h-[100dvh] bg-band text-ink lg:flex lg:justify-center lg:gap-6 lg:px-6 lg:py-8">
      {/* Left: site navigation, so a direct visitor to /brief can reach the rest
          of Saaksh. Hidden on mobile (the phone owns the screen there). */}
      <aside className="hidden lg:flex flex-col w-[212px] flex-shrink-0">
        <Link href="/" aria-label="Saaksh home" className="flex items-center gap-2.5 px-2 hover:opacity-90 transition-opacity">
          <SaakshMark size={30} />
          <span className="font-display text-[20px] font-bold text-ink">Saaksh</span>
        </Link>
        <p className="mt-1 px-2 text-[12px] text-ink-faint">The Brief · 30-second ESG read</p>

        <nav className="mt-6 flex flex-col gap-0.5">
          {NAV.map((n) => (
            <Link
              key={n.href} href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14.5px] font-medium text-ink-body hover:bg-white hover:text-ink transition-colors"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="text-ink-muted">{icon[n.k]}</svg>
              {n.label}
            </Link>
          ))}
        </nav>

        <Link href="/start" className="mt-5 mx-1 inline-flex items-center justify-center gap-2 rounded-xl bg-forest text-white text-[13.5px] font-semibold px-4 py-2.5 hover:bg-forest-light transition-colors">
          Start a free report
        </Link>

        <p className="mt-auto px-2 pt-8 text-[12px] text-ink-faint leading-relaxed">
          Cited to SEBI &amp; ICAI.<br />No signup, nothing stored.
        </p>
      </aside>

      {/* Center: the phone (full-screen on mobile; a real two-layer device bezel
          on desktop, at Kapyn's exact dimensions). */}
      <div className="lg:flex-shrink-0 lg:p-[11px] lg:rounded-[52px] lg:bg-gradient-to-b lg:from-[#2a2a2f] lg:to-[#141416] lg:border lg:border-black/60 lg:shadow-[0_40px_110px_rgba(15,30,51,0.30),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="lg:p-[4px] lg:rounded-[42px] lg:bg-[#0a0a0a]">
          <BriefFeed items={items} />
        </div>
      </div>

      {/* Right: "on the radar" headlines + open-on-phone QR. */}
      <aside className="hidden lg:flex flex-col w-[300px] flex-shrink-0 gap-5">
        <div>
          <p className="flex items-center gap-2 px-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> On the radar today
          </p>
          <div className="mt-3 rounded-2xl border border-line bg-white shadow-elev-1 divide-y divide-line overflow-hidden">
            {radar.map((it) => {
              const cat = CATEGORY_BY_SLUG[it.category];
              const inner = (
                <div className="flex gap-3 px-4 py-3 hover:bg-band transition-colors">
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full" style={{ background: cat.accent }} />
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-ink leading-snug line-clamp-2">{it.title}</p>
                    <p className="mt-1 text-[11.5px] text-ink-faint truncate">{it.sourceName || cat.label} · {it.displayDate}</p>
                  </div>
                </div>
              );
              return it.external
                ? <a key={it.id} href={it.href} target="_blank" rel="noreferrer">{inner}</a>
                : <Link key={it.id} href={it.href}>{inner}</Link>;
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white shadow-elev-1 p-4 flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Scan to open saaksh.co/brief" width={78} height={78} className="rounded-lg border border-line flex-shrink-0" />
          <div>
            <p className="text-[13px] font-semibold text-ink">Get the 30-second brief</p>
            <p className="text-[12px] text-ink-muted leading-relaxed mt-0.5">Scan to open it on your phone, then Add to Home Screen.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
