import { describe, it, expect } from "vitest";
import { searchHelp, type HelpTopic } from "@/lib/help-search";
import helpData from "@/data/help_topics.json";

const TOPICS = (helpData as { topics: HelpTopic[] }).topics;

describe("searchHelp", () => {
  it("finds the CSV export topic from 'where is the csv'", () => {
    expect(searchHelp("where is the csv", TOPICS)[0].id).toBe("csv-export");
  });

  it("answers a glossary question: 'what is scope 2'", () => {
    expect(searchHelp("what is scope 2", TOPICS)[0].id).toBe("scopes");
  });

  it("matches the persistence topic from a natural question", () => {
    const ids = searchHelp("will i lose my progress if i restart", TOPICS).map((t) => t.id);
    expect(ids).toContain("save-progress");
  });

  it("answers 'what is brsr'", () => {
    expect(searchHelp("what is brsr", TOPICS)[0].id).toBe("brsr");
  });

  it("matches 'how do I mark something collected'", () => {
    const ids = searchHelp("how do i mark something collected", TOPICS).map((t) => t.id);
    expect(ids).toContain("mark-collected");
  });

  it("returns nothing for gibberish", () => {
    expect(searchHelp("xyzzy qwerty zzz", TOPICS)).toEqual([]);
  });

  it("returns nothing for a blank query", () => {
    expect(searchHelp("   ", TOPICS)).toEqual([]);
  });

  it("respects the result limit", () => {
    expect(searchHelp("brsr data report", TOPICS, 3).length).toBeLessThanOrEqual(3);
  });
});
