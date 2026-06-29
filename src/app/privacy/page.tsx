import type { Metadata } from "next";
import LegalPage, { Section, DraftNotice } from "@/components/LegalPage";
import { SUBPROCESSORS } from "@/lib/subprocessors";

export const metadata: Metadata = {
  title: "Privacy Policy — Saaksh",
  description: "How Saaksh handles personal data, aligned with India's DPDP Act 2023.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      subtitle="How Saaksh collects, uses and protects personal data, written in line with India's Digital Personal Data Protection Act, 2023 (DPDP Act)."
      updated="29 June 2026"
    >
      <DraftNotice />

      <Section heading="The short version">
        <ul className="list-disc pl-5 space-y-1.5">
          <li>The <strong>free readiness tool runs entirely in your browser.</strong> Your client&apos;s answers, uploaded reports and the generated report are processed on your device and are <strong>never uploaded to us.</strong></li>
          <li>The <strong>Collect (Pro)</strong> tier is login-gated and does store data you submit (data-owner contacts, the BRSR values they provide, evidence files), securely, to do its job.</li>
          <li>We use product analytics <strong>only if you opt in</strong>, and never include your clients&apos; data in it.</li>
        </ul>
      </Section>

      <Section heading="Who we are (the data fiduciary)">
        <p>Saaksh is built and operated by <strong>Rahul Upadhyay</strong> (a sole operator, pre-incorporation). For any privacy question or request, contact the grievance contact below.</p>
      </Section>

      <Section heading="What we collect, and why">
        <p><strong>Free tool (on-device, nothing uploaded):</strong> the intake form, any report you upload for detection, and the generated report stay in your browser&apos;s local storage. We do not receive them.</p>
        <p><strong>Collect / Pro tier:</strong> to chase and compile BRSR data we store the campaign details you create, the names and email addresses of the data owners you add, the values and prior-year figures they submit, and any evidence documents they upload. Purpose: to run the collection, compute emissions, and produce a draft.</p>
        <p><strong>Analytics (consent-based):</strong> if you accept analytics, we record anonymous usage events (e.g. a report was generated, a PDF was downloaded) with non-identifying properties like industry and sector. Session replay and autocapture are disabled. You can decline, or change your mind any time via &quot;Cookie settings&quot;.</p>
        <p><strong>Email you send us</strong> (e.g. support) is used only to reply.</p>
      </Section>

      <Section heading="Legal basis">
        <p>We process personal data on the basis of your <strong>consent</strong> (analytics; using the Pro tier) and for the <strong>legitimate uses</strong> permitted under the DPDP Act (e.g. providing a service you asked for, responding to your requests).</p>
      </Section>

      <Section heading="Sub-processors">
        <p>We rely on the following service providers. Each is bound to protect the data they handle on our behalf:</p>
        <div className="overflow-x-auto mt-2 -mx-1">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-stone-200 text-left">
                <th className="py-2 pr-3 font-semibold text-stone-600 text-[12px] uppercase tracking-wide">Provider</th>
                <th className="py-2 pr-3 font-semibold text-stone-600 text-[12px] uppercase tracking-wide">Purpose</th>
                <th className="py-2 pr-3 font-semibold text-stone-600 text-[12px] uppercase tracking-wide hidden sm:table-cell">Data</th>
                <th className="py-2 font-semibold text-stone-600 text-[12px] uppercase tracking-wide">Region</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {SUBPROCESSORS.map((s) => (
                <tr key={s.name}>
                  <td className="py-2.5 pr-3 font-medium text-stone-800 align-top">{s.name}</td>
                  <td className="py-2.5 pr-3 text-stone-600 align-top">{s.purpose}</td>
                  <td className="py-2.5 pr-3 text-stone-600 align-top hidden sm:table-cell">{s.data}</td>
                  <td className="py-2.5 text-stone-600 align-top whitespace-nowrap">{s.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section heading="Cross-border transfer">
        <p>Our infrastructure is hosted with the providers above, currently in the USA. Under the DPDP Act&apos;s model, transfer is permitted unless the data is to a country the Government specifically restricts (no such restriction currently applies). We are planning an India data-residency option.</p>
      </Section>

      <Section heading="Retention & deletion">
        <p><strong>Free tool:</strong> nothing is stored with us; clear your browser data and it is gone. Use &quot;Back up work&quot; to keep a copy.</p>
        <p><strong>Collect / Pro:</strong> we keep campaign data for as long as the collection is active or as you need it, and erase it on request once its purpose is served.</p>
      </Section>

      <Section heading="Your rights">
        <p>You may request access to, correction of, or erasure of your personal data, and you may withdraw consent (e.g. for analytics) at any time, as easily as you gave it. To exercise any right, contact the grievance contact below.</p>
      </Section>

      <Section heading="Security">
        <p>We use encryption in transit and at rest, access controls, and reputable infrastructure. More detail is on our <a href="/security" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Security page</a>. If you believe data has been exposed, tell us immediately.</p>
      </Section>

      <Section heading="Grievance contact">
        <p>For any privacy question, request, or complaint: <strong>Rahul Upadhyay</strong>, <a href="mailto:rahulu626@gmail.com" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">rahulu626@gmail.com</a>. We aim to respond promptly and within the timelines the DPDP Act prescribes.</p>
      </Section>
    </LegalPage>
  );
}
