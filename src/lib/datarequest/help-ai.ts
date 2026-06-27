"use server";

// Grounded "Ask Saaksh" assistant. It is RAG, not a model trained on the product:
// every answer is built from (a) a fixed, accurate PRODUCT_MAP of the real navigation
// and feature names, and (b) the top help-KB topics retrieved by on-device keyword
// search. The model is told to name ONLY controls that appear in those, so it can't
// invent UI labels or steps. Best-effort, never throws; returns { answer: null } on
// any failure so HelpWidget falls back to plain keyword search.

import { groqComplete } from "./groq";
import { searchHelp } from "@/lib/help-search";
import helpData from "@/data/help_topics.json";
import type { HelpTopic } from "@/lib/help-search";

const TOPICS = (helpData as { topics: HelpTopic[] }).topics;

// The authoritative description of the real product. Sent on EVERY call so the model
// always has the correct screen / tab / button names and never has to guess them.
// Keep this in sync with the actual UI when the navigation changes.
const PRODUCT_MAP = [
  "SAAKSH PRODUCT MAP (the real navigation; use these exact names, do not invent others):",
  "Saaksh has two parts: a FREE on-device tool and a PRO 'Collect' workspace. (A 'collection' is the same thing the code calls a 'campaign'.)",
  "FREE tool (no login). The home page '/' has a 'Start a free report' button leading to '/start', a short intake (client name, industry, company size, existing compliance filings). It instantly generates a report at '/report' with: an 'Action Plan' (the 108 Section-C disclosures, each marked 'Ready to pull', 'Needs verification', or 'Collect fresh', with built-in GHG / energy / water calculators on the P6 rows and an 'Upload last year's report' card), a 'Suggested Materiality' tab, a 'Beyond BRSR' tab (CBAM and CCTS readiness checks), an 'Alignment' accordion (GRI / TCFD / IFRS / TNFD and MSCI / DJSI crosswalk), plus 'Templates' and 'Sources'. Exports: 'Export CSV' and a 'Download PDF' client brief. Nothing is uploaded; it all runs in the browser.",
  "PRO tool 'Collect' (login-gated, at '/requests'). A left sidebar lists: 'Dashboard', 'New collection', the consultant's collections (one per client), then 'Proposals', 'CBAM', 'Profile', and 'Free readiness tool'.",
  "'Dashboard' (/requests) shows summary tiles (clients, data collected %, awaiting, ready to draft) and the list of collections; each collection card has a '...' menu to delete it.",
  "'New collection' creates a client: type the company name (an autocomplete suggests known companies), choose the reporting period and a deadline, then 'Create collection'. It opens on the Auto-fill tab.",
  "Opening a collection shows the client header (with an 'Edit' button to change the deadline / reporting period) above a row of TABS: 'Overview', 'Auto-fill', 'Readiness', 'Owners', 'Data', 'Emissions', 'Draft'.",
  "Overview tab: status tiles, a status donut, an 'Owner tracking' list (when each owner was emailed and when they sent their data), and 'Export assurance ledger (CSV)'.",
  "Auto-fill tab: 'Choose documents' to upload any of the client's existing documents (last year's BRSR, annual report, bills, policies). The AI reads each one and returns suggested values across the BRSR fields, each with the exact source sentence and a confidence badge. You tick the ones you trust and apply them; nothing auto-applies.",
  "Readiness tab: how many of the 108 Section-C disclosures are 'ready' (a value is collected) versus 'to collect'.",
  "Owners tab: '+ Add a data owner' (enter name and email, or pick a saved contact, then choose that owner's BRSR fields). Saaksh emails the owner a no-login link and auto-reminds anyone pending; there is also a 'Remind all pending' button. (There is no drag-and-drop.)",
  "Data and Emissions tabs: the collected values, and the Scope 1 & 2 emissions auto-computed from submitted activity data, each figure attributed to who provided it.",
  "Draft tab / 'Generate draft': a deterministic printable BRSR draft grouped by Section and Principle, with an optional grounded 'AI narrative' per principle (labelled review-before-filing; it never invents or changes a number).",
  "Applying auto-filled values OR owner submissions writes to the SAME collected-data pool, so Data, Readiness, Emissions and the Draft all update together from one upload or one submission.",
  "Other Pro tools: 'Proposals' (/requests/proposal) scopes and prices an engagement; 'CBAM' (/requests/cbam) is an embedded-emissions screening with its own document auto-fill; 'Profile' (/requests/profile) stores your name, firm and default rates.",
].join("\n");

const SYSTEM = [
  "You are Saaksh's in-app assistant for Indian ESG consultants doing BRSR.",
  "You answer two kinds of questions: (1) how to use Saaksh (navigation, what to do next, Free vs Pro), and (2) BRSR / SEBI basics.",
  "You are given a PRODUCT MAP (the real navigation and feature names) and extra KNOWLEDGE-BASE CONTEXT. Use ONLY these, plus widely-known BRSR / SEBI basics.",
  "STRICT RULE for any product or how-to answer: name ONLY the screens, tabs, buttons and steps that appear in the PRODUCT MAP or context, written exactly as they are there. Do NOT invent, rename or guess any UI label (for example there is no 'Pro tab' and no 'Create campaign' button), and do NOT invent interactions such as drag-and-drop. If the map and context do not name a control, describe the action in plain words without naming a button.",
  "If the map and context do not fully answer a navigation question, give only the flow they DO support and say the exact controls are visible on the relevant screen, rather than fabricating a detailed click-path.",
  "NEVER invent regulatory facts, numbers, citations, deadlines, product features, UI labels or steps. When unsure whether something is real, leave it out.",
  "If the user just greets you, thanks you, or sends a vague opener ('hi', 'hello', 'what can you do', 'help'), reply warmly in ONE friendly line offering what you help with (checking BRSR readiness, auto-filling data from uploaded documents, collecting data from a client's team, and drafting the report), then invite a specific question. Never say you have no information for a greeting.",
  "Only for a genuine question the map and context truly do not cover, say so briefly and suggest opening Compliance Chat.",
  "FORMAT as scannable markdown: open with ONE short plain-language summary line, then 2-6 steps or key points.",
  "Use a numbered list ('1. ', '2. ') for an ordered how-to sequence, or '- ' bullets otherwise. Bold the key term at the start of each step with double asterisks.",
  "Keep it tight: a one-sentence summary, one line per step, no preamble and no closing pleasantries.",
].join(" ");

export async function askSaaksh(question: string): Promise<{ answer: string | null }> {
  try {
    const q = (question || "").trim();
    if (!q) return { answer: null };

    const grounding = searchHelp(q, TOPICS, 4);
    const context = grounding.length
      ? grounding.map((t) => `- ${t.title}: ${t.answer}`).join("\n")
      : "(no extra knowledge-base entries matched; rely on the product map above)";

    const user = [
      PRODUCT_MAP,
      "",
      "Knowledge-base context (extra detail for this question):",
      context,
      "",
      `Question: ${q}`,
    ].join("\n");

    // temperature 0: factual, no creative embellishment of the navigation.
    const text = await groqComplete(SYSTEM, user, { maxTokens: 340, temperature: 0 });
    return { answer: typeof text === "string" && text.trim() ? text.trim() : null };
  } catch {
    return { answer: null };
  }
}
