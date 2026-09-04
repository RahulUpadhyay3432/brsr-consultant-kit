import type { Metadata } from "next";
import LegalPage, { Section } from "@/components/LegalPage";
import { NoTrackToggle } from "@/components/NoTrackToggle";

export const metadata: Metadata = {
  title: "Exclude this device from analytics, Saaksh",
  description:
    "Open this page once on a device to keep it out of Saaksh's usage analytics.",
  // An internal utility page: useful to whoever holds the link, not to search.
  robots: { index: false, follow: false },
};

export default function NoTrackPage() {
  return (
    <LegalPage
      title="Exclude this device"
      subtitle="Open this page once on a laptop or phone and that browser stops being counted in Saaksh's usage analytics. Nothing to install, and no cookie banner to answer."
    >
      <NoTrackToggle />

      <Section heading="What it switches off">
        <p>
          Everything, not just Google Analytics. Saaksh loads Google Analytics,
          Mixpanel and Vercel Analytics from a single gate, so excluding the device
          stops all three from loading at all — the scripts are never fetched,
          rather than fetched and asked to ignore you.
        </p>
        <p>
          What it does not touch is the hosting layer: Vercel still records that a
          request was served, the way any web server does. Those logs are not part
          of the usage numbers you read in Analytics.
        </p>
      </Section>

      <Section heading="Doing it without opening this page">
        <p>
          Adding <strong>?notrack=1</strong> to any Saaksh URL has exactly the same
          effect, which is handy on a page you are already looking at — for example{" "}
          <strong>saaksh.co/?notrack=1</strong>. Use{" "}
          <strong>?notrack=0</strong> to clear the choice again.
        </p>
      </Section>

      <Section heading="Where the setting lives">
        <p>
          In that browser&apos;s local storage, which is why it has to be done once
          per browser and per profile, and why a private window forgets it when it
          closes. Clearing site data clears this too. It is the same setting the
          &quot;Cookie settings&quot; link in the footer writes, so the two never
          disagree.
        </p>
      </Section>
    </LegalPage>
  );
}
