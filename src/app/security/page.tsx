import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/LegalPage";
import { SUBPROCESSORS } from "@/lib/subprocessors";

export const metadata: Metadata = {
  title: "Security & Trust — Saaksh",
  description: "How Saaksh protects your data: encryption, access control, sub-processors, and our roadmap.",
};

export default function SecurityPage() {
  return (
    <LegalPage
      title="Security & trust"
      subtitle="Saaksh handles sensitive ESG and compliance data, so security is built in, not bolted on. Here is exactly how, stated plainly and without fake badges."
      updated="29 June 2026"
    >
      <Section heading="Privacy by architecture">
        <p>The <strong>free readiness tool runs entirely in your browser.</strong> Your client&apos;s intake answers, any report you upload, and the generated output are processed on your device and <strong>never leave it.</strong> The strongest data protection is data we never receive.</p>
      </Section>

      <Section heading="How we protect the Collect (Pro) tier">
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Encryption</strong> in transit (TLS) and at rest.</li>
          <li><strong>Access control</strong>, the database is locked down (row-level security) and reachable only by the server, never the browser.</li>
          <li><strong>Evidence files</strong> live in a private bucket, shared only via short-lived signed links.</li>
          <li><strong>Secrets</strong> (keys, tokens) are server-only and never shipped to the client.</li>
          <li><strong>Input handling</strong>, user-supplied content is escaped/sanitised to prevent injection.</li>
        </ul>
      </Section>

      <Section heading="Sub-processors">
        <p>The third-party services we rely on, each bound to protect the data they handle:</p>
        <ul className="mt-2 space-y-1.5">
          {SUBPROCESSORS.map((s) => (
            <li key={s.name} className="text-[13.5px] text-stone-700">
              <strong>{s.name}</strong> — {s.purpose} <span className="text-stone-500">({s.region})</span>
            </li>
          ))}
        </ul>
        <p className="mt-2">The full data-handling detail is in our <a href="/privacy" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">Privacy policy</a>.</p>
      </Section>

      <Section heading="Methodology you can audit">
        <p>Every emission factor and disclosure mapping is cited to its primary source (SEBI, ICAI, CEA, IPCC/DEFRA), with the exact table, vintage and link. We never invent figures. See <a href="/methodology" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">how we calculate</a>.</p>
      </Section>

      <Section heading="On our roadmap">
        <p>We are honest about what is in progress: <strong>ISO 27001 certification</strong> (the standard Indian enterprise procurement asks for), an <strong>India data-residency</strong> option, and a published <strong>status page</strong> with uptime history. We would rather tell you these are coming than display a badge we haven&apos;t earned.</p>
      </Section>

      <Section heading="Report a vulnerability">
        <p>Found a security issue? Please email <a href="mailto:rahulu626@gmail.com" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">rahulu626@gmail.com</a> with details. We appreciate responsible disclosure and will respond quickly. Please don&apos;t run denial-of-service tests or access data that isn&apos;t yours.</p>
      </Section>
    </LegalPage>
  );
}
