// Pure FAQ logic, deliberately separate from the component that renders it:
// the schema builder is the part worth testing, and the test runner only
// transforms .ts, so keeping this out of ToolFaq.tsx is what makes
// tool-faqs.test.ts able to assert that the JSON-LD matches the visible text.

export type FaqItem = { q: string; a: string };

/**
 * FAQPage schema built from the same array the accordion renders, so a rich
 * result can never promise an answer the page does not contain.
 */
export function toolFaqLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
