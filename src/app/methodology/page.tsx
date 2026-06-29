import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "How we calculate & cite — Saaksh",
  description: "Saaksh's methodology: every factor and disclosure is cited to a primary source, and we never fabricate figures.",
};

export default function MethodologyPage() {
  return (
    <LegalPage
      title="How we calculate & cite"
      subtitle="The whole point of Saaksh is defensible, cited data. Here is exactly where every number and mapping comes from, and what we will never do."
      updated="29 June 2026"
    >
      <Section heading="The principle: nothing is invented">
        <p>Saaksh never fabricates a figure. Every value in a report is either something you entered, or a calculation from your input using a cited factor. Where data is missing, we say so, we don&apos;t fill the gap with a guess. This is what makes the output survive assurance.</p>
      </Section>

      <Section heading="Per-factor provenance">
        <p>Each emission factor we use carries its full provenance: the <strong>source</strong>, the exact <strong>table/row</strong>, the <strong>vintage</strong> (publication year), the <strong>unit</strong>, and a <strong>link</strong> to the authoritative document. You can trace any number we compute back to its origin.</p>
      </Section>

      <Section heading="Standards we align to">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>GHG Protocol</strong> Corporate and Corporate Value Chain (Scope 3) Standards, for the accounting method.</li>
          <li><strong>CEA</strong> (Central Electricity Authority) CO₂ Baseline Database, for the India grid electricity factor.</li>
          <li><strong>IPCC 2006</strong> Guidelines, for stationary/mobile fuel combustion factors.</li>
          <li><strong>DEFRA/DESNZ</strong> GHG Conversion Factors, for Scope 3 screening (travel, freight, waste).</li>
        </ul>
      </Section>

      <Section heading="Cited to SEBI & ICAI">
        <p>Every BRSR disclosure in the tool is cited to the <strong>SEBI BRSR Format</strong> and the <strong>ICAI Background Material on BRSR (Revised 2024)</strong>, with the page reference. The cross-framework mappings (BRSR ↔ GRI ↔ TCFD ↔ IFRS S1/S2 ↔ TNFD) and the MSCI/DJSI rating crosswalks are likewise documented.</p>
      </Section>

      <Section heading="Built for the assurance era">
        <p>BRSR Core now carries reasonable assurance for the largest listed companies, and assurers increasingly ask not just &quot;is the number right?&quot; but &quot;show the trail behind it.&quot; Saaksh&apos;s Collect tier captures, per figure, the named data owner, the supporting evidence document, and the cited calculation basis, an exportable data-ownership ledger aligned to what ISAE 3000 / ICAI SSAE 3000 assurers look for.</p>
      </Section>

      <Section heading="What we don't claim">
        <p>We don&apos;t claim an independent third-party audit of our calculation engine (yet), and we don&apos;t present our materiality shortlist as a finished assessment, it&apos;s a starting point for your stakeholder process. We&apos;d rather under-claim and be trusted than over-claim.</p>
      </Section>
    </LegalPage>
  );
}
