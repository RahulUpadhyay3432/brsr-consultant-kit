import type { Metadata } from "next";
import LegalPage, { Section, DraftNotice } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — Saaksh",
  description: "The terms governing your use of Saaksh.",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      subtitle="The terms on which you may use Saaksh. By using the tool you agree to these."
      updated="29 June 2026"
    >
      <DraftNotice />

      <Section heading="What Saaksh is">
        <p>Saaksh is a software tool that helps ESG consultants prepare BRSR (Business Responsibility and Sustainability Reporting) work, a free, on-device readiness tool, and a paid Collect tier for data collection and drafting. It is a tool to assist a qualified professional; it is not legal, accounting, or assurance advice.</p>
      </Section>

      <Section heading="Your responsibility for the output">
        <p>You are responsible for reviewing, verifying, and standing behind any report, draft, calculation, or filing produced with Saaksh before it is relied upon or submitted. Saaksh assists; it does not replace your professional judgement or a required independent assurance.</p>
      </Section>

      <Section heading="Acceptable use">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Use the tool for lawful BRSR/ESG preparation only.</li>
          <li>Don&apos;t attempt to break, overload, reverse-engineer, or gain unauthorised access to the service or other users&apos; data.</li>
          <li>Only upload documents and data you are authorised to handle.</li>
        </ul>
      </Section>

      <Section heading="The Pro tier & access">
        <p>The Collect (Pro) tier is access-controlled. Keep your access credentials confidential. We may suspend access for misuse or non-payment (once paid plans are live).</p>
      </Section>

      <Section heading="Availability">
        <p>We work to keep Saaksh available and accurate, but the service is provided &quot;as is&quot; without warranties. We may change, suspend, or discontinue features. We are not liable for indirect or consequential loss arising from use of the tool, to the extent permitted by law.</p>
      </Section>

      <Section heading="Data">
        <p>How we handle data is described in the <a href="/privacy" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Privacy policy</a> and <a href="/dpa" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Data processing</a> page, which form part of these terms.</p>
      </Section>

      <Section heading="Contact">
        <p>Questions about these terms: <a href="mailto:rahulu626@gmail.com" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">rahulu626@gmail.com</a>.</p>
      </Section>
    </LegalPage>
  );
}
