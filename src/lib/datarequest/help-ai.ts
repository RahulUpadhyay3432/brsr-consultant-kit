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
  "You help with two kinds of questions: (1) how to use Saaksh (product navigation, what to do next, Free vs Pro, Collect, the importer, drafts, the assurance ledger, reminders, CBAM readiness), and (2) BRSR/SEBI basics.",
  "For product-usage questions ('how do I…', 'what do I do next', 'how do I navigate'), answer plainly from the provided knowledge-base context, describing the real product flow.",
  "Answer ONLY using the provided knowledge-base context plus widely-known BRSR/SEBI basics.",
  "NEVER invent regulatory facts, numbers, citations, deadlines, or product features that aren't in the context.",
  "If the user just greets you, thanks you, or sends a vague opener ('hi', 'hello', 'hey', 'what can you do', 'help'), reply warmly in ONE friendly line that offers what you help with — checking BRSR readiness, auto-filling data from their uploaded documents, collecting data from a client's team, and drafting the report — then invite a specific question. Never say you have no information for a greeting or small talk.",
  "Only for a genuine question the knowledge base truly doesn't cover, say so briefly and suggest opening Compliance Chat.",
  "FORMAT your answer as scannable markdown: open with ONE short plain-language summary line, then give 2-5 steps or key points.",
  "Use a numbered list ('1. ', '2. ') for an ordered how-to sequence, or '- ' bullets for an unordered set of points.",
  "Bold the key term at the start of each step with double asterisks, e.g. '1. **Start a report** — click ...'.",
  "Keep it tight: the summary is one sentence, each step is one line. No preamble, no closing pleasantries.",
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
