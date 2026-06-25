"use client";
// "Templates & guides" reference tab — a small, free, on-device library of the
// formats and how-to guidance consultants hunt for (materiality, the response
// workbook, the hard principles, assurance-readiness). Downloads reuse the report's
// formula-safe CSV export. Nothing leaves the browser. Cited where it states a rule.
import { useState } from "react";
import { downloadCsv, exportFilename } from "@/lib/export";
import { SEBI_BRSR_FORMAT_URL } from "./checklist/constants";
import brsrData from "@/data/brsr_data_points.json";

interface KbIndicator { id: string; label: string; unit: string | null }
interface KbPrinciple { id: string; name: string; essential_indicators: KbIndicator[]; leadership_indicators: KbIndicator[] }
interface KbDisclosure { id: string; label: string }
const KB = brsrData as unknown as {
  section_a_general_disclosures: KbDisclosure[];
  section_b_management_process_disclosures: KbDisclosure[];
  principles: KbPrinciple[];
};

// ── Downloadable templates (built on the spot, downloaded on-device) ──────────
function buildResponseWorkbook(): string[][] {
  const header = ["Section", "Principle", "Indicator ID", "Type", "Disclosure", "Unit", "Your response", "Data owner", "Source / evidence", "Status"];
  const rows: string[][] = [header];
  for (const d of KB.section_a_general_disclosures) rows.push(["A", "", d.id, "General", d.label, "", "", "", "", ""]);
  for (const d of KB.section_b_management_process_disclosures) rows.push(["B", "", d.id, "Policy/Process", d.label, "", "", "", "", ""]);
  for (const p of KB.principles) {
    const name = `${p.id} · ${p.name}`;
    for (const i of p.essential_indicators) rows.push(["C", name, i.id, "Essential", i.label, i.unit ?? "", "", "", "", ""]);
    for (const i of p.leadership_indicators) rows.push(["C", name, i.id, "Leadership", i.label, i.unit ?? "", "", "", "", ""]);
  }
  return rows;
}

function buildMaterialityGrid(): string[][] {
  return [
    ["Material topic", "Pillar (E/S/G)", "Why it matters to the business", "Business impact (1-5)", "Stakeholder concern (1-5)", "Material? (Y/N)", "Rationale for decision", "Owner"],
    ["e.g. GHG emissions & energy", "E", "Cost, regulation (BRSR Core, CCTS), customer pressure", "", "", "", "", ""],
    ["e.g. Occupational health & safety", "S", "Licence to operate, workforce continuity", "", "", "", "", ""],
    ["e.g. Business ethics & anti-bribery", "G", "Legal exposure, investor trust", "", "", "", "", ""],
    ...Array.from({ length: 9 }, () => ["", "", "", "", "", "", "", ""]),
  ];
}

function buildStakeholderPlan(): string[][] {
  const header = ["Stakeholder group", "Why they matter", "Engagement method", "Frequency", "Key ESG topics", "Owner", "Last engaged"];
  const seed = [
    ["Employees & workers", "Workforce wellbeing, retention, P3/P5 data", "Survey, town halls, grievance channel", "Quarterly", "Safety, wages, D&I, grievances", "", ""],
    ["Customers", "Demand, product responsibility (P9)", "Feedback, account reviews", "Ongoing", "Product safety, data privacy, ESG asks", "", ""],
    ["Suppliers / value chain", "Scope 3, value-chain disclosure (FY26-27)", "Onboarding, audits, questionnaires", "Annual", "Emissions data, labour, sourcing", "", ""],
    ["Local communities", "Licence to operate (P8)", "Consultations, CSR reviews", "Annual", "Land, water, livelihoods, grievances", "", ""],
    ["Investors / lenders", "Cost of capital, ratings", "Disclosures, briefings", "Annual", "Climate risk, governance, targets", "", ""],
    ["Regulators", "Compliance (SEBI, PCB, BEE)", "Filings, inspections", "As required", "Permits, BRSR, CCTS/PAT", "", ""],
  ];
  return [header, ...seed];
}

const TEMPLATES: { name: string; desc: string; file: string; build: () => string[][] }[] = [
  { name: "BRSR response workbook", desc: "Every Section A, B and C disclosure (all 108 principle fields + A/B) as a blank fill-in sheet — response, data owner, evidence and status columns per row.", file: "brsr-response-workbook", build: buildResponseWorkbook },
  { name: "Materiality assessment grid", desc: "The scoring format for a stakeholder-driven materiality assessment: business impact × stakeholder concern, with a decision + rationale column. Three worked examples, then blank rows.", file: "materiality-assessment-template", build: buildMaterialityGrid },
  { name: "Stakeholder engagement plan", desc: "A starting plan pre-filled with the six stakeholder groups BRSR expects you to engage, with suggested methods and the ESG topics each cares about.", file: "stakeholder-engagement-plan", build: buildStakeholderPlan },
];

// ── How-to guides (cited) ─────────────────────────────────────────────────────
interface Guide { title: string; body: React.ReactNode; sources: { label: string; href: string }[] }
const GUIDES: Guide[] = [
  {
    title: "Running a BRSR materiality assessment",
    body: (
      <>
        <p>BRSR expects material ESG issues to come from a <strong>stakeholder-driven process</strong>, not a desk exercise. The tool <em>suggests</em> likely topics for the industry; the assessment itself is yours to run:</p>
        <ol className="list-decimal pl-5 space-y-1 mt-2">
          <li>Identify the topics (use the Materiality tab as a starting shortlist).</li>
          <li>Map and engage stakeholders (see the Stakeholder engagement plan template).</li>
          <li>Score each topic on <strong>business impact</strong> and <strong>stakeholder concern</strong> (the grid template).</li>
          <li>Prioritise, decide what's material, and record the rationale.</li>
          <li>Get board / management sign-off and keep the documentation for assurance.</li>
        </ol>
        <p className="mt-2">Document the process — assurers and the board will ask how topics were chosen.</p>
      </>
    ),
    sources: [{ label: "SEBI BRSR Format", href: SEBI_BRSR_FORMAT_URL }],
  },
  {
    title: "Answering Principle 5 — Human Rights",
    body: (
      <>
        <p>P5 is the principle consultants most often get stuck on. It spans wages, equal opportunity, grievance redressal, and forced/child-labour safeguards across the workforce <em>and</em> the value chain. The data usually lives with HR and Legal:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Minimum wage & remuneration</strong> — % of employees/workers paid at or above minimum wage, gender-disaggregated median remuneration.</li>
          <li><strong>POSH</strong> — sexual-harassment complaints filed / resolved (Sexual Harassment of Women at Workplace Act).</li>
          <li><strong>Grievance mechanisms</strong> — coverage and number of complaints on working conditions / human rights.</li>
          <li><strong>Due diligence</strong> — human-rights assessments of plants and value-chain partners.</li>
        </ul>
        <p className="mt-2">Common gaps: value-chain human-rights data and grievance-mechanism coverage. Align to the UN Guiding Principles where you describe due diligence.</p>
      </>
    ),
    sources: [
      { label: "SEBI BRSR Format (P5)", href: SEBI_BRSR_FORMAT_URL },
      { label: "UN Guiding Principles on Business & Human Rights", href: "https://www.ohchr.org/en/publications/reference-publications/guiding-principles-business-and-human-rights" },
    ],
  },
  {
    title: "Getting ready for BRSR Core assurance",
    body: (
      <>
        <p>The nine BRSR Core attributes carry <strong>reasonable assurance</strong> on a glide path — top 150 (FY23-24) → 250 → 500 → top 1000 (FY26-27). Assurers increasingly ask not just "is the number right?" but "show the trail behind it":</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Named data owners</strong> — who is accountable for each KPI.</li>
          <li><strong>Documentation trail</strong> — the bill, register or meter reading behind every figure.</li>
          <li><strong>Cited methodology</strong> — the factor and source behind any computed number.</li>
          <li><strong>Internal controls</strong> — how the data is reviewed before it's reported.</li>
        </ul>
        <p className="mt-2">Saaksh's <strong>Collect</strong> tier captures exactly this — per-figure attribution, attached evidence and the cited calculation basis — as an exportable data-ownership ledger.</p>
      </>
    ),
    sources: [{ label: "SEBI BRSR Core circular (Jul 2023)", href: "https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html" }],
  },
];

export default function TemplatesPanel() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[24px] font-normal text-stone-900 leading-tight tracking-tight">Templates &amp; guides</h1>
        <p className="text-[13px] text-stone-500 mt-1 max-w-[74ch] leading-relaxed">
          The formats and how-to guidance you&apos;d otherwise hunt for — ready to download and built from the same
          cited BRSR knowledge base. Generated in your browser; nothing is uploaded.
        </p>
      </div>

      {/* Downloadable templates */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-stone-800">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)] flex flex-col">
              <p className="text-[14px] font-semibold text-stone-800 leading-snug">{t.name}</p>
              <p className="text-[12.5px] text-stone-500 mt-1.5 leading-relaxed flex-1">{t.desc}</p>
              <button
                onClick={() => downloadCsv(exportFilename(t.file), t.build())}
                className="mt-3 inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                Download CSV
              </button>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-stone-400 leading-relaxed">Templates are starting formats, not a finished assessment — adapt them to the client and their stakeholder process.</p>
      </section>

      {/* How-to guides */}
      <section className="space-y-3">
        <h2 className="text-[15px] font-semibold text-stone-800">How-to guides</h2>
        <div className="space-y-2.5">
          {GUIDES.map((g) => <GuideItem key={g.title} g={g} />)}
        </div>
      </section>
    </div>
  );
}

// A how-to guide that expands/collapses its height smoothly (grid-rows 0fr→1fr),
// the same pattern the Action Plan's principle sections use — vs the native
// <details> which snaps open.
function GuideItem({ g }: { g: Guide }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left text-[14px] font-semibold text-stone-800"
      >
        <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        {g.title}
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          <div className="mt-3 pl-6 text-[13px] text-stone-600 leading-relaxed space-y-1">
            {g.body}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 mt-2 border-t border-stone-100">
              <span className="text-[10.5px] font-semibold uppercase tracking-wide text-stone-400">Sources</span>
              {g.sources.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="text-[11.5px] text-brand-700 hover:text-brand-800 underline decoration-stone-300 hover:decoration-brand-500 transition-colors">{s.label} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
