---
name: refactoring-ui
description: 'Audit and fix visual hierarchy, spacing, color, and depth in web UIs. Use when the user mentions "my UI looks off", "fix the design", "Tailwind styling", "color palette", "visual hierarchy", "design system", "spacing scale", or "component styling". Also trigger when building consistent design tokens, creating dark mode themes, improving data visualization clarity, or polishing UI details before launch. Covers grayscale-first workflow, constrained design scales, shadows, and component styling. For typeface selection, see web-typography. For usability audits, see ux-heuristics.'
license: MIT
metadata:
  author: wondelai
  version: "1.2.0"
---

# Refactoring UI Design System

A practical, opinionated approach to UI design. Apply these principles when generating frontend code, reviewing designs, or advising on visual improvements.

## Core Principle

**Design in grayscale first. Add color last.** This forces proper hierarchy through spacing, contrast, and typography before relying on color as a crutch.

**The foundation:** Great UI isn't about creativity or talent -- it's about systems. Constrained scales for spacing, type, color, and shadows produce consistently professional results. Start with too much white space, then remove. Details come later.

## Scoring

**Goal: 10/10.** When reviewing or creating UI designs or frontend code, rate it 0-10 based on adherence to the principles below. Always provide the current score and specific improvements needed to reach 10/10.

## The 7 Principles

### 1. Visual Hierarchy

Not everything can be important. Create hierarchy through three levers: **size, weight, and color**.

- Combine levers, don't multiply — primary text = large OR bold OR dark, not all three
- Labels are secondary — form labels, table headers, metadata support the data, not compete with it
- De-emphasize labels: make them smaller, lighter, or uppercase-small

| Context | Technique | Example |
|---------|-----------|---------|
| Form fields | De-emphasize labels, emphasize values | Small uppercase label above large value text |
| Cards | Title large, metadata small and light | Title 20px bold, date 12px gray-400 |
| Dashboards | Key metric large, context small | "$42,300" large, "vs last month" small |

### 2. Spacing & Sizing

Use a **constrained spacing scale**, not arbitrary values.

- Scale: **4, 8, 16, 24, 32, 48, 64px**
- Start with too much white space, then remove
- Spacing between groups > spacing within groups
- Constrain text to 45-75 characters (`max-w-prose`)
- Forms max 300-500px width

### 3. Typography

Use a modular type scale, constrain line heights by context.

- Scale: **12, 14, 16, 20, 24, 30, 36px**
- Headings: tight line height (1.0-1.25)
- Body text: relaxed line height (1.5-1.75)
- Two fonts maximum
- Avoid font weights below 400 for body text

### 4. Color

Build a systematic palette with 5-9 shades per color.

- Each color needs shades 50 through 900
- Pure grays look lifeless — add subtle saturation (cool UI: blue tint; warm UI: yellow/brown tint)
- Body text minimum 4.5:1 contrast ratio
- Design in grayscale first, add color last

### 5. Depth & Shadows

Use a shadow scale to convey elevation.

- `shadow-sm` — buttons (slightly raised)
- `shadow-md` — cards (clear separation)
- `shadow-lg` — dropdowns (floating)
- `shadow-xl` — modals (highest elevation)
- Don't overuse — if everything floats, nothing has depth

### 6. Images & Icons

- Icons sized relative to context — not the same size everywhere
- Images: always `object-fit: cover` with fixed aspect ratios
- Empty states are an opportunity — illustration + clear CTA

### 7. Layout & Composition

- Left-align text by default; center only heroes and single-action CTAs
- Full-width is almost never right for content
- Alternate emphasis in lists — not every card needs the same layout

## Common Mistakes

| Mistake | Why It Fails | Fix |
|---------|-------------|-----|
| "Looks amateur" | Insufficient white space | Add more white space, constrain widths |
| "Feels flat" | No depth differentiation | Add subtle shadows, border-bottom on sections |
| "Text is hard to read" | Poor line-height, too wide | Increase line-height, constrain width |
| "Everything looks the same" | No visual hierarchy | Vary size/weight/color between primary and secondary |
| "Feels cluttered" | Equal spacing everywhere | Group related items, increase spacing between groups |
| "Using arbitrary values" | px values like 13, 17, 23 | Stick to the spacing and type scales |

## Quick Diagnostic

| Question | If No | Action |
|----------|-------|--------|
| Does hierarchy read when squinting (blur test)? | Elements competing | Increase contrast between primary/secondary |
| Does it work in grayscale? | Relying on color for hierarchy | Strengthen size/weight/spacing hierarchy |
| Is there enough white space? | Too dense | Increase spacing, especially between groups |
| Are labels de-emphasized vs. their values? | Labels competing with data | Make labels smaller, lighter, uppercase-small |
| Is text width constrained? | Lines too long | Apply `max-w-prose` to text blocks |
| Do colors have sufficient contrast? | Accessibility failure | Use gray-700+ on white backgrounds |
