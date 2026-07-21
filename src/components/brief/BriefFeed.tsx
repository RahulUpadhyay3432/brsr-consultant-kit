"use client";

// The whole Saaksh Brief experience: a swipeable (CSS scroll-snap) vertical card
// feed inside a phone column, with category pills, a grounded "Why it matters"
// sheet, Saved + Profile views, a daily streak, and PWA install. Dark, calm, and
// dep-free (no framer-motion).
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { track } from "@/lib/mixpanel";
import type { BriefCategory, BriefItem } from "@/lib/brief/types";
import { BRIEF_CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/brief/types";
import { whyItMattersAction } from "@/lib/brief/actions";
import {
  cacheWhy,
  getCachedWhy,
  getSaved,
  isSaved,
  toggleSaved,
  touchStreak,
} from "@/lib/brief/store";

/* ── icons ──────────────────────────────────────────────────────────────── */
const I = {
  bookmark: (f: boolean) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
  ),
  share: (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
  ),
  spark: (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>
  ),
  arrowUp: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  ext: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>,
  feed: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="5" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /></svg>,
  saved: (f: boolean) => <svg viewBox="0 0 24 24" width="20" height="20" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>,
  profile: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" /></svg>,
  fire: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.6-1 3 0 4 .6.6.6 1.6 0 2 2-.4 3-2 3-4 2 1.5 3 3.6 3 5.5C16 19 14 22 12 22S6 19.5 6 16c0-2.6 1.4-4.4 3-6 1.6-1.6 3-3.6 3-8z" /></svg>,
};

type View = "feed" | "saved" | "profile";

function Hero({ item }: { item: BriefItem }) {
  const cat = CATEGORY_BY_SLUG[item.category];
  return (
    <div className="relative w-full aspect-[16/10] flex-shrink-0 overflow-hidden">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-end p-4" style={{ background: `linear-gradient(145deg, ${cat.gradient[0]}, ${cat.gradient[1]})` }}>
          <span className="font-display text-[2.6rem] font-bold text-white/12 leading-none">{cat.label}</span>
        </div>
      )}
      <div className="absolute inset-x-0 top-0 p-3.5 flex items-center gap-2">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md text-white" style={{ background: cat.accent + "E6" }}>{item.tagLabel}</span>
        <span className="text-[11.5px] font-medium text-white/85 drop-shadow">{item.displayDate}</span>
      </div>
    </div>
  );
}

function Card({ item, onWhy }: { item: BriefItem; onWhy: (i: BriefItem) => void }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(isSaved(item.id)), [item.id]);

  const share = async () => {
    const url = item.external ? item.href : `https://saaksh.co${item.href}`;
    track("brief_shared", { category: item.category, kind: item.kind });
    try {
      if (navigator.share) await navigator.share({ title: item.title, url });
      else { await navigator.clipboard.writeText(url); }
    } catch { /* dismissed */ }
  };
  const bookmark = () => {
    const now = toggleSaved(item);
    setSaved(now);
    if (now) track("brief_bookmarked", { category: item.category, kind: item.kind });
  };

  const sourceLine =
    item.kind === "news" ? `AI summary · ${item.model || "gpt-oss"}${item.sourceName ? ` · ${item.sourceName}` : ""}`
    : item.kind === "regulation" ? `Source · ${item.sourceName || "primary source"}`
    : `Guide${item.sourceName ? ` · ${item.sourceName}` : ""}`;

  const titleCls = "font-display text-[1.35rem] leading-[1.2] font-bold text-ondark tracking-[-0.01em] hover:text-white";
  const onOpen = () => track("brief_source_opened", { kind: item.kind });

  return (
    <div className="snap-start h-full flex flex-col">
      <Hero item={item} />
      <div className="flex-1 flex flex-col px-5 pt-4 pb-2 min-h-0">
        {item.external ? (
          <a href={item.href} target="_blank" rel="noreferrer" onClick={onOpen} className={titleCls}>{item.title}</a>
        ) : (
          <Link href={item.href} onClick={onOpen} className={titleCls}>{item.title}</Link>
        )}
        <p className="mt-2.5 text-[15px] leading-[1.55] text-ondark-muted line-clamp-5 flex-1">{item.summary}</p>

        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ondark-faint">
          {item.aiSummary && <span className="text-brand-400">{I.spark}</span>}
          <span className="truncate">{sourceLine}</span>
          {item.external && <span className="ml-auto inline-flex items-center gap-1 text-ondark-muted">open {I.ext}</span>}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onWhy(item)} className="pressable flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 py-2.5 text-[13.5px] font-semibold text-ondark">
            <span className="text-brand-400">{I.spark}</span> Why it matters
          </button>
          <button onClick={bookmark} aria-label="Save" className={`pressable grid place-items-center h-11 w-11 rounded-xl border border-white/10 ${saved ? "bg-brand-600 text-white" : "bg-white/10 text-ondark hover:bg-white/15"}`}>{I.bookmark(saved)}</button>
          <button onClick={share} aria-label="Share" className="pressable grid place-items-center h-11 w-11 rounded-xl bg-white/10 border border-white/10 text-ondark hover:bg-white/15">{I.share}</button>
        </div>
      </div>
    </div>
  );
}

function CaughtUp({ streak, onTop }: { streak: number; onTop: () => void }) {
  return (
    <div className="snap-start h-full flex flex-col items-center justify-center text-center px-8 gap-4">
      <div className="grid place-items-center h-16 w-16 rounded-2xl bg-brand-600/20 text-brand-400">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h3 className="font-display text-[1.5rem] font-bold text-ondark">You&apos;re all caught up</h3>
      <p className="text-[14px] text-ondark-muted max-w-[280px] leading-relaxed">That&apos;s the ESG and BRSR world for now. New items land through the day.</p>
      {streak > 0 && <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember"><span className="text-ember">{I.fire}</span> {streak}-day streak</p>}
      <button onClick={onTop} className="pressable mt-1 inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2.5 text-[13.5px] font-semibold text-ondark">{I.arrowUp} Back to top</button>
    </div>
  );
}

export default function BriefFeed({ items }: { items: BriefItem[] }) {
  const [view, setView] = useState<View>("feed");
  const [cat, setCat] = useState<BriefCategory | "all">("all");
  const [why, setWhy] = useState<BriefItem | null>(null);
  const [savedList, setSavedList] = useState<BriefItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [installEvt, setInstallEvt] = useState<Event | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setStreak(touchStreak());
    track("brief_opened", {});
    const onInstall = (e: Event) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener("beforeinstallprompt", onInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  useEffect(() => { if (view === "saved") setSavedList(getSaved()); }, [view]);

  const feed = useMemo(() => (cat === "all" ? items : items.filter((i) => i.category === cat)), [items, cat]);
  const cats = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return BRIEF_CATEGORIES.filter((c) => present.has(c.slug));
  }, [items]);

  // Track the active card + fire one view event per card.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || view !== "feed") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          const id = (e.target as HTMLElement).dataset.id;
          if (id && !seenRef.current.has(id)) {
            seenRef.current.add(id);
            track("brief_card_viewed", { id });
          }
        }
      }
    }, { root, threshold: [0.6] });
    root.querySelectorAll("[data-id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [feed, view]);

  const openWhy = useCallback((item: BriefItem) => {
    setWhy(item);
    track("brief_why_it_matters", { kind: item.kind });
  }, []);

  const changeCat = (c: BriefCategory | "all") => {
    setCat(c);
    seenRef.current.clear();
    scrollRef.current?.scrollTo({ top: 0 });
    track("brief_category_changed", { category: c });
  };

  const install = async () => {
    const e = installEvt as (Event & { prompt?: () => Promise<void> }) | null;
    if (e?.prompt) { await e.prompt(); track("brief_installed", {}); setInstallEvt(null); }
  };

  return (
    <div className="relative w-full max-w-[440px] h-[100dvh] lg:h-[880px] lg:max-h-[92vh] lg:rounded-[2.2rem] lg:border lg:border-white/10 lg:shadow-2xl bg-forest text-ondark overflow-hidden flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 px-4 pt-3 pb-2 bg-forest/95 backdrop-blur z-20 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid place-items-center h-6 w-6 rounded-md bg-brand-600 text-white text-[13px] font-bold">S</span>
            <span className="font-display font-bold text-[16px] text-ondark">Saaksh Brief</span>
          </div>
          {streak > 0 && <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ember"><span>{I.fire}</span>{streak}</span>}
        </div>
        {view === "feed" && (
          <div className="mt-2.5 -mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <Pill active={cat === "all"} onClick={() => changeCat("all")}>All</Pill>
            {cats.map((c) => <Pill key={c.slug} active={cat === c.slug} onClick={() => changeCat(c.slug)}>{c.label}</Pill>)}
          </div>
        )}
      </header>

      {/* Main */}
      {view === "feed" && (
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto snap-y snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {feed.map((item) => (
            <section key={item.id} data-id={item.id} className="h-full">
              <Card item={item} onWhy={openWhy} />
            </section>
          ))}
          <section className="h-full"><CaughtUp streak={streak} onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })} /></section>
        </div>
      )}

      {view === "saved" && <SavedView items={savedList} onWhy={openWhy} onChange={() => setSavedList(getSaved())} onBrowse={() => setView("feed")} />}
      {view === "profile" && <ProfileView streak={streak} canInstall={!!installEvt} onInstall={install} />}

      {/* Bottom nav */}
      <nav className="flex-shrink-0 grid grid-cols-3 border-t border-white/8 bg-forest/95 backdrop-blur z-20">
        <NavBtn active={view === "feed"} onClick={() => setView("feed")} icon={I.feed} label="Feed" />
        <NavBtn active={view === "saved"} onClick={() => setView("saved")} icon={I.saved(view === "saved")} label="Saved" />
        <NavBtn active={view === "profile"} onClick={() => setView("profile")} icon={I.profile} label="Profile" />
      </nav>

      {why && <WhySheet item={why} onClose={() => setWhy(null)} />}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`chip-spring flex-shrink-0 text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-brand-600 text-white border-brand-600" : "bg-white/8 text-ondark-muted border-white/10 hover:text-ondark"}`}>{children}</button>
  );
}
function NavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold transition-colors ${active ? "text-brand-400" : "text-ondark-faint hover:text-ondark-muted"}`}>{icon}{label}</button>
  );
}

function SavedView({ items, onWhy, onChange, onBrowse }: { items: BriefItem[]; onWhy: (i: BriefItem) => void; onChange: () => void; onBrowse: () => void }) {
  if (!items.length) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
      <span className="text-ondark-faint">{I.saved(false)}</span>
      <p className="text-[14px] text-ondark-muted">Nothing saved yet. Tap the bookmark on any card to keep it here.</p>
      <button onClick={onBrowse} className="pressable rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white">Browse the feed</button>
    </div>
  );
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <h2 className="font-display text-[1.1rem] font-bold text-ondark px-1">Saved</h2>
      {items.map((item) => {
        const cat = CATEGORY_BY_SLUG[item.category];
        return (
          <div key={item.id} className="rounded-2xl bg-white/6 border border-white/8 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-white" style={{ background: cat.accent }}>{item.tagLabel}</span>
              <span className="text-[11px] text-ondark-faint">{item.displayDate}</span>
              <button onClick={() => { toggleSaved(item); onChange(); }} className="ml-auto text-ondark-faint hover:text-ember text-[11px] font-semibold">Remove</button>
            </div>
            {item.external
              ? <a href={item.href} target="_blank" rel="noreferrer" className="font-display text-[15px] font-bold text-ondark leading-snug block">{item.title}</a>
              : <Link href={item.href} className="font-display text-[15px] font-bold text-ondark leading-snug block">{item.title}</Link>}
            <p className="text-[12.5px] text-ondark-muted mt-1 line-clamp-2">{item.summary}</p>
            <button onClick={() => onWhy(item)} className="mt-2 text-[12px] font-semibold text-brand-400">Why it matters →</button>
          </div>
        );
      })}
    </div>
  );
}

function ProfileView({ streak, canInstall, onInstall }: { streak: number; canInstall: boolean; onInstall: () => void }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 space-y-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="rounded-2xl bg-white/6 border border-white/8 p-5 text-center">
        <p className="inline-flex items-center gap-2 text-[2rem] font-bold text-ember"><span>{I.fire}</span>{streak}</p>
        <p className="text-[12.5px] text-ondark-muted mt-1">day streak{streak === 1 ? "" : "s"} · come back tomorrow to keep it going</p>
      </div>
      {canInstall && (
        <button onClick={onInstall} className="pressable w-full rounded-2xl bg-brand-600 hover:bg-brand-700 py-3.5 text-[14px] font-semibold text-white">Add Brief to home screen</button>
      )}
      <div className="rounded-2xl bg-white/6 border border-white/8 p-4">
        <p className="text-[13px] font-semibold text-ondark mb-1.5">About the Brief</p>
        <p className="text-[13px] text-ondark-muted leading-relaxed">A 30-second read on Indian ESG and BRSR: SEBI, BRSR Core, CBAM, CCTS and global frameworks. Fresh news is AI-summarised and always links the source; regulatory items and guides are hand-cited.</p>
      </div>
      <div className="text-center">
        <Link href="/" className="text-[13px] font-semibold text-brand-400">Explore the full Saaksh toolkit →</Link>
      </div>
      <p className="text-[11px] text-ondark-faint text-center leading-relaxed">Not legal advice. Verify the current position before advising a client. Saved items stay on this device.</p>
    </div>
  );
}

function WhySheet({ item, onClose }: { item: BriefItem; onClose: () => void }) {
  const [text, setText] = useState<string | null>(item.whyItMatters || getCachedWhy(item.id));
  const [loading, setLoading] = useState(!text);
  useEffect(() => {
    if (text) return;
    let live = true;
    whyItMattersAction({ id: item.id, title: item.title, summary: item.summary }).then((r) => {
      if (!live) return;
      const t = r.text || item.summary; // fall back to the (already cited) summary
      setText(t);
      setLoading(false);
      if (r.text) cacheWhy(item.id, r.text);
    });
    return () => { live = false; };
  }, [item, text]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div onClick={(e) => e.stopPropagation()} className="dropdown-in relative rounded-t-3xl bg-[#152740] border-t border-white/10 px-5 pt-4 pb-7 max-h-[70%] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto h-1 w-10 rounded-full bg-white/20 mb-4" />
        <p className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-brand-400 mb-2"><span>{I.spark}</span> Why it matters</p>
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-11/12 rounded" /><div className="skeleton h-4 w-4/6 rounded" />
          </div>
        ) : (
          <p className="text-[15px] leading-[1.6] text-ondark">{text}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          {item.external
            ? <a href={item.href} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-xl bg-white/10 border border-white/10 py-2.5 text-[13px] font-semibold text-ondark">Read the source</a>
            : <Link href={item.href} className="flex-1 text-center rounded-xl bg-white/10 border border-white/10 py-2.5 text-[13px] font-semibold text-ondark">Read the guide</Link>}
          <button onClick={onClose} className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white">Done</button>
        </div>
      </div>
    </div>
  );
}
