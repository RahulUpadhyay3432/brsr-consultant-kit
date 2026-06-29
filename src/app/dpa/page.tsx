import type { Metadata } from "next";
import LegalPage, { Section, DraftNotice } from "@/components/LegalPage";
import { SUBPROCESSORS } from "@/lib/subprocessors";

export const metadata: Metadata = {
  title: "Data Processing — Saaksh",
  description: "How Saaksh processes data on behalf of consultants using the Collect tier.",
};

export default function DpaPage() {
  return (
    <LegalPage
      title="Data processing"
      subtitle="When you use the Collect (Pro) tier, Saaksh processes data on your behalf. This page sets out how, the substance of a Data Processing Addendum, in plain language."
      updated="29 June 2026"
    >
      <DraftNotice />

      <Section heading="Roles">
        <p>For data you collect through the Pro tier (your client&apos;s data-owner contacts and the BRSR values they submit), <strong>you</strong> determine the purpose and act as the controller/fiduciary, and <strong>Saaksh</strong> processes that data on your instructions as the processor.</p>
      </Section>

      <Section heading="Scope & purpose of processing">
        <p>We process the data only to provide the service: sending request emails and reminders, storing submitted values and evidence, computing emissions, and producing drafts, and as otherwise instructed by you. We do not use your clients&apos; data to train AI models or for our own marketing.</p>
      </Section>

      <Section heading="Confidentiality & security">
        <p>We keep the data confidential, restrict access to what is needed to run the service, and apply the safeguards described on our <a href="/security" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Security page</a> (encryption in transit and at rest, locked-down database, private evidence storage).</p>
      </Section>

      <Section heading="Sub-processors">
        <p>We engage the sub-processors listed in our <a href="/privacy" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Privacy policy</a> ({SUBPROCESSORS.map((s) => s.name).join(", ")}), each bound to equivalent protection. We&apos;ll give notice of material changes.</p>
      </Section>

      <Section heading="Your instructions & rights support">
        <p>We act on your reasonable instructions, including to correct or delete data, and we&apos;ll help you respond to a data principal&apos;s access/correction/erasure request relating to data in your campaigns.</p>
      </Section>

      <Section heading="Breach notification">
        <p>If we become aware of a personal-data breach affecting your data, we will notify you without undue delay and support the notifications required under the DPDP Act.</p>
      </Section>

      <Section heading="Return & deletion">
        <p>On request, or when a campaign&apos;s purpose is served, we return or delete the relevant data, subject to any legal retention obligation.</p>
      </Section>

      <Section heading="Contact">
        <p>To raise a data-processing matter or request a countersigned DPA: <a href="mailto:rahulu626@gmail.com" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">rahulu626@gmail.com</a>.</p>
      </Section>
    </LegalPage>
  );
}
