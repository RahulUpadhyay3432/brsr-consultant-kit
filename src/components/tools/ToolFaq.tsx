import { jsonLdHtml } from "@/lib/jsonld";
import { toolFaqLd, type FaqItem } from "@/lib/tool-faq";

// Shared FAQ block for the /tools/* pages: the visible accordion and the
// FAQPage JSON-LD from one array, so the page and the schema can never
// disagree. That pairing is the whole point — a rich result that promises an
// answer the page does not contain is worse than no rich result.
//
// Only one tool page had an FAQ before this; the other nine are the pages with
// commercial intent, and the questions people actually type ("is BRSR
// mandatory for my company", "which CEA factor do I use") were answered in our
// blog posts and nowhere near the tool that does the work.
//
// Rule for authoring a FaqItem: the answer must be true of THIS page and
// derivable from what the page already says. Do not promise a feature here to
// win a query.

export type { FaqItem };
export { toolFaqLd };

export function ToolFaq({
  items,
  title = "Frequently asked questions",
  maxWidth = 1120,
}: {
  items: FaqItem[];
  title?: string;
  maxWidth?: number;
}) {
  if (items.length === 0) return null;
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(toolFaqLd(items)) }} />
      <section className="bg-band border-t border-line-soft">
        <div className="mx-auto w-full px-5 sm:px-8 py-16" style={{ maxWidth }}>
          <h2 className="font-editorial font-semibold text-ink text-[1.8rem] sm:text-[2.1rem] leading-tight tracking-[-0.015em] mb-6">
            {title}
          </h2>
          <div className="rounded-2xl border border-line bg-white shadow-elev-1 overflow-hidden max-w-[820px]">
            {items.map((f, i) => (
              <details key={f.q} className={i > 0 ? "border-t border-line-soft" : ""}>
                <summary className="flex items-center justify-between gap-3 cursor-pointer px-5 py-4 text-[15px] font-semibold text-ink list-none">
                  {f.q}
                  <svg
                    className="w-4 h-4 text-ink-faint flex-shrink-0" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </summary>
                <p className="px-5 pb-4 text-[14px] text-ink-body leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
