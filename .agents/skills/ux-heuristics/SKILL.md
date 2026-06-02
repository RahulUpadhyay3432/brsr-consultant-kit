---
name: ux-heuristics
description: 'Evaluate and improve interface usability using heuristic analysis. Use when the user mentions "usability audit", "UX review", "users are confused", "heuristic evaluation", "form usability", "navigation problems", "Nielsen heuristics", "cognitive walkthrough", or "usability testing". Also trigger when reviewing a design for usability issues, improving form completion rates, or evaluating information architecture and navigation. Covers Nielsens 10 heuristics, severity ratings, and information architecture. For visual design fixes, see refactoring-ui. For conversion-focused audits, see cro-methodology.'
license: MIT
metadata:
  author: wondelai
  version: "1.3.0"
---

# UX Heuristics Framework

Practical usability principles for evaluating and improving user interfaces. Based on a fundamental truth: users don't read, they scan. They don't make optimal choices, they satisfice. They don't figure out how things work, they muddle through.

## Core Principle

**"Don't Make Me Think"** - Every page should be self-evident. If something requires thinking, it's a usability problem.

**The foundation:** Users have limited patience and cognitive bandwidth. The best interfaces are invisible -- they let users accomplish goals without ever stopping to wonder "What do I click?" or "Where am I?" Every question mark that pops into a user's head adds to cognitive load and increases the chance they'll leave. Design for scanning, satisficing, and muddling through -- because that's what users actually do.

## Scoring

**Goal: 10/10.** When reviewing or creating user interfaces, rate them 0-10 based on adherence to the principles below. A 10/10 means full alignment with all guidelines; lower scores indicate gaps to address. Always provide the current score and specific improvements needed to reach 10/10.

## Krug's Three Laws of Usability

### 1. Don't Make Me Think

**Core concept:** Every question mark that pops into a user's head adds to their cognitive load and distracts from the task.

**Key insights:**
- Clever names lose to clear names every time
- Marketing-speak creates friction; plain language removes it
- Links that could go anywhere create uncertainty
- Buttons with ambiguous labels cause hesitation

**Copy patterns:**
- Self-evident labels: "Sign in", "Search", "Add to cart"
- Action-oriented buttons: verb + noun ("Create account", "Download report")
- Avoid jargon: "Save" not "Persist", "Remove" not "Disassociate"

### 2. It Doesn't Matter How Many Clicks

**Core concept:** Users don't mind clicks if each one is painless, obvious, and confidence-building.

**Key insights:**
- Each click should be painless, obvious, and build confidence
- Three mindless clicks beat one confusing click every time
- Users abandon when confused, not when they've clicked too many times

### 3. Get Rid of Half the Words

**Core concept:** Get rid of half the words on each page, then get rid of half of what's left.

**Key insights:**
- Happy-talk wastes space
- Instructions nobody reads should be removed
- Shorter pages mean less scrolling and faster scanning

### 4. The Trunk Test

**Core concept:** If users were dropped on any random page, could they instantly answer: What site is this? What page am I on? What are the major sections? What are my options at this level? Where am I in the hierarchy? How do I search?

## Nielsen's 10 Usability Heuristics

1. **Visibility of System Status** — Keep users informed through timely feedback. Progress bars, confirmations, skeleton screens. Silent failures destroy trust.

2. **Match Between System and Real World** — Speak users' language. "Sign in" not "Authenticate". Follow real-world metaphors.

3. **User Control and Freedom** — Provide clear "emergency exits." Undo beats "Are you sure?" dialogs every time.

4. **Consistency and Standards** — Same words, styles, and behaviors mean the same thing throughout. One term per concept everywhere.

5. **Error Prevention** — Prevent problems before they occur. Constrained inputs, autocomplete, sensible defaults.

6. **Recognition Rather Than Recall** — Show options, don't require memorization. Breadcrumbs, recent searches, pre-filled fields.

7. **Flexibility and Efficiency of Use** — Serve both novices and experts. Keyboard shortcuts, bulk actions, progressive disclosure.

8. **Aesthetic and Minimalist Design** — Every element must earn its place. One primary CTA per page, not five competing ones.

9. **Help Users Recognize, Diagnose, and Recover from Errors** — Three parts: what happened, why, and how to fix it. Plain language always.

10. **Help and Documentation** — Help should be searchable, task-focused, and contextual.

## Severity Rating Scale

| Severity | Rating | Description | Priority |
|----------|--------|-------------|----------|
| **0** | Not a problem | Disagreement, not usability issue | Ignore |
| **1** | Cosmetic | Minor annoyance, low impact | Fix if time |
| **2** | Minor | Causes delay or frustration | Schedule fix |
| **3** | Major | Significant task failure | Fix soon |
| **4** | Catastrophic | Prevents task completion | Fix immediately |

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|------|
| **Mystery meat navigation** | Icons without labels force guessing | Add text labels alongside icons |
| **Too many choices** | Decision paralysis slows users | Reduce to 7 plus/minus 2 items |
| **No "you are here" indicator** | Users feel lost in the hierarchy | Highlight current section in nav |
| **Jargon in labels** | Users don't speak your internal language | User-test all labels, use plain language |
| **Wall of text** | Nobody reads dense paragraphs | Break up with headings, bullets, whitespace |
| **No loading indicators** | Users think the system is broken | Show spinner, progress bar, or skeleton screen |
| **Poor error messages** | "Invalid input" tells users nothing | Explain what's wrong and how to fix it |

## Quick Diagnostic

| Question | If No | Action |
|----------|-------|--------|
| Can I tell what site/page this is immediately? | Users are lost | Add clear logo, page title, breadcrumbs |
| Is the main action obvious? | Users don't know what to do | Create visual hierarchy, single primary CTA |
| Does the system show me what's happening? | Users lose trust | Add loading states, confirmations |
| Are error messages helpful? | Users get stuck | Rewrite in plain language with specific fix |
| Does anything make me stop and think "huh?" | Cognitive load too high | Simplify — if it needs explanation, redesign it |
