import { BRSR_FIELDS, PRINCIPLE_GUIDE, type BrsrField } from "./brsr-fields";

// A teaching pack: the reference content this site already publishes, sequenced
// into modules a trainer can actually run.
//
// Why this exists. The 108 disclosure pages, the glossary and the nine tools are
// each written to answer one question well, which makes them useful to someone
// who already knows what to look up and useless as a course. A curriculum is the
// missing ordering: what to learn first, which disclosures that covers, what to
// practise on, and how to check the learner got it.
//
// Nothing here is new content. Every module points at pages that already exist,
// and the covered disclosures are resolved from BRSR_FIELDS at build time, so a
// module cannot drift out of sync with the reference pages the way a
// hand-maintained syllabus would. (Same reasoning as the generated llms.txt
// route, which replaced a hand-written file that had rotted to 15 of 30 posts.)
//
// ⚠️ `covers` uses the brsr_data_points.json / brsr-fields.ts id convention,
// which is what /brsr/<code> is keyed on. That is NOT the finer-grained
// framework_mappings.json convention: in this one P6-E1 is energy and P6-E7 is
// GHG, and in the crosswalk those numbers mean different disclosures. Getting
// them mixed up yields modules that silently cover nothing; academy.test.ts
// fails on any id that does not resolve.

export interface PractiseLink {
  href: string;
  label: string;
  /** What the learner should actually do with it, not just its name. */
  task: string;
}

export interface AcademyModule {
  slug: string;
  title: string;
  /** What the learner can do afterwards. Written as a capability, not a topic. */
  objective: string;
  /** Why this sits here in the order. */
  rationale: string;
  /** Explicit BRSR disclosure ids this module teaches. */
  covers?: string[];
  /** Or: every disclosure under these principles, resolved from BRSR_FIELDS. */
  principles?: string[];
  /** Glossary term ids the learner needs. Anchors on /glossary. */
  glossary: string[];
  /** The in-depth guide to read alongside. */
  readGuide?: string;
  /** Hands-on work in a live tool. */
  practise?: PractiseLink;
  /** Questions a trainer can set. Answerable from the linked pages. */
  assessment: string[];
  /** Rough contact time, minutes. A planning aid, not a promise. */
  minutes: number;
}

export const ACADEMY_MODULES: AcademyModule[] = [
  {
    slug: "who-must-report",
    title: "Who has to file, and what they file",
    objective:
      "Decide whether a given company owes a BRSR at all, which parts of it, and from which financial year.",
    rationale:
      "Everything downstream is wasted effort if applicability is wrong. It is also the question consultants are asked first and most often.",
    glossary: ["brsr", "lodr", "brsr-core", "brsr-essential", "section-c", "value-chain-disclosure"],
    practise: {
      href: "/tools/brsr-applicability",
      label: "BRSR applicability check",
      task: "Run three companies through it: a top-1000 listed filer, an unlisted supplier to one, and a company outside the value chain. Note where the obligations differ.",
    },
    assessment: [
      "Which companies are inside the BRSR mandate, and which threshold decides it?",
      "What is the difference between BRSR, BRSR Core and BRSR Essential, and who owes which?",
      "A listed client's unlisted supplier is asked for data. On what basis, and is the supplier itself a filer?",
    ],
    minutes: 45,
  },
  {
    slug: "entity-and-policies",
    title: "Sections A and B: the entity, and its nine policies",
    objective:
      "Assemble the general disclosures and assess whether a client's NGRBC policy set actually covers all nine principles.",
    rationale:
      "Sections A and B are not gap-analysed the way Section C is, so they get skipped in teaching — then block the filing at the end. Policies also recur year to year, which makes them the easiest part to get right once.",
    glossary: ["ngrbc", "brsr", "section-c"],
    assessment: [
      "Name the nine NGRBC principles without looking, then check yourself against the glossary.",
      "A client has one combined sustainability policy. What has to be true for it to satisfy Section B?",
      "Which Section A disclosures come from the annual report rather than from the sustainability team?",
    ],
    minutes: 60,
  },
  {
    slug: "energy-and-emissions",
    title: "Principle 6, part one: energy and greenhouse gases",
    objective:
      "Compute Scope 1 and Scope 2 emissions from a client's actual bills, state the factor and its source, and explain why the number is defensible.",
    rationale:
      "The most asked-for and most often wrong numbers in the whole report, and the ones every other framework also wants. Teach these properly and the rest of P6 is method, not mystery.",
    covers: ["P6-E1", "P6-E2", "P6-E7", "P6-E8", "P6-L2"],
    glossary: [
      "scope-1", "scope-2", "scope-3", "cea-grid-factor", "location-based",
      "ghg-protocol", "tco2e", "emission-intensity", "pat", "bee",
    ],
    readGuide: PRINCIPLE_GUIDE.P6,
    practise: {
      href: "/tools/ghg-calculator",
      label: "Scope 1 & 2 calculator",
      task: "Take one month of a real electricity bill and one diesel invoice. Produce a tCO2e figure, then write the one sentence that says which factor you used and where it comes from. An answer without that sentence is not assurance-ready.",
    },
    assessment: [
      "Why does grid electricity sit in Scope 2 rather than Scope 1?",
      "Which CEA grid emission factor version did you use, and why does the version matter?",
      "A client reports emissions intensity but not absolute emissions. What is missing and why does it matter?",
    ],
    minutes: 120,
  },
  {
    slug: "water-waste-air",
    title: "Principle 6, part two: water, waste and air",
    objective:
      "Build the water balance, the waste split and the non-GHG air figures, and say for each whether it is metered, computed or estimated.",
    rationale:
      "These are where assurance most often fails, because withdrawal, consumption and discharge get conflated and waste streams get double-counted.",
    covers: ["P6-E3", "P6-E4", "P6-E5", "P6-E6", "P6-E9", "P6-E10", "P6-L1", "P6-L4"],
    glossary: ["water-withdrawal", "zld", "cpcb", "epr"],
    readGuide: PRINCIPLE_GUIDE.P6,
    assessment: [
      "Withdrawal minus discharge should equal consumption. When it does not, what are the legitimate reasons?",
      "A client has ZLD at one of four plants. How is that disclosed without overstating coverage?",
      "Which of these figures can be metered, and which are necessarily estimates? Say so in the disclosure.",
    ],
    minutes: 90,
  },
  {
    slug: "nature-and-compliance",
    title: "Principle 6, part three: sensitive areas, assessments and compliance",
    objective:
      "Handle the qualitative end of P6: operations near ecologically sensitive areas, impact assessments, and the compliance record.",
    rationale:
      "Mostly narrative rather than numeric, which learners find harder, not easier. A vague answer here is what auditors query first.",
    covers: ["P6-E11", "P6-E12", "P6-E13", "P6-L3", "P6-L6", "P6-L7", "P6-L8"],
    glossary: ["cpcb", "materiality-assessment"],
    readGuide: PRINCIPLE_GUIDE.P6,
    assessment: [
      "What makes an area 'ecologically sensitive' for this disclosure, and who determines it?",
      "A client had one environmental penalty three years ago, since resolved. Is it disclosed?",
      "How would you evidence that value-chain partners were assessed, rather than merely asked?",
    ],
    minutes: 60,
  },
  {
    slug: "people-and-rights",
    title: "The social principles: employees and human rights",
    objective:
      "Collect the workforce and human-rights disclosures, and recognise where the honest answer is a number the client does not yet track.",
    rationale:
      "The social principles carry more disclosures than P6 and get a fraction of the teaching, largely because the data sits with HR rather than EHS and nobody has asked for it in this shape before.",
    principles: ["P3", "P5"],
    glossary: ["posh", "dpdp", "isf"],
    readGuide: PRINCIPLE_GUIDE.P3,
    practise: {
      href: "/tools/wellbeing-schedule",
      label: "Wellbeing schedule",
      task: "Fill it for a mid-size manufacturer. Mark every cell where the number would have to come from HR rather than from a filing, and note who you would have to ask.",
    },
    assessment: [
      "Which of these disclosures need a headcount split the client's payroll may not produce?",
      "What distinguishes a human-rights due-diligence process from a policy statement?",
      "A client has no POSH complaints recorded. What are the two possible readings, and how would you tell them apart?",
    ],
    minutes: 120,
  },
  {
    slug: "one-dataset-many-frameworks",
    title: "Collect once, report to several frameworks",
    objective:
      "Take a set of BRSR figures and say, for each, which GRI, TCFD, IFRS, CDP or EcoVadis requirement it also answers.",
    rationale:
      "Clients reporting under several frameworks are asked for the same number repeatedly. Seeing the overlap is what turns BRSR from a compliance chore into the spine of a reporting programme.",
    glossary: ["gri", "tcfd", "ifrs-s1-s2", "tnfd", "csrd", "esrs", "cdp", "msci-djsi"],
    practise: {
      href: "/tools/brsr-framework-mapping",
      label: "Framework crosswalk",
      task: "Pick five P6 disclosures and list every other framework that wants the same figure. Note where the overlap is exact and where the definitions differ enough to need a restatement.",
    },
    assessment: [
      "Which BRSR disclosures have no GRI counterpart, and why might that be?",
      "CDP has no waste module. What does that imply for a client reporting to both?",
      "Give one case where two frameworks want the same metric but define its boundary differently.",
    ],
    minutes: 90,
  },
  {
    slug: "assurance-readiness",
    title: "Making it survive assurance",
    objective:
      "Judge whether a completed disclosure would pass reasonable assurance, and fix the ones that would not.",
    rationale:
      "The last module because it is a way of re-reading everything already built. BRSR Core assurance is where under-evidenced numbers surface, and it is the part clients are least prepared for.",
    glossary: [
      "brsr-core", "reasonable-assurance", "limited-assurance", "isae-3000",
      "brsr-assessment", "xbrl",
    ],
    practise: {
      href: "/tools/audit-readiness",
      label: "Assurance readiness check",
      task: "Run a completed P6 set through it. For every figure, produce the source document, the person who owns it, and the date. Anything without all three is not ready, however correct the number is.",
    },
    assessment: [
      "What does an assurance provider ask for beyond the number itself?",
      "Why is reasonable assurance a higher bar than limited, and which does BRSR Core require?",
      "A figure is correct but its only evidence is a spreadsheet someone typed. What is the problem?",
    ],
    minutes: 90,
  },
];

/** Disclosures a module teaches, resolved from the reference data. */
export function moduleFields(m: AcademyModule): BrsrField[] {
  if (m.principles?.length) {
    const want = new Set(m.principles);
    return BRSR_FIELDS.filter((f) => want.has(f.principle));
  }
  if (!m.covers?.length) return [];
  // Ordered by the module's own list, so teaching order is preserved.
  return m.covers
    .map((id) => BRSR_FIELDS.find((f) => f.id === id))
    .filter((f): f is BrsrField => Boolean(f));
}

/** Total contact time across the pack, in hours, rounded to a half. */
export function totalHours(): number {
  const mins = ACADEMY_MODULES.reduce((t, m) => t + m.minutes, 0);
  return Math.round((mins / 60) * 2) / 2;
}

/** How many of the 108 Section C disclosures the pack touches at least once. */
export function coveredDisclosureCount(): number {
  const seen = new Set<string>();
  for (const m of ACADEMY_MODULES) for (const f of moduleFields(m)) seen.add(f.id);
  return seen.size;
}
