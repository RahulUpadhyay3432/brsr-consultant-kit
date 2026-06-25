# Feature spec — the AI Compliance Importer (Pro)

A concrete, buildable sketch. **Not scheduled to build yet** — the strategy is to
validate demand first (webinar + first customers). This documents *what* it is, *how*
it reuses what we already have, and *how it stays defensible*, so when the green light
comes it's a known quantity.

Grounded in `docs/pro-strategy.md` (both consultant analyses flagged this as the single
biggest time-sink to kill).

---

## 1. The job it kills

Today, when a consultant starts a BRSR engagement, the slowest manual task is reading
the client's existing documents — last year's BRSR, the annual report, the energy
audit, the pollution-board filings — and **hand-copying the numbers** into the right
fields. It's hours of "spreadsheet archaeology."

> **Job story:** *When I take on a new client, I want to point the tool at their existing
> reports and have the numbers already filled in (for me to check), so I skip the
> copy-paste and go straight to the judgement work.*

### What we have today vs what's new
- **Today (free, on-device):** the "Upload last year's report" card runs
  `extractPdfText()` (`src/lib/pdf-extract.ts`) → `detectDisclosures()`
  (`src/lib/report-extractor.ts`), which **keyword-matches** the text and flags *which
  disclosures appear to be documented* (the "Last year" badge + snippet). It tells you
  *where* something is. It does **not** pull the actual values.
- **New (Pro):** an AI step that reads the same extracted text and **extracts the values
  and maps them to specific BRSR field ids** — Scope 1/2 numbers, energy, water,
  headcount, training %, etc. — as *suggestions you verify*. That's the leap from "this
  disclosure exists somewhere" to "here's the number, here's the sentence it came from."

---

## 2. How it works (reusing what's already built)

```
Upload PDF
  │
  ├─ extractPdfText()                     ← REUSE (src/lib/pdf-extract.ts), client-side
  │     → { text, pageCount }
  │
  ├─ AI extract + map  (NEW, Pro/backend)
  │     groqComplete(system, user)         ← REUSE the client (src/lib/datarequest/groq.ts)
  │     grounded prompt (see §3)
  │     → [ { fieldId, value, unit, sourceSnippet, confidence } ]
  │
  ├─ Review UI  (EXTEND the existing pattern)
  │     UploadCard.tsx + DisclosureRow.tsx "Last year" badge/snippet
  │     → relabel to "Imported — verify"; show value + source sentence + confidence
  │
  └─ Consultant confirms / edits each → only then written
        → ChecklistItem (free report) or Collect Item.value / priorValue
```

- **Extraction** stays the existing client-side `extractPdfText()`.
- **The AI step is new**: send the extracted text (+ a compact list of candidate fields
  with their plain-language meaning from `brsr_field_explainers.json` /
  `brsr_data_points.json`) to `groqComplete()`. Ask it to return only values that are
  literally present, each tagged with the **exact source sentence** and a confidence.
- **The review surface already exists.** `DisclosureRow.tsx` already renders a "Found in
  last year's report" block with matched keywords + an italic snippet + a "verify before
  reusing, then mark collected" line. The importer extends that exact pattern: show the
  **suggested value** + the **source sentence** + a confidence flag, with confirm/edit.
  No new review paradigm to invent.
- **Where it writes:** in the free report it sets a `ChecklistItem` to collected /
  pre-fills the value; in a Collect campaign it pre-fills `Item.value` (and later
  `priorValue` for year-on-year), which then flows into the draft + emissions calc.

---

## 3. Defensibility (this is the whole game)

Both consultant analyses said the #1 objection is **defensibility** — will the output
survive a client's review, a verifier, a regulator? An importer that silently writes a
wrong number is worse than useless; it destroys trust. So the rules, mirroring the
no-fabrication discipline already in `narrative.ts`:

1. **Extract-only, never estimate.** The model may only return values **literally
   present** in the text. No inference, no rounding, no "reasonable guess." If it isn't
   in the document, it returns nothing for that field.
2. **Every suggestion carries its source.** Each extracted value shows the **exact
   sentence/line it came from** (like today's snippet) so the consultant can eyeball it
   in one second.
3. **Confidence + graceful "I don't know".** Low-confidence or ambiguous → mark
   `[needs your input]` (the same discipline as `narrative.ts`'s `[to be completed]`),
   never a silent fill.
4. **Nothing auto-applies.** Suggestions sit in a review state; the consultant confirms
   or edits each before it's written. The human is always the decision-maker — exactly
   how the existing detection UI already behaves.
5. **Grounded model.** Reuse `gpt-oss-20b` at low temperature / low reasoning (as
   `groq.ts` already does) — deterministic, cheap, and prompted to forbid fabrication.

The pitch line: *"It drafts the data entry from your client's own documents and shows
you the source sentence for every number. You verify. It never invents a figure."*

---

## 4. Where it lives — free vs Pro (privacy boundary)

This matters and must stay crisp:
- The **free tool's on-device promise is "client data never leaves your browser."** The
  importer makes an **AI call**, which means the document text leaves the device. So the
  **importer is a Pro / backend feature** — it cannot live in the free tier without
  breaking that promise.
- **Keep the existing on-device keyword detector exactly as-is** as the *free* version
  ("which disclosures appear"). The AI importer is the *Pro* upgrade ("here are the
  numbers, verified"). Clean story: free = on-device detection; Pro = AI extraction,
  with consent, on the secure backend.
- Frame it honestly to clients: the Pro importer processes the uploaded document on the
  server to extract the numbers; it's access-controlled like the rest of Collect.

---

## 5. MVP scope vs later

**MVP (smallest thing that delivers the "wow"):**
- One **text-based PDF** at a time.
- Extract the **high-value, unambiguous fields** first: energy (kWh), fuel/diesel
  (litres), water (kL), waste (MT), Scope 1/2 (tCO₂e), headcount, training % — the
  numeric "value"/"activity" fields where extraction is reliable and the time-saving is
  biggest.
- Output: **suggested fills** in the review UI; consultant confirms → writes into the
  report checklist *or* a Collect campaign's `Item.value`.

**Defer (v2+):**
- **Scanned / image PDFs** (need OCR — `extractPdfText()` returns empty on these today;
  for MVP, detect "no text found" and tell the user to use a text PDF).
- **Multi-document** import + provenance ("this number came from the FY24 annual
  report, p.42").
- **Prior-year auto-fill** (`Item.priorValue`) for the year-on-year columns.
- **Bulk hand-off**: import → pre-fill → send the gaps straight to data owners via
  Collect.

---

## 6. Risks & constraints
- **Scanned PDFs** extract no text (no OCR). MVP: detect and tell the user; OCR is a
  later, heavier add.
- **Accuracy.** Extraction won't be perfect — which is *why* it's suggestions + source
  sentence + human verify. Never sell it as "automatic."
- **Groq free-tier limits.** The existing `groqComplete()` is best-effort / never-throws
  across 6 rotating keys; a heavy importer could hit limits. It's a paid feature, so
  paid model capacity is justified when usage grows.
- **Server-action body limit** (~12 MB) for the uploaded file/text — fine for typical
  reports; chunk long docs if needed.
- **Cost** scales with usage — acceptable because it's the Pro tier (the ROI is "weeks
  of manual mapping saved," which is exactly what consultants said they'd pay for).

---

## 7. The gate — validate before building
Don't build this on spec. Two checks first:
1. **Demand** — does it land at the webinar + with the first manual Pro customers? ("If
   I could pre-fill from last year's report and you just verify, would you pay per
   client for that?")
2. **Accuracy on real docs** — run extraction over a handful of *real* client BRSR /
   annual reports and measure how often the suggested number + source sentence are
   right. If it's reliably good on the high-value numeric fields, build the MVP. If it's
   shaky, the human-verify framing still makes it shippable, but set expectations
   accordingly.

When both check out, this is the sharpest wedge for Pro — and most of the plumbing
(extraction, the review UI, the grounded AI client) already exists.
