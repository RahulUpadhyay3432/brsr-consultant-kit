"use client";
// "Templates & guides" reference tab, a small, free, on-device library of the
// formats and how-to guidance consultants hunt for (materiality, the response
// workbook, the hard principles, assurance-readiness). Downloads reuse the report's
// formula-safe CSV export. Nothing leaves the browser. Cited where it states a rule.
import { useState, useMemo } from "react";
import { downloadCsv, exportFilename } from "@/lib/export";
import { OWNERS, OWNER_ORDER, ownerMapRows, reportingFy } from "@/lib/brsr-owners";
import { TEAM_EMAILS, buildTeamEmail, type TeamEmail } from "@/lib/request-emails";
import { computeTimeline, timelineCsvRows, defaultDeadline } from "@/lib/engagement-timeline";
import { SEBI_BRSR_FORMAT_URL } from "./checklist/constants";
import brsrData from "@/data/brsr_data_points.json";
import qualityData from "@/data/brsr_quality_examples.json";
import explainersData from "@/data/brsr_field_explainers.json";

interface KbIndicator { id: string; label: string; unit: string | null }
interface KbPrinciple { id: string; name: string; essential_indicators: KbIndicator[]; leadership_indicators: KbIndicator[] }
interface KbDisclosure { id: string; label: string }
const KB = brsrData as unknown as {
  section_a_general_disclosures: KbDisclosure[];
  section_b_management_process_disclosures: KbDisclosure[];
  principles: KbPrinciple[];
};

const QUALITY_EXAMPLES = (qualityData as { examples: Record<string, string> }).examples;
const FIELD_EXPLAINERS = (explainersData as { explainers: Record<string, string> }).explainers;

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
  { name: "BRSR response workbook", desc: "Every Section A, B and C disclosure (all 108 principle fields + A/B) as a blank fill-in sheet, response, data owner, evidence and status columns per row.", file: "brsr-response-workbook", build: buildResponseWorkbook },
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
          <li>Prioritise, decide what&apos;s material, and record the rationale.</li>
          <li>Get board / management sign-off and keep the documentation for assurance.</li>
        </ol>
        <p className="mt-2">Document the process, assurers and the board will ask how topics were chosen.</p>
      </>
    ),
    sources: [{ label: "SEBI BRSR Format", href: SEBI_BRSR_FORMAT_URL }],
  },
  {
    title: "Answering Principle 5, Human Rights",
    body: (
      <>
        <p>P5 is the principle consultants most often get stuck on. It spans wages, equal opportunity, grievance redressal, and forced/child-labour safeguards across the workforce <em>and</em> the value chain. The data usually lives with HR and Legal:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Minimum wage & remuneration</strong>, % of employees/workers paid at or above minimum wage, gender-disaggregated median remuneration.</li>
          <li><strong>POSH</strong>, sexual-harassment complaints filed / resolved (Sexual Harassment of Women at Workplace Act).</li>
          <li><strong>Grievance mechanisms</strong>, coverage and number of complaints on working conditions / human rights.</li>
          <li><strong>Due diligence</strong>, human-rights assessments of plants and value-chain partners.</li>
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
        <p>The nine BRSR Core attributes carry <strong>reasonable assurance</strong> on a glide path, top 150 (FY23-24) → 250 → 500 → top 1000 (FY26-27). Assurers increasingly ask not just &quot;is the number right?&quot; but &quot;show the trail behind it&quot;:</p>
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li><strong>Named data owners</strong>, who is accountable for each KPI.</li>
          <li><strong>Documentation trail</strong>, the bill, register or meter reading behind every figure.</li>
          <li><strong>Cited methodology</strong>, the factor and source behind any computed number.</li>
          <li><strong>Internal controls</strong>, how the data is reviewed before it&apos;s reported.</li>
        </ul>
        <p className="mt-2">Saaksh&apos;s <strong>Collect</strong> tier captures exactly this, per-figure attribution, attached evidence and the cited calculation basis, as an exportable data-ownership ledger.</p>
      </>
    ),
    sources: [{ label: "SEBI BRSR Core circular (Jul 2023)", href: "https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html" }],
  },
  {
    title: "What's new for BRSR in FY 2025-26",
    body: (
      <>
        <p>Four changes that affect most engagements this filing season:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>
            <strong>BRSR Core assurance expansion.</strong> The top 500 listed companies (by market cap) must file BRSR Core with <em>reasonable assurance</em> for FY 2024-25 disclosures. The nine Core attributes cover GHG intensity, energy intensity, water intensity, waste management, and other key KPIs. Top 1000 joins the mandatory assurance glide path from FY 2026-27.
          </li>
          <li>
            <strong>Value-chain disclosures: prepare now, mandatory from FY 2026-27.</strong> Top 1000 companies will be required to collect BRSR data from at least their top 2% of value-chain partners by spend. Begin identifying scope, selecting pilot suppliers, and designing the data-collection process this year. Saaksh&apos;s Collect tier is built for exactly this.
          </li>
          <li>
            <strong>Scope 3 GHG (P6-L2): voluntary but increasingly expected.</strong> Scope 3 remains a Leadership indicator (voluntary) in the BRSR format, but assurers and institutional investors increasingly ask for it as part of BRSR Core engagement reviews. The Saaksh Scope 3 calculator in P6-L2 covers the most common categories (business travel, commuting, freight, waste).
          </li>
          <li>
            <strong>SEBI March 2025 format amendments: already in this tool.</strong> SEBI revised the BRSR format in March 2025 with updated indicator numbering and minor disclosure refinements applicable from FY 2024-25 onward. The Saaksh knowledge base already incorporates these changes; no action needed within the tool.
          </li>
        </ul>
        <p className="mt-2">For the official list of companies in each BRSR Core tier, check the NSE/BSE circulars or the SEBI website directly; the list is updated annually.</p>
      </>
    ),
    sources: [
      { label: "SEBI BRSR Format", href: SEBI_BRSR_FORMAT_URL },
      { label: "SEBI BRSR Core circular (Jul 2023)", href: "https://www.sebi.gov.in/legal/circulars/jul-2023/brsr-core-framework-for-assurance-and-esg-disclosures-for-value-chain_73854.html" },
      { label: "SEBI circulars (for Mar 2025 update)", href: "https://www.sebi.gov.in/legal/circulars/" },
    ],
  },
];

const PRINCIPLE_IDS = ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9"];

export default function TemplatesPanel({ clientName }: { clientName?: string }) {
  const fy = reportingFy(new Date());
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-normal text-stone-900 leading-tight tracking-tight">Templates, emails &amp; guides</h1>
        <p className="text-[14.5px] text-ink-body mt-1 max-w-[74ch] leading-relaxed">
          The formats, the internal data-request emails, the engagement timeline and the how-to guidance you&apos;d otherwise hunt for, ready
          to use and built from the same cited BRSR knowledge base. Generated in your browser; nothing is uploaded.
        </p>
      </div>

      {/* Downloadable templates, first section, no border-t */}
      <section className="space-y-3">
        <h2 className="text-[18.5px] font-bold text-stone-900">Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)] flex flex-col">
              <p className="text-[16px] font-semibold text-stone-900 leading-snug">{t.name}</p>
              <p className="text-[14.5px] text-ink-body mt-1.5 leading-relaxed flex-1">{t.desc}</p>
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
        <p className="text-[13px] text-ink-muted leading-relaxed">Templates are starting formats, not a finished assessment, adapt them to the client and their stakeholder process.</p>
      </section>

      {/* Internal request emails */}
      <section className="space-y-3 border-t border-stone-200 pt-5">
        <div>
          <h2 className="text-[18.5px] font-bold text-stone-900">Internal request emails</h2>
          <p className="text-[14.5px] text-ink-body mt-1 max-w-[74ch] leading-relaxed">
            Ready-to-send drafts to chase BRSR data from the team that holds it, each personalized for
            {" "}<span className="font-medium text-ink">{clientName?.trim() || "your client"}</span>
            {" "}({fy}). Copy one, paste it into your mail client, adjust and send.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {TEAM_EMAILS.map((t) => <EmailCard key={t.team} t={t} company={clientName} fy={fy} />)}
        </div>
        <p className="text-[13px] text-ink-muted leading-relaxed">
          Sending, tracking and automatic reminders are handled for you in <span className="font-medium text-ink-body">Collect</span>, the Pro tier, owners submit through a no-login form with evidence attached.
        </p>
      </section>

      {/* Who owns what */}
      <section className="space-y-3 border-t border-stone-200 pt-5">
        <div>
          <h2 className="text-[18.5px] font-bold text-stone-900">Who owns what</h2>
          <p className="text-[14.5px] text-ink-body mt-1 max-w-[74ch] leading-relaxed">
            Which team in the company usually holds each principle&apos;s data, so you know who to ask first.
          </p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(80,60,30,0.04)] divide-y divide-stone-100">
          {OWNER_ORDER.map((id) => {
            const o = OWNERS[id];
            return (
              <div key={id} className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 px-4 py-3">
                <div className="flex items-center gap-2.5 sm:w-[230px] flex-shrink-0">
                  <span className="font-mono text-[11.5px] text-ink-muted">{id}</span>
                  <span className="text-[13.5px] font-semibold text-ink leading-snug">{o.theme}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="inline-block font-mono text-[11.5px] text-brand-700 bg-brand-50 border border-brand-100 rounded px-1.5 py-0.5">{o.chip}</span>
                  <p className="text-[13px] text-ink-body mt-1 leading-relaxed">{o.found}</p>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => downloadCsv(exportFilename("brsr-data-ownership-map", clientName), ownerMapRows())}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
          Download CSV
        </button>
      </section>

      {/* Engagement timeline generator */}
      <div className="border-t border-stone-200 pt-5">
        <TimelineSection clientName={clientName} />
      </div>

      {/* How-to guides */}
      <section className="space-y-3 border-t border-stone-200 pt-5">
        <h2 className="text-[18.5px] font-bold text-stone-900">How-to guides</h2>
        <div className="space-y-2.5">
          {GUIDES.map((g) => <GuideItem key={g.title} g={g} />)}
        </div>
      </section>

      {/* Disclosure quality examples */}
      <div className="border-t border-stone-200 pt-5">
        <DisclosureExamplesSection />
      </div>
    </div>
  );
}

// ── Engagement timeline ───────────────────────────────────────────────────────
function TimelineSection({ clientName }: { clientName?: string }) {
  const [deadline, setDeadline] = useState(defaultDeadline);
  const [firstTime, setFirstTime] = useState(true);

  const timeline = useMemo(() => {
    const d = deadline ? new Date(deadline + "T00:00:00") : new Date();
    return computeTimeline(d, firstTime);
  }, [deadline, firstTime]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[18.5px] font-bold text-stone-900">Engagement timeline</h2>
        <p className="text-[14.5px] text-ink-body mt-1 max-w-[74ch] leading-relaxed">
          A realistic milestone plan from kickoff to filing. Set the deadline and the client&apos;s filing experience, then download or paste into your project tracker.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="tl-deadline" className="text-[13px] font-medium text-ink-body whitespace-nowrap">Filing deadline</label>
          <input
            id="tl-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="text-[13.5px] text-ink bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-400"
          />
        </div>
        <div className="flex items-center gap-1 bg-stone-100 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setFirstTime(true)}
            className={`text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${firstTime ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
          >
            First-time filing
          </button>
          <button
            type="button"
            onClick={() => setFirstTime(false)}
            className={`text-[13px] font-medium px-3 py-1.5 rounded-md transition-colors ${!firstTime ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"}`}
          >
            Experienced
          </button>
        </div>
      </div>

      {/* Milestone table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(80,60,30,0.04)] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              <th className="text-left px-4 py-2.5 font-semibold text-ink-muted text-[12px] uppercase tracking-wide w-[38%]">Milestone</th>
              <th className="text-left px-4 py-2.5 font-semibold text-ink-muted text-[12px] uppercase tracking-wide w-[18%]">Due by</th>
              <th className="text-left px-4 py-2.5 font-semibold text-ink-muted text-[12px] uppercase tracking-wide w-[20%]">Lead</th>
              <th className="text-left px-4 py-2.5 font-semibold text-ink-muted text-[12px] uppercase tracking-wide hidden md:table-cell">Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {timeline.map((m, i) => (
              <tr key={m.name} className={i === timeline.length - 1 ? "bg-brand-50" : ""}>
                <td className="px-4 py-3 text-[15px] font-medium text-stone-900 leading-snug">{m.name}</td>
                <td className="px-4 py-3 text-[14.5px] font-mono text-ink-body whitespace-nowrap">
                  {m.dueDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-4 py-3 text-[13.5px] text-ink-body leading-snug">{m.owner}</td>
                <td className="px-4 py-3 text-[13.5px] text-ink-body leading-relaxed hidden md:table-cell">{m.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => downloadCsv(exportFilename("brsr-engagement-timeline", clientName), timelineCsvRows(timeline))}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
          Download CSV
        </button>
        <p className="text-[13px] text-ink-muted">The &quot;Notes&quot; column in the CSV includes what to prepare for each milestone.</p>
      </div>
    </section>
  );
}

// ── Disclosure quality examples ───────────────────────────────────────────────
function DisclosureExamplesSection() {
  const [selectedPrinciples, setSelectedPrinciples] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  function togglePrinciple(pid: string) {
    setSelectedPrinciples((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) next.delete(pid); else next.add(pid);
      return next;
    });
    setOpenId(null);
  }

  const allFields = useMemo(() => {
    const out: Array<{ id: string; principleId: string; principleName: string; label: string; type: "essential" | "leadership" }> = [];
    for (const p of KB.principles) {
      for (const ind of p.essential_indicators) out.push({ id: ind.id, principleId: p.id, principleName: p.name, label: ind.label, type: "essential" });
      for (const ind of p.leadership_indicators) out.push({ id: ind.id, principleId: p.id, principleName: p.name, label: ind.label, type: "leadership" });
    }
    return out;
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allFields.filter((f) => {
      if (selectedPrinciples.size > 0 && !selectedPrinciples.has(f.principleId)) return false;
      if (q && !f.id.toLowerCase().includes(q) && !f.label.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [allFields, selectedPrinciples, search]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-[18.5px] font-bold text-stone-900">What a complete answer looks like</h2>
        <p className="text-[14.5px] text-ink-body mt-1 max-w-[74ch] leading-relaxed">
          For each Section-C disclosure, the level of detail and the specific data points that assurers and investors typically expect to see.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap gap-1.5">
          {PRINCIPLE_IDS.map((pid) => (
            <button
              key={pid}
              type="button"
              onClick={() => togglePrinciple(pid)}
              className={`font-mono text-[12px] font-medium px-2.5 py-1 rounded-md border transition-colors pressable ${
                selectedPrinciples.has(pid)
                  ? "bg-brand-600 text-white border-brand-600"
                  : "bg-white text-ink-body border-stone-200 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {pid}
            </button>
          ))}
          {selectedPrinciples.size > 0 && (
            <button
              type="button"
              onClick={() => { setSelectedPrinciples(new Set()); setOpenId(null); }}
              className="text-[12px] text-ink-muted hover:text-ink px-1.5 py-1 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}
            strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search by field ID or label, e.g. P6-E1, emissions, wages..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpenId(null); }}
            className="w-full max-w-[520px] pl-10 pr-3 py-2.5 text-[13.5px] text-ink bg-white border border-stone-300 rounded-lg placeholder:text-stone-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-300 transition-colors"
          />
        </div>
      </div>

      {/* Field list */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-[0_1px_3px_rgba(80,60,30,0.04)] divide-y divide-stone-100 overflow-hidden">
        {filtered.length === 0 ? (
          <p className="px-4 py-6 text-[13px] text-ink-muted text-center">No fields match your filters.</p>
        ) : (
          filtered.map((f) => (
            <ExampleRow
              key={f.id}
              field={f}
              example={QUALITY_EXAMPLES[f.id]}
              explainer={FIELD_EXPLAINERS[f.id]}
              open={openId === f.id}
              onToggle={() => setOpenId(openId === f.id ? null : f.id)}
            />
          ))
        )}
      </div>
      <p className="text-[13px] text-ink-muted leading-relaxed">
        Guidance on completeness only. Your client&apos;s actual figures must come from their own records, not illustrative examples.
      </p>
    </section>
  );
}

function ExampleRow({
  field,
  example,
  explainer,
  open,
  onToggle,
}: {
  field: { id: string; principleId: string; principleName: string; label: string; type: "essential" | "leadership" };
  example?: string;
  explainer?: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
      >
        <svg
          className={`w-3 h-3 text-stone-400 flex-shrink-0 transition-transform duration-150 mt-1 ${open ? "rotate-90" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-mono text-[11.5px] font-medium text-ink-muted bg-band border border-line rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">{field.id}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded flex-shrink-0 mt-0.5 ${field.type === "essential" ? "text-brand-700 bg-brand-50 border border-brand-100" : "text-amber-700 bg-amber-50 border border-amber-100"}`}>
          {field.type === "essential" ? "Essential" : "Leadership"}
        </span>
        <span className="text-[15px] text-ink leading-snug flex-1">{field.label}</span>
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          <div className="px-4 pb-4 ml-10 space-y-3">
            {example && (
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted mb-1">What a complete answer includes</p>
                <p className="text-[14px] text-ink-body leading-relaxed">{example}</p>
              </div>
            )}
            {explainer && (
              <div>
                <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted mb-1">AI field guidance</p>
                <p className="text-[14px] text-ink-body leading-relaxed">{explainer}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// An internal request-email card: the team, its asks preview, and a Copy button that
// puts the full subject + body on the clipboard (paste into Gmail / Outlook).
function EmailCard({ t, company, fy }: { t: TeamEmail; company?: string; fy: string }) {
  const [copied, setCopied] = useState(false);
  const { subject, body } = buildTeamEmail(t, { company, fy });

  async function copy() {
    const text = `${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy this email", text);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-[0_1px_3px_rgba(80,60,30,0.04)] flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[16px] font-semibold text-stone-900 leading-snug">{t.team}</p>
        <span className="font-mono text-[11.5px] text-ink-muted flex-shrink-0 mt-0.5">{t.principles.join(" · ")}</span>
      </div>
      <p className="text-[13px] text-ink-body mt-1.5 leading-relaxed">{t.intro}</p>
      <ul className="mt-2.5 space-y-1 flex-1">
        {t.asks.slice(0, 4).map((a) => (
          <li key={a} className="flex gap-2 text-[13px] text-ink-body leading-snug">
            <span className="text-stone-400 mt-[1px]">•</span>
            <span className="line-clamp-1">{a}</span>
          </li>
        ))}
        {t.asks.length > 4 && (
          <li className="text-[13px] text-ink-muted pl-4">+ {t.asks.length - 4} more in the email</li>
        )}
      </ul>
      <button
        type="button"
        onClick={copy}
        className="mt-3 inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-brand-700 bg-brand-50 border border-brand-100 hover:bg-brand-100 px-2.5 py-1.5 rounded-lg transition-colors pressable"
      >
        {copied ? (
          <>
            <svg className="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" /></svg>
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></svg>
            Copy email
          </>
        )}
      </button>
    </div>
  );
}

// A how-to guide that expands/collapses its height smoothly (grid-rows 0fr→1fr),
// the same pattern the Action Plan's principle sections use, vs the native
// <details> which snaps open.
function GuideItem({ g }: { g: Guide }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-stone-200 rounded-xl px-4 py-3 shadow-[0_1px_3px_rgba(80,60,30,0.04)]">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left text-[16px] font-semibold text-stone-900"
      >
        <svg className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${open ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        {g.title}
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
        style={{ transitionTimingFunction: "cubic-bezier(0.23, 1, 0.32, 1)" }}
      >
        <div className="min-h-0">
          <div className="mt-3 pl-6 text-[15px] text-ink-body leading-relaxed space-y-1">
            {g.body}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 mt-2 border-t border-stone-100">
              <span className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-muted">Sources</span>
              {g.sources.map((s) => (
                <a key={s.href} href={s.href} target="_blank" rel="noreferrer" className="text-[12.5px] text-brand-700 hover:text-brand-800 underline decoration-stone-300 hover:decoration-brand-500 transition-colors">{s.label} ↗</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
