// Pure, deterministic keyword search for the help "ask" bot. No AI: a question is
// tokenised and scored against each topic's keywords + title. Runs on-device, so
// it can never fabricate an answer, it only ranks the curated help_topics.json.

export interface HelpTopic {
  id: string;
  title: string;
  category: "howto" | "glossary";
  keywords: string[];
  answer: string;
}

// Common words that carry no matching signal, dropped so "where is the csv" and
// "csv" score the same topic.
const STOPWORDS = new Set([
  "a", "an", "the", "is", "are", "am", "was", "were", "be", "been", "being",
  "what", "whats", "how", "do", "does", "did", "doing", "i", "my", "me", "we",
  "to", "of", "in", "on", "for", "and", "or", "it", "its", "this", "that",
  "where", "when", "why", "can", "could", "should", "would", "you", "your",
  "with", "at", "by", "as", "if", "so", "about", "from", "get", "got", "there",
  "here", "any", "some", "will", "shall", "into", "out", "up",
]);

function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

/**
 * Rank help topics against a free-text question.
 * Scoring: +1 per query token found in the topic's keyword/title tokens,
 * an extra +1 when the match is in the title (titles weigh double), and +2 when
 * a whole keyword phrase appears verbatim in the question. Topics scoring 0 are
 * dropped; callers show a fallback when the result is empty.
 */
export function searchHelp(query: string, topics: HelpTopic[], limit = 4): HelpTopic[] {
  const q = (query || "").toLowerCase().trim();
  const queryTokens = tokenize(q);
  if (queryTokens.length === 0) return [];

  const scored = topics
    .map((topic) => {
      const titleTokens = new Set(tokenize(topic.title));
      const keywordTokens = new Set(topic.keywords.flatMap((k) => tokenize(k)));

      let score = 0;
      for (const qt of queryTokens) {
        if (keywordTokens.has(qt)) score += 1;
        if (titleTokens.has(qt)) score += 1; // title hits count double
      }
      // Verbatim multi-word keyword phrase in the question is a strong signal.
      for (const k of topic.keywords) {
        const kl = k.toLowerCase();
        if (kl.includes(" ") && q.includes(kl)) score += 2;
      }
      return { topic, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.topic.title.length - b.topic.title.length);

  return scored.slice(0, limit).map((s) => s.topic);
}
