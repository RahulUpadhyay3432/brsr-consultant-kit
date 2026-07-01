"use client";

import { useState } from "react";
import Link from "next/link";
import { BlogFooter } from "@/components/blog/BlogFooter";
import { ToolHero } from "@/components/tools/ToolHero";
import { LATEST, LATEST_TAGS, type LatestItem } from "@/lib/latest";
import { SubscribeForm } from "@/components/SubscribeForm";
import { track } from "@/lib/mixpanel";

function ArrowUpRight() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17L17 7M7 7h10v10" />
    </svg>
  );
}
function ArrowRight() {
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function ItemCard({ item }: { item: LatestItem }) {
  const isReg = item.kind === "regulation";
  const onClick = () => track("latest_item_clicked", { tag: item.tag, kind: item.kind });

  const inner = (
    <>
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.05em] rounded px-1.5 py-0.5 ${isReg ? "text-[#C24428] bg-[#FFF1ED] border border-[#F8C9BD]" : "text-brand-700 bg-brand-50 border border-[#CDE2F6]"}`}>
          {item.tag}
        </span>
        <span className="text-[12px] font-medium text-ink-muted">{item.displayDate}</span>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-faint">
          {isReg ? "Update" : "Guide"}
        </span>
      </div>
      <h3 className="text-[16.5px] font-semibold text-ink leading-snug tracking-[-0.01em] group-hover:text-brand-700 transition-colors">
        {item.title}
      </h3>
      <p className="text-[13.5px] text-ink-body leading-relaxed mt-2 flex-1">{item.summary}</p>
      <div className="flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-brand-700 group-hover:gap-2 transition-all">
        {isReg ? (
          <>Read the source{item.sourceLabel ? `: ${item.sourceLabel}` : ""} <ArrowUpRight /></>
        ) : (
          <>Read the guide <ArrowRight /></>
        )}
      </div>
    </>
  );

  const cls = "group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-elev-1 hover:shadow-elev-2 hover:-translate-y-0.5 transition-all";
  return item.external ? (
    <a href={item.href} target="_blank" rel="noreferrer" onClick={onClick} className={cls}>{inner}</a>
  ) : (
    <Link href={item.href} onClick={onClick} className={cls}>{inner}</Link>
  );
}

export default function LatestPage() {
  const [tag, setTag] = useState<string>("all");
  const items = tag === "all" ? LATEST : LATEST.filter((i) => i.tag === tag);

  return (
    <div className="min-h-screen bg-page flex flex-col">
      <main className="flex-1">
        <ToolHero
          active="latest"
          eyebrow="Latest · regulation & guidance"
          title="What changed, and what to prepare for"
          subtitle="The regulatory moves an Indian BRSR and ESG consultant should be tracking, cited to the primary source, alongside the newest guides from the Saaksh blog. Check back before you brief a client."
          maxWidth={1180}
        />

        <div className="anim-up-sm mx-auto w-full px-5 sm:px-8 py-10" style={{ maxWidth: 1180 }}>
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2 mb-7">
            <button onClick={() => setTag("all")}
              className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${tag === "all" ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line hover:border-brand-300"}`}>
              All
            </button>
            {LATEST_TAGS.map((t) => (
              <button key={t} onClick={() => setTag(t)}
                className={`text-[13px] font-medium px-3.5 py-1.5 rounded-lg border transition-colors ${tag === t ? "bg-brand-600 text-white border-brand-600" : "bg-white text-ink-body border-line hover:border-brand-300"}`}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {/* Newsletter capture */}
          <div className="mt-8">
            <SubscribeForm variant="strip" source="latest" />
          </div>

          <p className="text-[13px] text-ink-muted leading-relaxed mt-8">
            Regulatory items link to the primary source and are a starting point, not legal advice. Verify the current position before advising a client. Longer explainers live on the{" "}
            <Link href="/blog" className="text-brand-700 font-semibold underline decoration-line hover:decoration-brand-500">Saaksh blog</Link>.
          </p>
        </div>
      </main>
      <BlogFooter />
    </div>
  );
}
