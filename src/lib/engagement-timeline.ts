// Pure engagement-timeline logic for the free Templates tab. Given a filing
// deadline and whether the client is a first-time BRSR filer, computes a
// realistic milestone plan and a CSV export. Client-safe, no server imports.

export interface Milestone {
  name: string;
  weeksBefore: number;
  owner: string;
  description: string;
}

// 20-week plan for a client filing BRSR for the first time.
export const MILESTONES_FIRST_TIME: Milestone[] = [
  {
    name: "Kickoff & scope review",
    weeksBefore: 20,
    owner: "Consultant",
    description: "Confirm BRSR applicability (Essential vs Core), list the filing entity, agree on reporting period and the team map.",
  },
  {
    name: "Data audit",
    weeksBefore: 18,
    owner: "Consultant + client lead",
    description: "Review last year's filings and any existing reports to identify what data is already available and what needs to be collected fresh.",
  },
  {
    name: "Send data requests",
    weeksBefore: 15,
    owner: "Consultant",
    description: "Distribute internal data requests to HR, Plant/EHS, Legal, Procurement, and CSR teams. Set a clear response deadline.",
  },
  {
    name: "First draft",
    weeksBefore: 10,
    owner: "Consultant",
    description: "Compile all collected data, compute GHG/energy/water figures, draft Section A, B, and C. Flag outstanding gaps.",
  },
  {
    name: "Internal review",
    weeksBefore: 6,
    owner: "Client management",
    description: "Data owners verify numbers; legal and compliance sign off on disclosures. Resolve outstanding gaps.",
  },
  {
    name: "Board / MD sign-off",
    weeksBefore: 3,
    owner: "Client board",
    description: "BRSR requires board or MD approval before filing. Present the final draft for sign-off.",
  },
  {
    name: "Filing",
    weeksBefore: 0,
    owner: "Company Secretary",
    description: "File the Annual Report (including BRSR) with NSE/BSE within the regulatory deadline.",
  },
];

// 12-week plan for a client with prior BRSR filing experience.
export const MILESTONES_EXPERIENCED: Milestone[] = [
  {
    name: "Kickoff & scope review",
    weeksBefore: 12,
    owner: "Consultant",
    description: "Review prior year's report, confirm scope changes (new sites, headcount changes, BRSR Core applicability for this year), agree on team map.",
  },
  {
    name: "Data audit",
    weeksBefore: 10,
    owner: "Consultant + client lead",
    description: "Pull prior-year data as a baseline. Identify changed indicators and new SEBI requirements for FY 2025-26.",
  },
  {
    name: "Send data requests",
    weeksBefore: 8,
    owner: "Consultant",
    description: "Distribute targeted requests to teams for changed or new data points. Leverage prior-year figures as a starting point.",
  },
  {
    name: "First draft",
    weeksBefore: 5,
    owner: "Consultant",
    description: "Update prior-year draft with new data, recompute GHG/energy/water, flag any year-on-year anomalies for review.",
  },
  {
    name: "Internal review",
    weeksBefore: 3,
    owner: "Client management",
    description: "Verify updated numbers against source records; legal and compliance sign off.",
  },
  {
    name: "Board / MD sign-off",
    weeksBefore: 2,
    owner: "Client board",
    description: "Present final draft for board or MD approval.",
  },
  {
    name: "Filing",
    weeksBefore: 0,
    owner: "Company Secretary",
    description: "File the Annual Report with NSE/BSE.",
  },
];

// Compute calendar dates for each milestone by subtracting weeksBefore*7 from
// the deadline. Returns milestones in chronological order (earliest first).
export function computeTimeline(
  deadline: Date,
  firstTime: boolean
): Array<Milestone & { dueDate: Date }> {
  const milestones = firstTime ? MILESTONES_FIRST_TIME : MILESTONES_EXPERIENCED;
  return milestones
    .map((m) => {
      const dueDate = new Date(deadline);
      dueDate.setDate(dueDate.getDate() - m.weeksBefore * 7);
      return { ...m, dueDate };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

// Format a Date as "DD MMM YYYY" for CSV and table display.
function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// CSV rows for the downloadable milestone plan. Columns mirror what a consultant
// would track in a spreadsheet: milestone, due date, lead, notes, done checkbox.
export function timelineCsvRows(
  timeline: Array<Milestone & { dueDate: Date }>
): string[][] {
  const header = ["Milestone", "Due by", "Owner / lead", "Notes / what to prepare", "Done?"];
  const rows = timeline.map((m) => [
    m.name,
    formatDate(m.dueDate),
    m.owner,
    m.description,
    "",
  ]);
  return [header, ...rows];
}

// Default filing deadline: September 30 of the current year, or next year if
// we're already past that date. (Most listed company annual reports file by Sep.)
export function defaultDeadline(): string {
  const now = new Date();
  const thisYearSep30 = new Date(now.getFullYear(), 8, 30); // month 8 = September
  const year = now > thisYearSep30 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-09-30`;
}
