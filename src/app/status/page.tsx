import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Status — Saaksh",
  description: "Saaksh service status.",
};

export default function StatusPage() {
  return (
    <LegalPage
      title="System status"
      subtitle="The current operational status of Saaksh."
    >
      <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3.5">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
        <p className="text-[14px] font-semibold text-emerald-900">All systems operational</p>
      </div>

      <Section heading="Components">
        <ul className="space-y-2">
          {[
            "Free readiness tool (on-device)",
            "Collect (Pro) workspace",
            "Email delivery",
            "Document auto-fill (AI)",
          ].map((c) => (
            <li key={c} className="flex items-center justify-between border-b border-stone-100 pb-2">
              <span className="text-[14px] text-stone-700">{c}</span>
              <span className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Operational
              </span>
            </li>
          ))}
        </ul>
      </Section>

      <Section heading="Incident history">
        <p className="text-stone-600">No incidents reported. A live status page with uptime history and incident post-mortems is on our roadmap. To report an issue, email <a href="mailto:rahulu626@gmail.com" className="text-brand-700 underline decoration-stone-300 hover:decoration-brand-500">rahulu626@gmail.com</a>.</p>
      </Section>
    </LegalPage>
  );
}
