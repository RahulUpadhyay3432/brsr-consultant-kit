"use client";
import { useEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
}

export function BlogToc() {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;

    const headings = Array.from(article.querySelectorAll("h2[data-toc]"));
    const tocItems: TocItem[] = headings
      .map((el) => ({ id: el.id, text: el.textContent?.replace(/^\d+\.\s+/, "") || "" }))
      .filter((h) => h.id && h.text);

    setItems(tocItems);
    if (tocItems.length > 0) setActiveId(tocItems[0].id);

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: 0 }
    );

    headings.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 96;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
  };

  if (items.length < 2) return null;

  return (
    <nav className="sticky top-24 pt-1">
      <p
        style={{
          fontFamily: "var(--font-hanken), -apple-system, system-ui, sans-serif",
          fontSize: "10.5px",
          fontWeight: 600,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "#5B6573",
          marginBottom: "12px",
        }}
      >
        On this page
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <button
                onClick={() => scrollTo(item.id)}
                className="w-full text-left group flex items-start gap-2.5 py-1.5 transition-all duration-150"
                style={{
                  borderLeft: `2px solid ${isActive ? "#1E9DF2" : "transparent"}`,
                  paddingLeft: "10px",
                }}
              >
                <span
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.45",
                    color: isActive ? "#0B6FD4" : "#5B6573",
                    fontWeight: isActive ? 600 : 400,
                    transition: "color 0.15s, font-weight 0.15s",
                  }}
                >
                  {item.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 pt-6 border-t border-[#E5E9F0]">
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[#0B6FD4] hover:text-[#0B5FB0] transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Try Saaksh free
        </a>
      </div>
    </nav>
  );
}
