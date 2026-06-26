"use server";

// Grounded "Ask Saaksh" AI assistant. Takes the consultant's free-text question,
// retrieves the top help-KB topics via the on-device keyword search, and asks Groq
// to answer using ONLY that context plus widely-known BRSR/SEBI basics. Hard
// no-fabrication posture: the model is told never to invent regulatory facts,
// numbers, citations, deadlines or product features. Best-effort, never throws —
// returns { answer: null } on any failure so HelpWidget falls back to keyword search.

import { groqComplete } from "./groq";
import { searchHelp } from "@/lib/help-search";
import helpData from "@/data/help_topics.json";
import type { HelpTopic } from "@/lib/help-search";

const TOPICS = (helpData as { topics: HelpTopic[] }).topics;

const SYSTEM = [
  "You are Saaksh's assistant for Indian ESG consultants doing BRSR.",
  "Answer ONLY using the provided knowledge-base context plus widely-known BRSR/SEBI basics.",
  "NEVER invent regulatory facts, numbers, citations, deadlines, or product features.",
  "If the context doesn't cover it, say so briefly and suggest opening Compliance Chat.",
  "Be concise (2-4 sentences), plain, professional, no preamble.",
].join(" ");

export async function askSaaksh(question: string): Promise<{ answer: string | null }> {
  try {
    const q = (question || "").trim();
    if (!q) return { answer: null };

    const grounding = searchHelp(q, TOPICS, 4);
    const context = grounding.length
      ? grounding.map((t) => `- ${t.title}: ${t.answer}`).join("\n")
      : "(no matching knowledge-base entries found)";

    const user = [
      "Knowledge-base context:",
      context,
      "",
      `Question: ${q}`,
    ].join("\n");

    const text = await groqComplete(SYSTEM, user, { maxTokens: 320, temperature: 0.2 });
    return { answer: typeof text === "string" && text.trim() ? text.trim() : null };
  } catch {
    return { answer: null };
  }
}
