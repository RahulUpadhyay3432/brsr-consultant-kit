"use client";

// The whole Saaksh Brief experience: a swipeable card feed inside a phone column.
// Vertical = native CSS scroll-snap; horizontal = Framer Motion drag to change
// category (spring + adjacent-category peek + direction-locked touch), adapted
// from Kapyn. Plus a "New since last visit" hook, hero image fade-in, and pull-to-
// refresh. Light theme, to match the rest of Saaksh.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useVelocity, animate } from "framer-motion";
import { track } from "@/lib/mixpanel";
import type { BriefCategory, BriefItem } from "@/lib/brief/types";
import { BRIEF_CATEGORIES, CATEGORY_BY_SLUG } from "@/lib/brief/types";
import { whyItMattersAction } from "@/lib/brief/actions";
import { SaakshMark } from "@/components/SaakshMark";
import CompanyAvatar from "@/components/CompanyAvatar";
import {
  usedCategories, jobAge, jobChips, similarJobs, matchesQuery,
  getSavedJobIds, toggleSavedJob, workModeLabel,
  type Job, type JobCategory,
} from "@/lib/jobs";
import { useMergedJobs } from "@/lib/jobs/useMergedJobs";
import { JobDescription } from "@/components/jobs/JobDescription";
import {
  cacheWhy, getCachedWhy, getLastVisit, getSaved, isSaved, stampVisit, toggleSaved, touchStreak,
} from "@/lib/brief/store";
import {
  getPushState, pushSupported, subscribeToPush, unsubscribeFromPush, type PushState,
} from "@/lib/brief/push-client";

type Tab = BriefCategory | "all";
const SWIPE_DISTANCE = 72;
const SWIPE_VELOCITY = 400;
const PTR_THRESHOLD = 64;
const DIR_LOCK = 8;

/* ── icons ──────────────────────────────────────────────────────────────── */
const I = {
  bookmark: (f: boolean) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
  ),
  share: <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>,
  spark: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></svg>,
  arrowUp: <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>,
  ext: <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10" /></svg>,
  chevL: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>,
  chevR: <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>,
  feed: <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="5" rx="1.5" /><rect x="3" y="13" width="18" height="7" rx="1.5" /></svg>,
  saved: (f: boolean) => <svg viewBox="0 0 24 24" width="20" height="20" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>,
  profile: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.4 3.1-5.5 7-5.5s7 2.1 7 5.5" /></svg>,
  jobs: <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>,
  fire: <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2c1 3-1 4-2 6-1 1.6-1 3 0 4 .6.6.6 1.6 0 2 2-.4 3-2 3-4 2 1.5 3 3.6 3 5.5C16 19 14 22 12 22S6 19.5 6 16c0-2.6 1.4-4.4 3-6 1.6-1.6 3-3.6 3-8z" /></svg>,
};

const labelFor = (t: Tab) => (t === "all" ? "All" : CATEGORY_BY_SLUG[t].label);

function Hero({ item }: { item: BriefItem }) {
  const cat = CATEGORY_BY_SLUG[item.category];
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="relative w-full aspect-[2/1] lg:aspect-auto lg:h-[168px] flex-shrink-0 overflow-hidden">
      {/* Gradient always underneath, so there's never a blank flash before an image loads */}
      <div className="absolute inset-0 flex items-end p-4" style={{ background: `linear-gradient(145deg, ${cat.gradient[0]}, ${cat.gradient[1]})` }}>
        <span className="font-display text-[2.4rem] font-bold text-white/15 leading-none">{cat.label}</span>
      </div>
      {item.imageUrl && (
        <img
          src={item.imageUrl} alt="" loading="lazy" decoding="async"
          onLoad={() => setLoaded(true)}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: loaded ? 1 : 0 }}
        />
      )}
      <div className="absolute inset-x-0 top-0 p-3.5 flex items-center gap-2 z-10">
        <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] px-2 py-1 rounded-md text-white shadow-sm" style={{ background: cat.accent }}>{item.tagLabel}</span>
        <span className="text-[11.5px] font-semibold text-white/95 drop-shadow">{item.displayDate}</span>
        {item.isNew && (
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-500 text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white" /> New
          </span>
        )}
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
    try { if (navigator.share) await navigator.share({ title: item.title, url }); else await navigator.clipboard.writeText(url); } catch { /* dismissed */ }
  };
  const bookmark = () => { const now = toggleSaved(item); setSaved(now); if (now) track("brief_bookmarked", { category: item.category, kind: item.kind }); };

  const sourceLine =
    item.kind === "news" ? `AI summary · ${item.model || "gpt-oss"}${item.sourceName ? ` · ${item.sourceName}` : ""}`
    : item.kind === "regulation" ? `Source · ${item.sourceName || "primary source"}`
    : `Guide${item.sourceName ? ` · ${item.sourceName}` : ""}`;

  const titleCls = "block font-display text-[1.3rem] leading-[1.2] font-bold text-ink tracking-[-0.01em] hover:text-brand-700 line-clamp-3";
  const onOpen = () => track("brief_source_opened", { kind: item.kind });

  return (
    <div className="h-full flex flex-col bg-page">
      <Hero item={item} />
      <div className="flex-1 flex flex-col px-5 pt-4 pb-2 min-h-0">
        {item.external ? (
          <a href={item.href} target="_blank" rel="noreferrer" onClick={onOpen} className={titleCls}>{item.title}</a>
        ) : (
          <Link href={item.href} onClick={onOpen} className={titleCls}>{item.title}</Link>
        )}
        <p className="mt-2.5 text-[15px] leading-[1.55] text-ink-body line-clamp-[8] flex-1">{item.summary}</p>
        <div className="mt-3 flex items-center gap-1.5 text-[11.5px] text-ink-faint">
          {item.aiSummary && <span className="text-brand-600">{I.spark}</span>}
          <span className="truncate">{sourceLine}</span>
          {item.external && <span className="ml-auto inline-flex items-center gap-1 text-ink-muted">open {I.ext}</span>}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onWhy(item)} className="pressable flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white border border-line shadow-elev-1 hover:shadow-elev-2 py-2.5 text-[13.5px] font-semibold text-ink">
            <span className="text-brand-600">{I.spark}</span> Why it matters
          </button>
          <button onClick={bookmark} aria-label="Save" className={`pressable grid place-items-center h-11 w-11 rounded-xl border ${saved ? "bg-brand-600 text-white border-brand-600" : "bg-white border-line text-ink-muted hover:bg-band"}`}>{I.bookmark(saved)}</button>
          <button onClick={share} aria-label="Share" className="pressable grid place-items-center h-11 w-11 rounded-xl bg-white border border-line text-ink-muted hover:bg-band">{I.share}</button>
        </div>
      </div>
    </div>
  );
}

function CaughtUp({ streak, onTop }: { streak: number; onTop: () => void }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4 bg-page">
      <div className="grid place-items-center h-16 w-16 rounded-2xl bg-brand-50 text-brand-600">
        <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
      </div>
      <h3 className="font-display text-[1.5rem] font-bold text-ink">You&apos;re all caught up</h3>
      <p className="text-[14px] text-ink-muted max-w-[280px] leading-relaxed">That&apos;s the ESG and BRSR world for now. New items land through the day.</p>
      {streak > 0 && <p className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ember"><span>{I.fire}</span> {streak}-day streak</p>}
      <button onClick={onTop} className="pressable mt-1 inline-flex items-center gap-2 rounded-xl bg-white border border-line px-4 py-2.5 text-[13.5px] font-semibold text-ink shadow-elev-1">{I.arrowUp} Back to top</button>
    </div>
  );
}

type View = "feed" | "jobs" | "saved" | "profile";

export default function BriefFeed({ items }: { items: BriefItem[] }) {
  const router = useRouter();
  const jobs = useMergedJobs();
  const [view, setView] = useState<View>("feed");
  const [cat, setCat] = useState<Tab>("all");
  const [why, setWhy] = useState<BriefItem | null>(null);
  const [savedList, setSavedList] = useState<BriefItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [installEvt, setInstallEvt] = useState<Event | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(false);
  const [lastVisit] = useState<number | null>(() => getLastVisit());

  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string>>(new Set());
  const dragX = useMotionValue(0);
  const dragVel = useVelocity(dragX);
  const animating = useRef(false);
  const activeIdxRef = useRef(0);

  // Mark items published since the last visit as "new".
  const withNew = useMemo(
    () => items.map((it) => ({ ...it, isNew: lastVisit != null && new Date(it.date).getTime() > lastVisit })),
    [items, lastVisit]
  );
  const feed = useMemo(() => (cat === "all" ? withNew : withNew.filter((i) => i.category === cat)), [withNew, cat]);
  const cats = useMemo(() => {
    const present = new Set(items.map((i) => i.category));
    return BRIEF_CATEGORIES.filter((c) => present.has(c.slug));
  }, [items]);
  const tabs = useMemo<Tab[]>(() => ["all", ...cats.map((c) => c.slug)], [cats]);
  const tabIdx = tabs.indexOf(cat);
  const newCount = useMemo(() => (lastVisit == null ? 0 : withNew.filter((i) => i.isNew).length), [withNew, lastVisit]);

  useEffect(() => {
    setStreak(touchStreak());
    stampVisit();
    track("brief_opened", {});
    const onInstall = (e: Event) => { e.preventDefault(); setInstallEvt(e); };
    window.addEventListener("beforeinstallprompt", onInstall);
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  useEffect(() => { if (view === "saved") setSavedList(getSaved()); }, [view]);

  const changeCat = useCallback((c: Tab) => {
    setCat(c);
    seenRef.current.clear();
    activeIdxRef.current = 0;
    scrollRef.current?.scrollTo({ top: 0 });
    track("brief_category_changed", { category: c });
  }, []);

  // ── Horizontal swipe → change category (Framer Motion) ─────────────────────
  const commitSwipe = useCallback((dx: number) => {
    if (animating.current) return;
    const vel = dragVel.get();
    const width = viewportRef.current?.clientWidth ?? 390;
    const goNext = (dx < -SWIPE_DISTANCE || vel < -SWIPE_VELOCITY) && tabIdx < tabs.length - 1;
    const goPrev = (dx > SWIPE_DISTANCE || vel > SWIPE_VELOCITY) && tabIdx > 0;
    if (goNext || goPrev) {
      animating.current = true;
      const next = tabs[goNext ? tabIdx + 1 : tabIdx - 1];
      if (navigator.vibrate) navigator.vibrate(8);
      animate(dragX, goNext ? -width : width, {
        type: "spring", stiffness: 400, damping: 38, restDelta: 1,
        onComplete: () => { changeCat(next); dragX.set(0); animating.current = false; },
      });
    } else {
      animate(dragX, 0, { type: "spring", stiffness: 400, damping: 38 });
    }
  }, [tabIdx, tabs, dragX, dragVel, changeCat]);

  // Non-passive touch listeners on the scroll container: 8px direction lock,
  // horizontal → drive dragX (and preventDefault so vertical scroll doesn't fight
  // it), vertical → native scroll + pull-to-refresh at the top.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || view !== "feed") return;
    let sx = 0, sy = 0, cx = 0, lock: "none" | "h" | "v" = "none";
    const onStart = (e: TouchEvent) => { lock = "none"; sx = cx = e.touches[0].clientX; sy = e.touches[0].clientY; };
    const onMove = (e: TouchEvent) => {
      if (animating.current) return;
      cx = e.touches[0].clientX;
      const dx = cx - sx, dy = e.touches[0].clientY - sy;
      if (lock === "none") {
        if (Math.abs(dx) >= DIR_LOCK || Math.abs(dy) >= DIR_LOCK) lock = Math.abs(dx) >= Math.abs(dy) ? "h" : "v";
        return;
      }
      if (lock === "h") {
        e.preventDefault();
        const atEdge = (dx < 0 && tabIdx >= tabs.length - 1) || (dx > 0 && tabIdx <= 0);
        dragX.set(atEdge ? dx * 0.25 : dx);
      } else if (el.scrollTop <= 4 && dy > 0 && !refreshing) {
        setPull(Math.min(dy * 0.5, PTR_THRESHOLD * 1.3));
      }
    };
    const onEnd = () => {
      const dx = cx - sx;
      const wasLock = lock; lock = "none";
      if (wasLock === "h") { commitSwipe(dx); return; }
      if (pullRef.current >= PTR_THRESHOLD && el.scrollTop <= 4 && !refreshing) doRefresh();
      setPull(0);
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, tabIdx, tabs, refreshing, commitSwipe]);

  // Pull-to-refresh state (ref mirrors so the touch handler reads the latest).
  const [pull, setPullState] = useState(0);
  const pullRef = useRef(0);
  const setPull = (v: number) => { pullRef.current = v; setPullState(v); };
  const doRefresh = useCallback(() => {
    setRefreshing(true);
    track("brief_refreshed", {});
    router.refresh();
    setTimeout(() => { setRefreshing(false); setToast(true); setTimeout(() => setToast(false), 1600); }, 1100);
  }, [router]);

  // Active-card tracking: fire one view per card + a soft haptic.
  useEffect(() => {
    const root = scrollRef.current;
    if (!root || view !== "feed") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && e.intersectionRatio > 0.6) {
          const idx = Number((e.target as HTMLElement).dataset.idx);
          const id = (e.target as HTMLElement).dataset.id;
          if (idx !== activeIdxRef.current) { activeIdxRef.current = idx; if (navigator.vibrate) navigator.vibrate(6); }
          if (id && !seenRef.current.has(id)) { seenRef.current.add(id); track("brief_card_viewed", { id }); }
        }
      }
    }, { root, threshold: [0.6] });
    root.querySelectorAll("[data-id]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [feed, view]);

  // Preload the next few hero images so a swipe-down has them ready.
  useEffect(() => {
    for (let i = 0; i < Math.min(3, feed.length); i++) {
      const url = feed[i]?.imageUrl;
      if (url) { const img = new window.Image(); img.decoding = "async"; img.src = url; }
    }
  }, [feed]);

  const openWhy = useCallback((item: BriefItem) => { setWhy(item); track("brief_why_it_matters", { kind: item.kind }); }, []);
  const install = async () => {
    const e = installEvt as (Event & { prompt?: () => Promise<void> }) | null;
    if (e?.prompt) { await e.prompt(); track("brief_installed", {}); setInstallEvt(null); }
  };

  // On mobile the shell is fixed to the viewport (inset-0) so the document behind
  // it can't scroll at all, which stops the iOS toolbar from toggling and shoving
  // the bottom nav. On desktop it reverts to an in-flow phone frame inside the
  // bezel. Nav + feed live in this flex column; only the inner list scrolls.
  return (
    <div className="fixed inset-0 mx-auto w-full max-w-[430px] h-[100dvh] lg:relative lg:inset-auto lg:mx-0 lg:w-[330px] lg:max-w-[330px] lg:h-[min(830px,calc(100dvh-88px))] lg:rounded-[38px] bg-page text-ink overflow-hidden flex flex-col">
      {/* Top bar */}
      <header className="flex-shrink-0 px-4 pt-3 pb-2 bg-page/95 backdrop-blur z-20 border-b border-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SaakshMark size={22} />
            <span className="font-display font-bold text-[16px] text-ink">Saaksh Brief</span>
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {newCount} new
              </span>
            )}
          </div>
          {streak > 0 && <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-ember"><span>{I.fire}</span>{streak}</span>}
        </div>
        {view === "feed" && (
          <div className="mt-2.5 -mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tabs.map((t) => <Pill key={t} active={cat === t} onClick={() => changeCat(t)}>{labelFor(t)}</Pill>)}
          </div>
        )}
      </header>

      {/* Feed viewport (clips the sliding stack) */}
      {view === "feed" && (
        <div ref={viewportRef} className="relative flex-1 min-h-0 overflow-hidden bg-page">
          {/* Adjacent-category peek */}
          {tabIdx > 0 && (
            <div className="absolute inset-0 flex items-center justify-end pr-6 gap-1.5 text-ink-faint text-[12px] font-bold uppercase tracking-wide">
              {I.chevL}{labelFor(tabs[tabIdx - 1])}
            </div>
          )}
          {tabIdx < tabs.length - 1 && (
            <div className="absolute inset-0 flex items-center justify-start pl-6 gap-1.5 text-ink-faint text-[12px] font-bold uppercase tracking-wide">
              {labelFor(tabs[tabIdx + 1])}{I.chevR}
            </div>
          )}
          {/* Pull-to-refresh spinner */}
          {(pull > 8 || refreshing) && (
            <div className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ top: Math.min(pull * 0.4, 22) }}>
              <span className="block h-6 w-6 rounded-full border-[3px] border-line border-t-brand-600 animate-spin" />
            </div>
          )}
          {/* Sliding card stack */}
          <motion.div style={{ x: dragX }} className="absolute inset-0 flex flex-col">
            <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain snap-y snap-mandatory scroll-smooth bg-page [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {feed.map((item, i) => (
                <section key={item.id} data-id={item.id} data-idx={i} className="h-full snap-start">
                  <Card item={item} onWhy={openWhy} />
                </section>
              ))}
              <section className="h-full snap-start"><CaughtUp streak={streak} onTop={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })} /></section>
            </div>
          </motion.div>
          {/* Toast */}
          <AnimatePresence>
            {toast && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 rounded-full bg-ink/85 text-white text-[12px] font-semibold px-4 py-1.5">
                Feed refreshed
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {view === "jobs" && <JobsView jobs={jobs} />}
      {view === "saved" && <SavedView items={savedList} onWhy={openWhy} onChange={() => setSavedList(getSaved())} onBrowse={() => setView("feed")} />}
      {view === "profile" && <ProfileView streak={streak} canInstall={!!installEvt} onInstall={install} />}

      {/* Bottom nav */}
      <nav className="flex-shrink-0 grid grid-cols-4 border-t border-line bg-page/95 backdrop-blur z-20">
        <NavBtn active={view === "feed"} onClick={() => setView("feed")} icon={I.feed} label="Feed" />
        <NavBtn active={view === "jobs"} onClick={() => setView("jobs")} icon={I.jobs} label="Jobs" />
        <NavBtn active={view === "saved"} onClick={() => setView("saved")} icon={I.saved(view === "saved")} label="Saved" />
        <NavBtn active={view === "profile"} onClick={() => setView("profile")} icon={I.profile} label="Profile" />
      </nav>

      {why && <WhySheet item={why} onClose={() => setWhy(null)} />}
    </div>
  );
}

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`chip-spring flex-shrink-0 text-[12.5px] font-semibold px-3 py-1.5 rounded-full border transition-colors ${active ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line hover:border-brand-300"}`}>{children}</button>
  );
}
function NavBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-semibold transition-colors ${active ? "text-brand-700" : "text-ink-faint hover:text-ink-muted"}`}>{icon}{label}</button>
  );
}

function SavedView({ items, onWhy, onChange, onBrowse }: { items: BriefItem[]; onWhy: (i: BriefItem) => void; onChange: () => void; onBrowse: () => void }) {
  if (!items.length) return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3 bg-page">
      <span className="text-ink-faint">{I.saved(false)}</span>
      <p className="text-[14px] text-ink-muted">Nothing saved yet. Tap the bookmark on any card to keep it here.</p>
      <button onClick={onBrowse} className="pressable rounded-xl bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white">Browse the feed</button>
    </div>
  );
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 bg-page [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <h2 className="font-display text-[1.1rem] font-bold text-ink px-1">Saved</h2>
      {items.map((item) => {
        const cat = CATEGORY_BY_SLUG[item.category];
        return (
          <div key={item.id} className="rounded-2xl bg-white border border-line shadow-elev-1 p-3.5">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-white" style={{ background: cat.accent }}>{item.tagLabel}</span>
              <span className="text-[11px] text-ink-faint">{item.displayDate}</span>
              <button onClick={() => { toggleSaved(item); onChange(); }} className="ml-auto text-ink-faint hover:text-ember text-[11px] font-semibold">Remove</button>
            </div>
            {item.external
              ? <a href={item.href} target="_blank" rel="noreferrer" className="font-display text-[15px] font-bold text-ink leading-snug block">{item.title}</a>
              : <Link href={item.href} className="font-display text-[15px] font-bold text-ink leading-snug block">{item.title}</Link>}
            <p className="text-[12.5px] text-ink-muted mt-1 line-clamp-2">{item.summary}</p>
            <button onClick={() => onWhy(item)} className="mt-2 text-[12px] font-semibold text-brand-700">Why it matters →</button>
          </div>
        );
      })}
    </div>
  );
}

function NotifyCard() {
  const [state, setState] = useState<PushState>("idle");
  const [busy, setBusy] = useState(false);
  useEffect(() => { getPushState().then(setState); }, []);
  if (!pushSupported() || state === "unsupported") return null;

  const on = state === "subscribed";
  const toggle = async () => {
    setBusy(true);
    const next = on ? await unsubscribeFromPush() : await subscribeToPush();
    setState(next);
    if (next === "subscribed") track("brief_notifications_on", {});
    setBusy(false);
  };

  return (
    <div className="rounded-2xl bg-white border border-line shadow-elev-1 p-4">
      <div className="flex items-start gap-3">
        <span className="grid place-items-center h-9 w-9 flex-shrink-0 rounded-xl bg-brand-50 text-brand-600">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 01-3.4 0" /></svg>
        </span>
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold text-ink">Notify me on big updates</p>
          <p className="text-[12.5px] text-ink-muted leading-relaxed mt-0.5">
            {state === "denied"
              ? "Notifications are blocked in your browser settings. Enable them for this site to turn this on."
              : "A quiet ping when a real SEBI, BRSR or CBAM change lands. A few a day at most."}
          </p>
        </div>
      </div>
      {state !== "denied" && (
        <button
          onClick={toggle} disabled={busy}
          className={`pressable mt-3 w-full rounded-xl py-2.5 text-[13.5px] font-semibold disabled:opacity-60 ${on ? "bg-band border border-line text-ink" : "bg-brand-600 text-white"}`}
        >
          {busy ? "…" : on ? "Turn off notifications" : "Turn on notifications"}
        </button>
      )}
    </div>
  );
}

function JobPill({ children, highlight }: { children: React.ReactNode; highlight?: boolean }) {
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold rounded-full px-2 py-0.5 leading-none ${highlight ? "text-brand-700 bg-brand-50 border border-[#CDE2F6]" : "text-ink-body bg-band border border-line"}`}>{children}</span>
  );
}
const jobSave = (f: boolean) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" /></svg>
);

function JobRow({ job, saved, onOpen, onSave }: { job: Job; saved: boolean; onOpen: () => void; onSave: () => void }) {
  return (
    <div role="button" tabIndex={0} onClick={onOpen} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      className={`pressable rounded-2xl bg-white border border-line shadow-elev-1 p-3.5 flex flex-col gap-2 cursor-pointer ${job.closed ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-3">
        <CompanyAvatar name={job.company} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            {job.featured && <span className="px-1.5 py-0.5 rounded bg-forest text-white text-[9.5px] font-bold tracking-wide">Featured</span>}
            {job.closed && <span className="px-1.5 py-0.5 rounded bg-band text-ink-faint text-[9.5px] font-bold border border-line">Closed</span>}
          </div>
          <p className="font-display text-[14.5px] font-bold text-ink leading-snug line-clamp-2">{job.title}</p>
          <p className="text-[12px] text-ink-muted mt-0.5 truncate">{job.company} · {job.location}</p>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onSave(); }} aria-label={saved ? "Saved" : "Save"} className={`p-0.5 flex-shrink-0 ${saved ? "text-brand-600" : "text-ink-faint"}`}>{jobSave(saved)}</button>
      </div>
      {job.salary && <div className="text-[14.5px] font-bold text-ink tracking-[-0.01em]">{job.salary}</div>}
      <div className="flex flex-wrap items-center gap-1.5">
        {jobChips(job).slice(0, 3).map((m) => <JobPill key={m}>{m}</JobPill>)}
      </div>
      <div className="text-[11.5px] text-ink-faint">{jobAge(job.postedDate)}{job.sourceName ? ` · via ${job.sourceName}` : ""}</div>
    </div>
  );
}

function JobSheet({ job, all, saved, onSave, onOpen, onClose }: { job: Job; all: Job[]; saved: boolean; onSave: () => void; onOpen: (id: string) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"job" | "company" | "similar">("job");
  useEffect(() => setTab("job"), [job.id]);
  const chips = jobChips(job);
  const sim = similarJobs(all, job, 3);
  const companyMeta = [job.location, job.companySize].filter(Boolean).join(" · ");
  const TabBtn = ({ k, label }: { k: typeof tab; label: string }) => (
    <button onClick={() => setTab(k)} className={`pb-2.5 -mb-px text-[13.5px] border-b-2 ${tab === k ? "text-ink font-semibold border-brand-600" : "text-ink-muted font-medium border-transparent"}`}>{label}</button>
  );
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />
      <div onClick={(e) => e.stopPropagation()} className="dropdown-in relative rounded-t-3xl bg-white border-t border-line shadow-elev-3 flex flex-col max-h-[94%]">
        <div className="flex-shrink-0 pt-3 pb-1"><div className="mx-auto h-1 w-10 rounded-full bg-line" /></div>
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {job.closed && <div className="px-3 py-2 rounded-xl bg-[#F6F2ED] border border-[#EADFD1] text-[#946B41] text-[12.5px] font-medium mb-3.5">No longer accepting applications.</div>}
          <div className="flex gap-3 items-start">
            <CompanyAvatar name={job.company} size={50} />
            <div className="min-w-0 flex-1">
              {job.featured && <span className="inline-block px-2 py-0.5 rounded bg-forest text-white text-[10px] font-semibold mb-1.5">Featured</span>}
              <h2 className="m-0 font-editorial text-[1.35rem] font-semibold tracking-[-0.01em] leading-tight text-ink">{job.title}</h2>
              <div className="text-[13.5px] text-ink-muted mt-1">{job.company} · {job.location}</div>
            </div>
          </div>
          {job.salary && <div className="mt-3.5 px-3.5 py-3 bg-brand-50 border border-[#CDE2F6] rounded-xl"><div className="text-[10.5px] font-semibold uppercase tracking-wide text-ink-faint mb-0.5">Compensation</div><div className="text-[19px] font-bold text-ink">{job.salary}</div></div>}
          {chips.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3.5">{chips.map((c) => <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-line bg-band text-ink-body text-[12px] font-medium leading-none"><span className="text-emerald-600 font-bold">✓</span>{c}</span>)}</div>}
          <div className="flex gap-5 mt-4 border-b border-line">
            <TabBtn k="job" label="The job" /><TabBtn k="company" label="Company" /><TabBtn k="similar" label="Similar" />
          </div>
          <div className="pt-3.5">
            {tab === "job" && (
              <div>
                <div className="mb-3"><JobDescription job={job} compact /></div>
                {job.tags && job.tags.length > 0 && <div className="flex flex-wrap gap-1.5">{job.tags.map((t) => <span key={t} className="px-2.5 py-1 rounded-lg bg-[#EEF3F8] text-[#55617A] text-[12px] font-medium">{t}</span>)}</div>}
              </div>
            )}
            {tab === "company" && (
              <div>
                <div className="flex gap-3 items-center mb-3"><CompanyAvatar name={job.company} size={40} /><div><div className="text-[14.5px] font-semibold text-ink">{job.company}</div>{companyMeta && <div className="text-[12.5px] text-ink-muted">{companyMeta}</div>}</div></div>
                <p className="m-0 text-[14px] leading-relaxed text-ink-body">{job.aboutCompany || `${job.company} is hiring for this role — see the posting for more.`}</p>
              </div>
            )}
            {tab === "similar" && (
              <div className="flex flex-col gap-2.5">
                {sim.map((j) => (
                  <div key={j.id} role="button" tabIndex={0} onClick={() => onOpen(j.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(j.id); } }} className="flex gap-3 items-center p-3 border border-line rounded-xl cursor-pointer">
                    <CompanyAvatar name={j.company} size={34} />
                    <div className="min-w-0 flex-1"><div className="text-[13.5px] font-semibold text-ink truncate">{j.title}</div><div className="text-[12px] text-ink-muted truncate">{j.company} · {workModeLabel(j.workMode) || jobAge(j.postedDate)}</div></div>
                  </div>
                ))}
                {sim.length === 0 && <div className="p-5 text-center text-[13px] text-ink-faint bg-band rounded-xl">No similar roles right now.</div>}
              </div>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 border-t border-line px-4 py-3 flex gap-2.5 items-center bg-white">
          <button onClick={onSave} aria-label={saved ? "Saved" : "Save"} className={`grid place-items-center h-11 w-11 rounded-xl border ${saved ? "bg-brand-600 text-white border-brand-600" : "bg-white border-line text-ink-muted"}`}>{jobSave(saved)}</button>
          {job.closed
            ? <span className="flex-1 text-center py-3 rounded-xl bg-band text-ink-faint font-semibold text-[14px]">Applications closed</span>
            : <a href={job.applyUrl} target="_blank" rel="noreferrer" onClick={() => track("job_clicked", { category: job.category, company: job.company, from: "brief-sheet" })} className="flex-1 text-center inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-brand-600 text-white font-semibold text-[14px]">View &amp; apply {I.ext}</a>}
        </div>
      </div>
    </div>
  );
}

function JobsView({ jobs }: { jobs: Job[] }) {
  const cats = useMemo(() => usedCategories(jobs), [jobs]);
  const [cat, setCat] = useState<JobCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sheet, setSheet] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  useEffect(() => setSavedIds(getSavedJobIds()), []);
  const save = (id: string) => { toggleSavedJob(id); setSavedIds(getSavedJobIds()); };

  const shown = jobs.filter((j) => (cat === "all" || j.category === cat) && matchesQuery(j, query));
  const sheetJob = jobs.find((j) => j.id === sheet) || null;

  if (!jobs.length) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3 bg-page">
        <span className="grid place-items-center h-14 w-14 rounded-2xl bg-brand-50 text-brand-600">{I.jobs}</span>
        <h3 className="font-display text-[1.2rem] font-bold text-ink">Fresh ESG roles land here</h3>
        <p className="text-[13px] text-ink-muted max-w-[260px] leading-relaxed">Hand-picked BRSR, ESG and sustainability jobs across India, each links to the original posting. First roles landing shortly.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-page">
      <div className="flex-shrink-0 px-4 pt-2 pb-2.5 flex items-center gap-2.5">
        <span className="font-display text-[1.15rem] font-bold text-ink">Jobs</span>
        <label className="flex-1 flex items-center gap-2 bg-band border border-line rounded-xl px-3 py-2 text-ink-faint">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="flex-shrink-0"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search roles" className="border-none outline-none bg-transparent text-[13.5px] text-ink w-full placeholder:text-ink-faint" />
        </label>
      </div>
      {cats.length > 1 && (
        <div className="flex-shrink-0 px-4 pb-2 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Pill active={cat === "all"} onClick={() => setCat("all")}>All</Pill>
          {cats.map((c) => <Pill key={c.slug} active={cat === c.slug} onClick={() => setCat(c.slug)}>{c.label}</Pill>)}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3 space-y-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {shown.map((job) => (
          <JobRow key={job.id} job={job} saved={savedIds.includes(job.id)} onOpen={() => setSheet(job.id)} onSave={() => save(job.id)} />
        ))}
        {shown.length === 0 && <div className="text-center py-12 text-ink-muted"><div className="font-display text-[1.05rem] font-bold text-ink mb-1">No roles match</div><div className="text-[13px]">Try another search or category.</div></div>}
        <p className="text-[11px] text-ink-faint leading-relaxed px-1 pt-1">Curated, and linked to the original posting, verify the details and apply there. Not endorsements.</p>
      </div>
      {sheetJob && <JobSheet job={sheetJob} all={jobs} saved={savedIds.includes(sheetJob.id)} onSave={() => save(sheetJob.id)} onOpen={(id) => setSheet(id)} onClose={() => setSheet(null)} />}
    </div>
  );
}

function ProfileView({ streak, canInstall, onInstall }: { streak: number; canInstall: boolean; onInstall: () => void }) {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-5 space-y-5 bg-page [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="rounded-2xl bg-white border border-line shadow-elev-1 p-5 text-center">
        <p className="inline-flex items-center gap-2 text-[2rem] font-bold text-ember"><span>{I.fire}</span>{streak}</p>
        <p className="text-[12.5px] text-ink-muted mt-1">day streak{streak === 1 ? "" : "s"} · come back tomorrow to keep it going</p>
      </div>
      {canInstall && (
        <button onClick={onInstall} className="pressable w-full rounded-2xl bg-brand-600 hover:bg-brand-700 py-3.5 text-[14px] font-semibold text-white">Add Brief to home screen</button>
      )}
      <NotifyCard />
      <div className="rounded-2xl bg-white border border-line shadow-elev-1 p-4">
        <p className="text-[13px] font-semibold text-ink mb-1.5">About the Brief</p>
        <p className="text-[13px] text-ink-muted leading-relaxed">A 30-second read on Indian ESG and BRSR: SEBI, BRSR Core, CBAM, CCTS and global frameworks. Fresh news is AI-summarised and always links the source; regulatory items and guides are hand-cited. Swipe left or right to change topic.</p>
      </div>
      <div className="text-center">
        <Link href="/" className="text-[13px] font-semibold text-brand-700">Explore the full Saaksh toolkit →</Link>
      </div>
      <p className="text-[11px] text-ink-faint text-center leading-relaxed">Not legal advice. Verify the current position before advising a client. Saved items stay on this device.</p>
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
      const t = r.text || item.summary;
      setText(t); setLoading(false);
      if (r.text) cacheWhy(item.id, r.text);
    });
    return () => { live = false; };
  }, [item, text]);

  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40" />
      <div onClick={(e) => e.stopPropagation()} className="dropdown-in relative rounded-t-3xl bg-white border-t border-line shadow-elev-3 px-5 pt-4 pb-7 max-h-[70%] overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mx-auto h-1 w-10 rounded-full bg-line mb-4" />
        <p className="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-brand-700 mb-2"><span>{I.spark}</span> Why it matters</p>
        {loading ? (
          <div className="space-y-2"><div className="skeleton h-4 w-full rounded" /><div className="skeleton h-4 w-11/12 rounded" /><div className="skeleton h-4 w-4/6 rounded" /></div>
        ) : (
          <p className="text-[15px] leading-[1.6] text-ink-body">{text}</p>
        )}
        <div className="mt-4 flex items-center gap-2">
          {item.external
            ? <a href={item.href} target="_blank" rel="noreferrer" className="flex-1 text-center rounded-xl bg-band border border-line py-2.5 text-[13px] font-semibold text-ink">Read the source</a>
            : <Link href={item.href} className="flex-1 text-center rounded-xl bg-band border border-line py-2.5 text-[13px] font-semibold text-ink">Read the guide</Link>}
          <button onClick={onClose} className="rounded-xl bg-brand-600 px-4 py-2.5 text-[13px] font-semibold text-white">Done</button>
        </div>
      </div>
    </div>
  );
}
