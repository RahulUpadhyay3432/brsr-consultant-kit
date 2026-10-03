import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { TOOL_FAQS, TOOL_FAQ_SLUGS } from "./tool-faqs";
import { toolFaqLd } from "@/lib/tool-faq";

// The tool pages are the ones with commercial intent, and before this only one
// of ten carried an FAQ. These tests exist so that stays fixed: a new tool page
// that ships without an FAQ fails here rather than being noticed a quarter
// later, and an FAQ whose schema and visible text could drift fails too.

const TOOLS_DIR = join(process.cwd(), "src/app/tools");

/** Every /tools/<slug> route on disk. */
function toolSlugs(): string[] {
  return readdirSync(TOOLS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(TOOLS_DIR, e.name, "page.tsx")))
    .map((e) => e.name)
    .sort();
}

describe("tool page FAQs", () => {
  it("covers every tool page, so a new tool cannot ship without one", () => {
    // brsr-framework-mapping predates this file and carries its own inline
    // FAQS array with the same FAQPage schema; it is exempt from the shared
    // map, not from having an FAQ.
    const exempt = new Set(["brsr-framework-mapping"]);
    const missing = toolSlugs().filter((s) => !exempt.has(s) && !TOOL_FAQS[s]);
    expect(missing, "tool pages with no FAQ block").toEqual([]);
  });

  it("defines no FAQ for a route that does not exist", () => {
    const routes = new Set(toolSlugs());
    const orphans = TOOL_FAQ_SLUGS.filter((s) => !routes.has(s));
    expect(orphans, "FAQ entries pointing at no page").toEqual([]);
  });

  it("renders the block on each page it defines, so the schema is actually emitted", () => {
    for (const slug of TOOL_FAQ_SLUGS) {
      const src = readFileSync(join(TOOLS_DIR, slug, "page.tsx"), "utf-8");
      expect(src, `${slug} imports ToolFaq`).toContain("ToolFaq");
      expect(src, `${slug} passes its own FAQ key`).toContain(`TOOL_FAQS["${slug}"]`);
    }
  });

  it("asks real questions and answers them at length", () => {
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      expect(items.length, `${slug} FAQ count`).toBeGreaterThanOrEqual(4);
      for (const f of items) {
        expect(f.q.endsWith("?"), `${slug}: "${f.q}" should be a question`).toBe(true);
        expect(f.q.length, `${slug}: "${f.q}" is too terse`).toBeGreaterThan(15);
        // Short answers are what make an FAQ rich result useless; these are
        // meant to answer the search outright.
        expect(f.a.length, `${slug}: answer to "${f.q}" is too short`).toBeGreaterThan(120);
      }
    }
  });

  it("never repeats a question across pages, so two pages don't compete for one query", () => {
    const seen = new Map<string, string>();
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      for (const f of items) {
        const key = f.q.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
        expect(seen.has(key), `"${f.q}" appears on both ${seen.get(key)} and ${slug}`).toBe(false);
        seen.set(key, slug);
      }
    }
  });

  it("does not repeat a question within a page", () => {
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      const qs = items.map((f) => f.q.toLowerCase());
      expect(new Set(qs).size, `${slug} has a duplicate question`).toBe(qs.length);
    }
  });

  it("keeps the privacy claim to the on-device tools only", () => {
    // The standing rule: "nothing leaves your browser" belongs to the free
    // on-device tools. Every page in this map is one, but an answer that makes
    // the claim must not also describe sending data somewhere.
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      for (const f of items) {
        const claimsLocal = /nothing is sent|runs? (?:on your device|entirely in your browser|in your browser)|nothing leaves your browser|nothing is stored|nothing uploaded/i.test(f.a);
        if (claimsLocal) {
          expect(
            /\bsent to\b|\buploaded to\b|\bGroq\b|\bGemini\b|\bour server/i.test(f.a),
            `${slug}: "${f.q}" claims on-device and also describes sending data`,
          ).toBe(false);
        }
      }
    }
  });

  it("avoids the superlatives the product has banned elsewhere", () => {
    // "only tool", "the first", "best" — the competitor research concluded we
    // cannot stand behind any of them.
    const banned = /\b(only (?:free )?(?:tool|software|platform)|the first \w+ to|best[- ]in[- ]class|world'?s (?:first|best))\b/i;
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      for (const f of items) {
        expect(banned.test(f.a), `${slug}: "${f.q}" makes an unprovable claim`).toBe(false);
        expect(banned.test(f.q), `${slug}: question "${f.q}" makes an unprovable claim`).toBe(false);
      }
    }
  });

  it("builds valid FAQPage schema with one entity per visible question", () => {
    for (const [slug, items] of Object.entries(TOOL_FAQS)) {
      const ld = toolFaqLd(items) as {
        "@type": string;
        mainEntity: { "@type": string; name: string; acceptedAnswer: { "@type": string; text: string } }[];
      };
      expect(ld["@type"]).toBe("FAQPage");
      expect(ld.mainEntity, slug).toHaveLength(items.length);
      ld.mainEntity.forEach((e, i) => {
        expect(e["@type"]).toBe("Question");
        // The schema text must be the visible text — a rich result that
        // promises an answer the page does not contain is worse than none.
        expect(e.name).toBe(items[i].q);
        expect(e.acceptedAnswer.text).toBe(items[i].a);
      });
    }
  });

  it("returns schema for an empty list without crashing", () => {
    expect((toolFaqLd([]) as { mainEntity: unknown[] }).mainEntity).toEqual([]);
  });
});
