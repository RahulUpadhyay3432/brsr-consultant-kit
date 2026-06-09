# Product North Star — BRSR Consultant Kit

> The one-page reference every new feature is checked against, so the product stays **scalable, intuitive, and uncluttered** as it grows. If a change can't pass the checklist at the bottom, it doesn't ship.

---

## 1. The job (Jobs-to-be-Done)

**Primary user:** an independent ESG consultant in India preparing a client's BRSR report.

**The job they hire us for:** *"When I take on a BRSR client, help me quickly see what I need to collect, what they already have, and how to deliver it credibly — so I look expert and save days of manual work."*

**The struggling moment:** staring at a blank BRSR format, not knowing what's already covered by existing filings, what's irrelevant to this client, or where each number comes from.

**Success looks like:** within minutes, a client-ready, defensible plan — and over time, the actual numbers — without setup, signup, or risk to confidential data.

Everything below serves that job. A feature that doesn't move it is clutter, however clever.

---

## 2. Product principles (the gate)

1. **One primary job per surface.** Each screen/tab/panel has a single obvious purpose. If a surface is doing two jobs, split it.
2. **Progressive disclosure by default.** Show the essential; reveal depth on demand. New depth goes *inside* an existing surface (expand/accordion) before it becomes a new top-level thing.
3. **Trust is the product.** Accuracy, citations (SEBI/ICAI), and privacy (client docs never leave the browser) are features, not footnotes. Never fabricate data. Never overclaim ("Suggested Materiality," not "Materiality Assessment").
4. **Zero-setup speed.** No login, no backend, instant. Protect this — it's a core differentiator and a trust signal.
5. **Every output is client-ready.** A consultant should be able to put any screen in front of their client without editing. Language is plain, professional, and India-specific.
6. **Calm over dense.** White space, clear hierarchy, no wall of options. The consultant should never feel overwhelmed or unsure what to do next.

---

## 3. Value-vs-clutter test (Kano-lite)

Before building anything, classify it and answer three questions:

- **Must-have** (absence breaks trust) · **Performance** (more is better) · **Delighter** (unexpected value) · **Clutter** (adds noise, not job-progress).
- Then: **(a)** Which step of the consultant's job does this advance? **(b)** Could it live *inside* an existing surface instead of adding a new one? **(c)** What does it let us *remove or simplify*?

If the honest answer to (a) is "none," stop. If (b) is "yes," do that.

---

## 4. Information architecture (the scaling spine)

**Current state:** Report = header (identity + gap stats) → 2 tabs (Action Plan, Suggested Materiality) → 2 stacked accordions (Frameworks, ESG Ratings) → an upload card and best-practices/SEBI-source nested inside checklist rows.

**The risk:** as features land (calculators, peer benchmarking, CBAM, data-request export), stacking more tabs/accordions turns the report into an overwhelming scroll — the exact opposite of principle #6.

**Target model — a small, stable set of top-level "workspaces," each a distinct job:**

| Workspace | Job | Holds |
|---|---|---|
| **Plan** | "What do I collect, and what's already covered?" | Action Plan checklist (+ upload-to-detect, best practices, SEBI source, and field-level **calculators** — all via progressive disclosure inside rows) |
| **Materiality** | "What's material for this client?" | Suggested material topics |
| **Alignment** | "How does this map to other frameworks/ratings?" | GRI/TCFD/IFRS **and** MSCI/DJSI (merge today's two accordions here) |
| **Deliver** *(future)* | "Get it out the door" | Save-as-PDF, client data-request export, benchmarking |

**The rule for new features:**
- If it deepens an existing job → it lives *inside* that workspace via progressive disclosure (preferred).
- It earns a *new* top-level workspace only if it is a genuinely distinct job.
- Never add a 5th/6th stacked accordion to the report root. Consolidate instead.

---

## 5. Architecture & scalability conventions (code)

So the codebase absorbs features without tangling:

- **Feature-module pattern.** Each feature = its own data (`src/data/*.json`) + optional logic (`src/lib/*.ts`) + presentational component (`src/components/…`), composed in a container. New feature = new module, not new branches inside an existing giant component.
- **Component size budget: ~300 lines.** Past that, decompose. **`DataChecklist.tsx` is 1,118 lines and is the top refactor priority** — split into `useChecklistState` (filters/collected/upload state), `ChecklistFilters`, `UploadCard`, `DisclosureRow`, and field-level sub-components (`BestPractices`, `SebiSource`, future `EmissionsCalculator`) that render inside the expanded row.
- **One report model.** Prefer routing client-dependent outputs through `report-generator.ts`; static, client-independent content (best practices, ratings, companies) is imported in its component. Keep this split explicit and consistent.
- **Persistence (before the tool becomes a workflow).** Collected-state, upload detections, and especially calculator inputs must survive a refresh. Use `localStorage` keyed by a report id — still 100% client-side, still privacy-safe. Plan this *before* shipping calculators.
- **Privacy invariant.** No client data leaves the browser. Any future server/AI feature is opt-in, explicit, and never the default.
- **Performance budget.** Keep the main bundle lean; heavy deps (pdf.js) stay dynamically imported. The report should render instantly.
- **Accuracy invariant.** Regulatory content (SEBI language, emission factors, framework mappings) is cited to a source and versioned. A wrong factor mis-states a client's numbers — treat it as a correctness bug.

---

## 6. The per-feature checklist (ship gate)

Before building, and before shipping, a feature must pass:

- [ ] **Job:** advances a named step of the consultant's JTBD (§1).
- [ ] **Placement:** fits the IA (§4) — deepens a workspace via progressive disclosure, or justifies a new one.
- [ ] **Not clutter:** passes the Kano-lite test (§3); ideally removes/simplifies something.
- [ ] **Trust:** accurate, cited, privacy-safe; no overclaiming.
- [ ] **Client-ready:** a consultant could show it to a client unedited.
- [ ] **Calm:** doesn't add a wall of new options; respects progressive disclosure.
- [ ] **Code:** lives in a feature module; no component pushed past the size budget; state persists if it's work the user would hate to lose.

---

## Appendix — worked example: the GHG calculator (using this doc)

- **JTBD step:** moves the consultant from *"I know I must report Scope 1 & 2"* to *"I have the number."* Strong job-fit.
- **Working-Backwards one-liner:** *"Enter litres of diesel and kWh of grid power; get an audit-ready Scope 1 & 2 figure with the exact emission factors and sources shown — without leaving the browser."*
- **Placement:** inside the **Plan** workspace, in the expanded rows of P6-E1 (energy) and P6-E7 (GHG) — progressive disclosure, *not* a new tab.
- **Kano:** Performance/Delighter — it's the leap from checklist to workflow tool. Removes the need for a separate spreadsheet.
- **Trust:** every factor (CEA grid factor, IPCC/GHG-Protocol fuel factors) cited and dated; computation transparent.
- **Code:** new `src/lib/emissions-calculator.ts` + `src/data/emission_factors.json` + an `EmissionsCalculator` sub-component in the row. Calculator inputs persist via the localStorage layer (build that first).
- **Gate:** passes all checklist items → worth building, narrow scope first (Scope 1 & 2 + intensity), then Scope 3.
