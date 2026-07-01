"use client";

import { useState, useMemo, CSSProperties } from "react";
import Link from "next/link";
import { BLOG_POSTS, formatDate, CATEGORY_COLORS, BlogCategory, BlogPost } from "@/data/blog-posts";
import { BlogCoverArt } from "@/components/blog/BlogCoverArt";
import { BlogHeader } from "@/components/blog/BlogHeader";
import { BlogFooter } from "@/components/blog/BlogFooter";

const ALL_CATEGORIES: BlogCategory[] = ["BRSR", "Regulation", "GHG & Emissions", "How-to", "Case Studies"];

// Editorial serif (Newsreader, loaded app-wide) for titles + display headings.
const SERIF: CSSProperties = { fontFamily: "var(--font-newsreader), Georgia, serif" };

function CategoryChip({ category }: { category: BlogCategory }) {
  const c = CATEGORY_COLORS[category];
  return (
    <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full shrink-0"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {category}
    </span>
  );
}

/* Neutral byline, brand, not a person. */
function Byline({ date, className = "" }: { date: string; className?: string }) {
  return (
    <span className={`text-[11.5px] text-[#5B6573] ${className}`}>
      <span className="font-semibold text-[#0F172A]">Saaksh</span> · {formatDate(date)}
    </span>
  );
}

/* ── Editor's Pick, large featured card ──────────────────────────────────── */
function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid md:grid-cols-2 rounded-2xl bg-white border border-[#E5E9F0] overflow-hidden transition-shadow duration-200 hover:shadow-elev-2"
      style={{ boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 6px 18px rgba(15,30,51,0.06)" }}
    >
      <BlogCoverArt post={post} className="w-full aspect-[16/10] md:aspect-auto md:h-full md:min-h-[320px]" />
      <div className="flex flex-col justify-center p-7 lg:p-9 gap-3.5">
        <div className="flex items-center gap-2.5">
          <CategoryChip category={post.category} />
          <span className="text-[11.5px] text-[#5B6573]">{post.readTime}</span>
        </div>
        <h2
          className="text-[#0F172A] leading-[1.18] tracking-[-0.01em] group-hover:text-[#0B6FD4] transition-colors duration-150"
          style={{ ...SERIF, fontWeight: 600, fontSize: "clamp(1.5rem, 2.4vw, 2.05rem)" }}
        >
          {post.title}
        </h2>
        <p className="text-[14.5px] leading-[1.65] text-[#48505C] line-clamp-3">{post.excerpt}</p>
        <div className="flex items-center gap-3 pt-1.5">
          <Byline date={post.date} />
          <span className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0B6FD4]">
            Read article
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3} strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ── Insight card (Latest grid) ───────────────────────────────────────────── */
function InsightCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col rounded-2xl bg-white border border-[#E5E9F0] overflow-hidden transition-all duration-200 hover:shadow-elev-2 hover:-translate-y-0.5"
      style={{ boxShadow: "0 1px 2px rgba(15,30,51,0.04), 0 4px 12px rgba(15,30,51,0.05)" }}
    >
      <BlogCoverArt post={post} className="w-full aspect-[16/9]" />
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        <div className="flex items-center gap-2">
          <CategoryChip category={post.category} />
          <span className="text-[11px] text-[#5B6573]">{post.readTime}</span>
        </div>
        <h3
          className="text-[#0F172A] leading-[1.25] tracking-[-0.005em] group-hover:text-[#0B6FD4] transition-colors duration-150"
          style={{ ...SERIF, fontWeight: 600, fontSize: "1.22rem" }}
        >
          {post.title}
        </h3>
        <p className="text-[13px] leading-[1.6] text-[#5B6573] line-clamp-2 flex-1">{post.excerpt}</p>
        <div className="pt-2 border-t border-[#EEF1F6] mt-auto">
          <Byline date={post.date} />
        </div>
      </div>
    </Link>
  );
}

/* ── Compact row (More articles) ──────────────────────────────────────────── */
function CompactRow({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex items-center gap-4 py-4 border-b border-[#EEF1F6] last:border-b-0 transition-colors duration-150 hover:bg-[#F5F8FD] -mx-4 px-4 rounded-xl"
    >
      <BlogCoverArt post={post} className="shrink-0 rounded-lg overflow-hidden w-[116px] h-[68px]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <CategoryChip category={post.category} />
          <span className="text-[11px] text-[#5B6573]">{post.readTime}</span>
        </div>
        <h3
          className="text-[#0F172A] leading-snug group-hover:text-[#0B6FD4] transition-colors duration-150 line-clamp-1"
          style={{ ...SERIF, fontWeight: 600, fontSize: "1.05rem" }}
        >
          {post.title}
        </h3>
        <p className="text-[12.5px] text-[#5B6573] line-clamp-1 leading-relaxed mt-0.5">{post.excerpt}</p>
      </div>
      <span className="shrink-0 hidden sm:block text-[12px] text-[#5B6573]">{formatDate(post.date)}</span>
    </Link>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function BlogIndexPage() {
  const [activeCategory, setActiveCategory] = useState<BlogCategory | null>(null);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let posts = BLOG_POSTS;
    if (activeCategory) posts = posts.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      posts = posts.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return posts;
  }, [activeCategory, search]);

  const isFiltering = !!activeCategory || search.trim().length > 0;
  const source = isFiltering ? filtered : BLOG_POSTS;
  const featured = isFiltering ? null : source[0];
  const latest = isFiltering ? source : source.slice(1, 7);
  const more = isFiltering ? [] : source.slice(7);

  return (
    <div className="min-h-screen bg-[#FBFCFE] flex flex-col">
      <BlogHeader />

      <main className="flex-1">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-20">

          {/* Editorial hero */}
          <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-14 items-end mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1E9DF2]" />
                <span className="font-mono text-[11px] font-semibold tracking-[0.14em] uppercase text-[#0B5FB0]">Saaksh Blog</span>
              </div>
              <h1
                className="text-[#0F172A] leading-[1.05] tracking-[-0.02em]"
                style={{ ...SERIF, fontWeight: 600, fontSize: "clamp(2.1rem, 4.2vw, 3.3rem)", textWrap: "balance" }}
              >
                BRSR &amp; ESG, made clear for Indian consultants.
              </h1>
            </div>
            <p className="text-[15.5px] leading-[1.7] text-[#48505C] lg:pb-2 max-w-[440px]">
              Practical guidance on BRSR, SEBI regulation, GHG calculations, and assurance, written for the
              consultants who file these reports. Cited to SEBI &amp; ICAI, no fluff.
            </p>
          </div>

          {/* Filter + search */}
          <div className="flex items-center gap-2 flex-wrap mb-12 pb-6 border-b border-[#E5E9F0]">
            <button
              onClick={() => { setActiveCategory(null); setSearch(""); }}
              className="text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150"
              style={activeCategory === null && !search
                ? { backgroundColor: "#0F1E33", color: "#FFFFFF" }
                : { backgroundColor: "#EFF3FA", color: "#5B6573" }}
            >
              All Posts
            </button>
            {ALL_CATEGORIES.map((cat) => {
              const c = CATEGORY_COLORS[cat];
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(isActive ? null : cat); setSearch(""); }}
                  className="text-[13px] font-semibold px-3.5 py-1.5 rounded-full transition-colors duration-150"
                  style={isActive
                    ? { backgroundColor: c.text, color: "#FFFFFF" }
                    : { backgroundColor: "#EFF3FA", color: "#5B6573" }}
                >
                  {cat}
                </button>
              );
            })}
            <div className="ml-auto flex items-center gap-2 border border-[#E5E9F0] rounded-full px-3.5 py-1.5 bg-white min-w-[200px]"
              style={{ boxShadow: "0 1px 2px rgba(15,30,51,0.04)" }}>
              <svg className="w-3.5 h-3.5 text-[#5B6573] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setActiveCategory(null); }}
                placeholder="Search articles"
                className="text-[13px] text-[#0F172A] placeholder-[#5B6573] outline-none bg-transparent flex-1 min-w-0"
              />
              {search && (
                <button onClick={() => setSearch("")} className="text-[#5B6573] hover:text-[#0F172A]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {source.length === 0 ? (
            <div className="py-20 text-center text-[#5B6573] text-[15px]">
              No articles match &ldquo;{search || activeCategory}&rdquo;.
            </div>
          ) : (
            <>
              {/* Editor's Pick */}
              {featured && (
                <section className="mb-16">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="font-mono text-[10.5px] font-semibold tracking-[0.14em] uppercase text-[#8A6516]">Editor&rsquo;s pick</span>
                  </div>
                  <FeaturedCard post={featured} />
                </section>
              )}

              {/* Latest Insights */}
              {latest.length > 0 && (
                <section className="mb-16">
                  <h2
                    className="text-[#0F172A] tracking-[-0.01em] mb-6"
                    style={{ ...SERIF, fontWeight: 600, fontSize: "1.5rem" }}
                  >
                    {isFiltering ? "Articles" : "Latest insights"}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {latest.map((post) => <InsightCard key={post.slug} post={post} />)}
                  </div>
                </section>
              )}

              {/* More articles */}
              {more.length > 0 && (
                <section>
                  <h2
                    className="text-[#0F172A] tracking-[-0.01em] mb-3"
                    style={{ ...SERIF, fontWeight: 600, fontSize: "1.5rem" }}
                  >
                    More articles
                  </h2>
                  <div className="flex flex-col">
                    {more.map((post) => <CompactRow key={post.slug} post={post} />)}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </main>

      <BlogFooter />
    </div>
  );
}
